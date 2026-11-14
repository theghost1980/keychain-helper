import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeychainHelperUtils, getKeychain, waitForKeychain } from "../src";
import { createKeychainMock, installKeychain, uninstallKeychain } from "./helpers";

beforeEach(() => {
  vi.useFakeTimers();
  uninstallKeychain();
});
afterEach(() => {
  vi.useRealTimers();
  uninstallKeychain();
});

describe("waitForKeychain", () => {
  it("resuelve true de inmediato si la extensión ya está presente", async () => {
    installKeychain(createKeychainMock());
    const spy = vi.fn();
    waitForKeychain({ timeoutMs: 5000 }).then(spy);
    await vi.advanceTimersByTimeAsync(0);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("detecta una inyección tardía antes del timeout", async () => {
    const spy = vi.fn();
    waitForKeychain({ timeoutMs: 1000, intervalMs: 50 }).then(spy);
    await vi.advanceTimersByTimeAsync(300);
    expect(spy).not.toHaveBeenCalled();
    installKeychain(createKeychainMock());
    await vi.advanceTimersByTimeAsync(50);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("resuelve false si la extensión aparece después del timeout", async () => {
    const spy = vi.fn();
    waitForKeychain({ timeoutMs: 200, intervalMs: 50 }).then(spy);
    await vi.advanceTimersByTimeAsync(200);
    expect(spy).toHaveBeenCalledWith(false);
    installKeychain(createKeychainMock());
    await vi.advanceTimersByTimeAsync(500);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("resuelve false si la extensión no está", async () => {
    const spy = vi.fn();
    waitForKeychain().then(spy);
    await vi.advanceTimersByTimeAsync(999);
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it("con timeoutMs 0 comprueba una vez y no espera", async () => {
    const spy = vi.fn();
    waitForKeychain({ timeoutMs: 0 }).then(spy);
    await vi.advanceTimersByTimeAsync(0);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it("ignora opciones inválidas y usa los valores por defecto", async () => {
    const spy = vi.fn();
    waitForKeychain({ timeoutMs: -5, intervalMs: Number.NaN }).then(spy);
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it("no toma como extensión un valor que no es un objeto", () => {
    (window as unknown as { hive_keychain: unknown }).hive_keychain = "x";
    expect(getKeychain()).toBeUndefined();
  });
});

describe("KeychainHelperUtils.isKeychainInstalled (firma v1)", () => {
  it("llama al callback con true, de forma asíncrona, si está presente", async () => {
    installKeychain(createKeychainMock());
    const cb = vi.fn();
    KeychainHelperUtils.isKeychainInstalled(window, cb);
    expect(cb).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("espera hasta delayMs (120 por defecto) y llama con false si no aparece", async () => {
    const cb = vi.fn();
    KeychainHelperUtils.isKeychainInstalled(window, cb);
    await vi.advanceTimersByTimeAsync(119);
    expect(cb).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(cb).toHaveBeenCalledWith(false);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("detecta la extensión si se inyecta dentro de delayMs", async () => {
    const cb = vi.fn();
    KeychainHelperUtils.isKeychainInstalled(window, cb, 500);
    await vi.advanceTimersByTimeAsync(200);
    installKeychain(createKeychainMock());
    await vi.advanceTimersByTimeAsync(60);
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("acepta un windowObj indefinido y devuelve false", async () => {
    const cb = vi.fn();
    installKeychain(createKeychainMock()); // aunque el window global la tenga
    KeychainHelperUtils.isKeychainInstalled(undefined as unknown as Window, cb);
    await vi.advanceTimersByTimeAsync(120);
    expect(cb).toHaveBeenCalledWith(false);
  });
});

describe("KeychainHelperUtils.generateRandomString", () => {
  it("genera minúsculas y dígitos de la longitud pedida", () => {
    const s = KeychainHelperUtils.generateRandomString(32, false);
    expect(s).toMatch(/^[a-z0-9]{32}$/);
  });
  it("añade -timestamp cuando se pide", () => {
    vi.setSystemTime(1763100000000);
    const s = KeychainHelperUtils.generateRandomString(6, true);
    expect(s).toMatch(/^[a-z0-9]{6}-1763100000000$/);
  });
});
