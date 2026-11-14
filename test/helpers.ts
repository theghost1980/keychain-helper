import { vi } from "vitest";
import type { KeychainResponse } from "../src/types";

import fixtureJson from "./fixtures/extension-signatures.json";

const fixture = fixtureJson as { signatures: Record<string, string[]> };

/** Firmas de `window.hive_keychain` copiadas de la extensión (ver fixtures). */
export const EXTENSION_SIGNATURES = fixture.signatures;

export type Responder = (
  method: string,
  args: unknown[],
  callback: (r: KeychainResponse) => void
) => void;

/** Responde `success: true` en el siguiente tick, como hace la extensión real. */
export const okResponder: Responder = (method, _args, callback) => {
  setTimeout(
    () =>
      callback({
        success: true,
        error: null,
        result: { id: "tx", tx_id: "tx" },
        message: `${method} ok`,
        request_id: 1,
      }),
    0
  );
};

export interface KeychainMock {
  calls: { method: string; args: unknown[] }[];
  keychain: Record<string, (...args: unknown[]) => void>;
}

/**
 * Doble de `window.hive_keychain`: registra los argumentos recibidos y responde
 * llamando al argumento en la posición `callback` de la firma real de la extensión.
 */
export const createKeychainMock = (
  responder: Responder = okResponder
): KeychainMock => {
  const mock: KeychainMock = { calls: [], keychain: {} };
  for (const [method, params] of Object.entries(EXTENSION_SIGNATURES)) {
    const cbIndex = params.indexOf("callback");
    mock.keychain[method] = vi.fn((...args: unknown[]) => {
      mock.calls.push({ method, args });
      const cb = args[cbIndex];
      if (typeof cb === "function") responder(method, args, cb as never);
    });
  }
  return mock;
};

export const installKeychain = (mock: KeychainMock) => {
  (window as unknown as { hive_keychain: unknown }).hive_keychain = mock.keychain;
};

export const uninstallKeychain = () => {
  delete (window as unknown as { hive_keychain?: unknown }).hive_keychain;
};
