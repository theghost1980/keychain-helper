import type { HiveKeychain, WaitForKeychainOptions } from "../types";

export const DEFAULT_DETECTION_TIMEOUT_MS = 1000;
export const DEFAULT_DETECTION_INTERVAL_MS = 50;

/** Devuelve `window` si existe (navegador) o `undefined` (SSR, Node, workers). */
export const getWindow = (): Window | undefined =>
  typeof window === "undefined" ? undefined : window;

/**
 * Devuelve `window.hive_keychain` si ya está inyectado, sin esperar.
 *
 * @param win Objeto `window` a inspeccionar. Por defecto el `window` global.
 * @returns El objeto de la extensión, o `undefined` si no está (o si no hay `window`).
 */
export const getKeychain = (
  win: Window | undefined = getWindow()
): HiveKeychain | undefined => {
  const keychain = win?.hive_keychain;
  return keychain !== null && typeof keychain === "object"
    ? keychain
    : undefined;
};

/**
 * Espera a que la extensión Hive Keychain se inyecte en la página.
 *
 * - Si ya está presente, resuelve `true` de inmediato (en el siguiente microtask).
 * - Si no, la busca cada `intervalMs` hasta `timeoutMs` y resuelve `true` en cuanto aparece.
 * - Si se agota el tiempo, resuelve `false`.
 * - Si no hay `window` (SSR, Node), resuelve `false` sin esperar.
 *
 * Nunca rechaza.
 *
 * @example
 * const installed = await waitForKeychain({ timeoutMs: 2000 });
 * if (!installed) mostrarAvisoDeInstalacion();
 */
export const waitForKeychain = (
  options: WaitForKeychainOptions = {},
  win: Window | undefined = getWindow()
): Promise<boolean> => {
  const timeoutMs = sanitize(options.timeoutMs, DEFAULT_DETECTION_TIMEOUT_MS);
  const intervalMs = Math.max(
    1,
    sanitize(options.intervalMs, DEFAULT_DETECTION_INTERVAL_MS)
  );

  if (getKeychain(win)) return Promise.resolve(true);
  if (!win || timeoutMs === 0) return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (getKeychain(win)) return resolve(true);
      const elapsed = Date.now() - start;
      if (elapsed >= timeoutMs) return resolve(false);
      setTimeout(tick, Math.min(intervalMs, timeoutMs - elapsed));
    };
    setTimeout(tick, Math.min(intervalMs, timeoutMs));
  });
};

const sanitize = (value: number | undefined, fallback: number): number =>
  typeof value === "number" && isFinite(value) && value >= 0 ? value : fallback;
