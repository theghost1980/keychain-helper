import { getKeychain, waitForKeychain } from "../core/detection";

const isKeychainInstalledLogic = (
  windowObj: Window,
  callback: (installed: boolean) => void,
  delayMs: number = 120
): void => {
  if (!windowObj) {
    // Igual que la v1: sin window no hay extensión; se responde tras delayMs.
    setTimeout(() => callback(false), delayMs);
    return;
  }
  // Un error del callback del usuario se relanza fuera de la promesa para no
  // dejar un rechazo sin capturar.
  const invoke = (installed: boolean) => {
    try {
      callback(installed);
    } catch (error) {
      setTimeout(() => {
        throw error;
      }, 0);
    }
  };
  waitForKeychain({ timeoutMs: delayMs }, windowObj).then(invoke, () =>
    invoke(false)
  );
};

const CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";

const randomIndex = (max: number): number => {
  const cryptoObj =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: Crypto }).crypto
      : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    // Rechazo de valores fuera de rango para no sesgar la distribución.
    const limit = Math.floor(256 / max) * max;
    const buf = new Uint8Array(1);
    do {
      cryptoObj.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
};

function generateRandomStringLogic(
  length: number,
  includeTimestamp: boolean
): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(randomIndex(CHARACTERS.length));
  }
  return result + (includeTimestamp ? "-" + Date.now().toString() : "");
}

export const KeychainHelperUtils = {
  /**
   * Comprueba si la extensión Hive Keychain está instalada.
   *
   * Desde la v2 resuelve en cuanto la detecta (sin esperar siempre `delayMs`) y la sigue
   * buscando hasta `delayMs` si aún no se ha inyectado. El callback se llama siempre de
   * forma asíncrona y una sola vez. Para una versión con promesa usa `waitForKeychain`.
   *
   * @param windowObj El objeto `window` (normalmente el global).
   * @param callback Recibe `true` si se detectó la extensión.
   * @param [delayMs=120] Tiempo máximo de espera en milisegundos.
   *
   * @example
   * KeychainHelperUtils.isKeychainInstalled(window, (installed) => {
   *   if (!installed) console.warn("Instala Hive Keychain");
   * }, 1000);
   */
  isKeychainInstalled: isKeychainInstalledLogic,

  /**
   * Genera una cadena aleatoria en minúsculas (`a-z0-9`) de longitud `length`.
   * Opcionalmente añade `-<timestamp>`. Útil para permlinks de comentarios.
   * Usa `crypto.getRandomValues` cuando está disponible.
   *
   * No la uses como `challenge` de login: el challenge debe generarlo tu servidor.
   *
   * @example
   * KeychainHelperUtils.generateRandomString(6, false); // "a1b2c3"
   * KeychainHelperUtils.generateRandomString(6, true);  // "x9y8z7-1763100000000"
   */
  generateRandomString: generateRandomStringLogic,

  /** Espera a la extensión y resuelve `true`/`false`. Ver {@link waitForKeychain}. */
  waitForKeychain,

  /** Devuelve `window.hive_keychain` si ya está inyectado. Ver {@link getKeychain}. */
  getKeychain,
};
