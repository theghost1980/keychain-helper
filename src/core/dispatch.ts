import type {
  HiveKeychain,
  KeychainHelperErrorCode,
  KeychainResponse,
  WaitForKeychainOptions,
} from "../types";
import { getKeychain, getWindow, waitForKeychain } from "./detection";

/** Métodos de la extensión que envuelve keychain-helper. */
export type WrappedMethod = Exclude<
  keyof HiveKeychain,
  "requestHandshake" | "requestSignedCall"
>;

export const NOT_INSTALLED_MESSAGE = "Hive Keychain is not installed.";

/** Respuesta sintética que genera keychain-helper cuando la petición no llega a la extensión. */
export const helperResponse = (
  code: KeychainHelperErrorCode,
  id: string,
  message: string
): KeychainResponse => ({
  success: false,
  error: code,
  result: null,
  message,
  id,
});

export interface DispatchOptions {
  /** Método de la extensión a llamar. */
  method: WrappedMethod;
  /** Argumentos en el orden de la extensión, **sin** el callback. */
  args: readonly unknown[];
  /** Posición que ocupa el callback en la firma de la extensión. */
  callbackIndex: number;
  /** Identificador corto usado en las respuestas sintéticas (compatibilidad v1). */
  id: string;
  detection?: WaitForKeychainOptions;
  /** Escribir `console.error` cuando no se detecta la extensión (comportamiento v1). */
  logNotInstalled?: boolean;
  /**
   * Se llama una sola vez con la respuesta. `helperCode` solo viene informado
   * cuando la respuesta la generó keychain-helper y no la extensión.
   */
  onResponse: (
    response: KeychainResponse,
    helperCode?: KeychainHelperErrorCode
  ) => void;
  /** Se llama justo después de entregar la petición a la extensión. */
  onDispatched?: () => void;
}

/**
 * Único punto por el que pasan todas las peticiones: espera a la extensión,
 * comprueba que el método existe, inserta el callback en su posición y entrega
 * la petición. Garantiza que `onResponse` se llama como máximo una vez y que
 * ningún error queda como promesa rechazada sin capturar.
 */
export const dispatch = (options: DispatchOptions): void => {
  const { method, args, callbackIndex, id, onResponse } = options;
  let settled = false;

  const deliver = (
    response: KeychainResponse,
    helperCode?: KeychainHelperErrorCode
  ) => {
    if (settled) return;
    settled = true;
    onResponse(response, helperCode);
  };

  // Un error lanzado por el callback del usuario no debe convertirse en una
  // promesa rechazada sin capturar: se relanza fuera de la cadena de promesas,
  // igual que ocurría en la v1 (que llamaba al callback desde un setTimeout).
  const safely = (fn: () => void) => {
    try {
      fn();
    } catch (error) {
      setTimeout(() => {
        throw error;
      }, 0);
    }
  };

  const run = (found: boolean) => {
    const keychain = getKeychain();
    if (!found || !keychain) {
      if (options.logNotInstalled) console.error(NOT_INSTALLED_MESSAGE);
      return safely(() =>
        deliver(
          helperResponse("not_installed", id, NOT_INSTALLED_MESSAGE),
          "not_installed"
        )
      );
    }

    const fn = keychain[method] as unknown;
    if (typeof fn !== "function") {
      return safely(() =>
        deliver(
          helperResponse(
            "method_not_supported",
            id,
            `The installed Hive Keychain does not support ${method}. Please update the extension.`
          ),
          "method_not_supported"
        )
      );
    }

    const callArgs: unknown[] = args.slice();
    while (callArgs.length < callbackIndex) callArgs.push(undefined);
    callArgs.splice(callbackIndex, 0, (response: KeychainResponse) =>
      deliver(response)
    );

    try {
      (fn as (...a: unknown[]) => void).apply(keychain, callArgs);
    } catch (error) {
      if (settled) {
        // El error vino del callback del usuario, llamado de forma síncrona.
        setTimeout(() => {
          throw error;
        }, 0);
        return;
      }
      return safely(() =>
        deliver(
          helperResponse(
            "dispatch_failed",
            id,
            error instanceof Error ? error.message : String(error)
          ),
          "dispatch_failed"
        )
      );
    }
    if (options.onDispatched) safely(options.onDispatched);
  };

  waitForKeychain(options.detection, getWindow()).then(run, () => run(false));
};
