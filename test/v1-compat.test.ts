import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeychainHelper } from "../src";
import { createKeychainMock, installKeychain, uninstallKeychain } from "./helpers";

beforeEach(() => {
  vi.useFakeTimers();
  uninstallKeychain();
});
afterEach(() => {
  vi.useRealTimers();
  uninstallKeychain();
});

describe("compatibilidad con la API de callbacks de la v1", () => {
  it("sin extensión: callback con el mismo objeto que la v1 (más error y result) y console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cb = vi.fn();
    KeychainHelper.requestVote("a", "p", "b", 100, cb);
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toEqual({
      success: false,
      message: "Hive Keychain is not installed.",
      id: "vote",
      error: "not_installed",
      result: null,
    });
    expect(errorSpy).toHaveBeenCalledWith("Hive Keychain is not installed.");
  });

  it("requestLogin sin extensión responde con id 'login'", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const cb = vi.fn();
    KeychainHelper.requestLogin("a", "reto", cb);
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb.mock.calls[0][0]).toMatchObject({ success: false, id: "login" });
  });

  it("mantiene los ids de la v1", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const cb = vi.fn();
    KeychainHelper.requestConversion("a", "1.000", true, cb);
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb.mock.calls[0][0].id).toBe("conversion");
  });

  it("entrega al callback la respuesta de la extensión sin modificarla", async () => {
    const response = {
      success: true,
      error: null,
      result: { id: "abc", tx_id: "abc", confirmed: true },
      message: "ok",
      data: { type: "vote" },
      request_id: 7,
    };
    installKeychain(createKeychainMock((_m, _a, cb) => cb(response)));
    const cb = vi.fn();
    KeychainHelper.requestVote("a", "p", "b", 100, cb);
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).toHaveBeenCalledWith(response);
  });

  it("si la extensión ya está, no espera los 120 ms de la v1", async () => {
    const mock = createKeychainMock();
    installKeychain(mock);
    KeychainHelper.requestVote("a", "p", "b", 100, vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls).toHaveLength(1);
  });

  it("el callback se llama una sola vez aunque la extensión responda dos veces", async () => {
    installKeychain(
      createKeychainMock((_m, _a, cb) => {
        const r = { success: true, error: null, result: null, message: "" };
        cb(r);
        cb(r);
      })
    );
    const cb = vi.fn();
    KeychainHelper.requestVote("a", "p", "b", 100, cb);
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("un error en el callback del usuario no se convierte en dispatch_failed", async () => {
    installKeychain(
      createKeychainMock((_m, _a, cb) =>
        cb({ success: true, error: null, result: null, message: "" })
      )
    );
    const cb = vi.fn(() => {
      throw new Error("error del usuario");
    });
    KeychainHelper.requestVote("a", "p", "b", 100, cb);
    // El error se relanza en un setTimeout aparte, como un error no capturado normal.
    await expect(vi.advanceTimersByTimeAsync(0)).rejects.toThrow("error del usuario");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("method_not_supported si la extensión instalada es antigua", async () => {
    const mock = createKeychainMock();
    delete mock.keychain.requestSavingsOperation;
    installKeychain(mock);
    const cb = vi.fn();
    KeychainHelper.requestSavingsOperation("a", "a", "1.000", "HBD", "deposit", "", cb);
    await vi.advanceTimersByTimeAsync(0);
    expect(cb.mock.calls[0][0]).toMatchObject({
      success: false,
      error: "method_not_supported",
      id: "savingsOperation",
    });
  });
});
