import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeychainError, KeychainHelperAsync, createKeychainClient } from "../src";
import {
  createKeychainMock,
  installKeychain,
  uninstallKeychain,
  type Responder,
} from "./helpers";

const unhandled = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  uninstallKeychain();
  unhandled.mockReset();
  process.on("unhandledRejection", unhandled);
});
afterEach(() => {
  process.off("unhandledRejection", unhandled);
  vi.useRealTimers();
  uninstallKeychain();
});

const failResponder: Responder = (_m, _a, cb) =>
  setTimeout(
    () =>
      cb({
        success: false,
        error: "user_cancel",
        result: null,
        message: "Request was canceled by the user.",
        request_id: 1,
      }),
    0
  );

const silentResponder: Responder = () => {};

describe("KeychainHelperAsync", () => {
  it("resuelve con la respuesta cuando success es true", async () => {
    installKeychain(createKeychainMock());
    const p = KeychainHelperAsync.requestVote("a", "p", "b", 100);
    await vi.advanceTimersByTimeAsync(0);
    await expect(p).resolves.toMatchObject({ success: true, result: { tx_id: "tx" } });
  });

  it("rechaza con KeychainError keychain_error cuando la extensión responde success false", async () => {
    installKeychain(createKeychainMock(failResponder));
    const p = KeychainHelperAsync.requestTransfer("a", "b", "1.000", "", "HIVE");
    const assertion = expect(p).rejects.toMatchObject({
      name: "KeychainError",
      code: "keychain_error",
      method: "requestTransfer",
      message: "Request was canceled by the user.",
      response: { error: "user_cancel" },
    });
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
    await expect(p).rejects.toBeInstanceOf(KeychainError);
    await expect(p).rejects.toBeInstanceOf(Error);
  });

  it("rechaza con not_installed tras el tiempo de detección si no hay extensión", async () => {
    const p = KeychainHelperAsync.requestVote("a", "p", "b", 100);
    const assertion = expect(p).rejects.toMatchObject({ code: "not_installed" });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("respeta las opciones de detección del cliente", async () => {
    const client = createKeychainClient({ detection: { timeoutMs: 100 } });
    const p = client.requestVote("a", "p", "b", 100);
    const spy = vi.fn();
    p.catch(spy);
    await vi.advanceTimersByTimeAsync(99);
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(spy.mock.calls[0][0]).toMatchObject({ code: "not_installed" });
  });

  it("espera a una extensión que se inyecta tarde", async () => {
    const p = KeychainHelperAsync.requestVote("a", "p", "b", 100);
    await vi.advanceTimersByTimeAsync(400);
    installKeychain(createKeychainMock());
    await vi.advanceTimersByTimeAsync(100);
    await expect(p).resolves.toMatchObject({ success: true });
  });

  it("rechaza con method_not_supported si la extensión no tiene el método", async () => {
    const mock = createKeychainMock();
    delete mock.keychain.requestSavingsOperation;
    installKeychain(mock);
    const p = KeychainHelperAsync.requestSavingsOperation("a", "a", "1.000", "HBD", "deposit");
    const assertion = expect(p).rejects.toMatchObject({ code: "method_not_supported" });
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
  });

  it("rechaza con dispatch_failed si la extensión lanza", async () => {
    const mock = createKeychainMock();
    mock.keychain.requestVote = () => {
      throw new Error("boom");
    };
    installKeychain(mock);
    const p = KeychainHelperAsync.requestVote("a", "p", "b", 1);
    const assertion = expect(p).rejects.toMatchObject({
      code: "dispatch_failed",
      message: "boom",
    });
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
  });

  it("sin requestTimeoutMs espera indefinidamente (no hay timeout por defecto)", async () => {
    installKeychain(createKeychainMock(silentResponder));
    const spy = vi.fn();
    KeychainHelperAsync.requestVote("a", "p", "b", 1).then(spy, spy);
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(spy).not.toHaveBeenCalled();
  });

  it("con requestTimeoutMs rechaza con timeout e ignora la respuesta tardía", async () => {
    let late: ((r: unknown) => void) | undefined;
    installKeychain(
      createKeychainMock((_m, _a, cb) => {
        late = cb as never;
      })
    );
    const client = createKeychainClient({ requestTimeoutMs: 5000 });
    const p = client.requestVote("a", "p", "b", 1);
    const spy = vi.fn();
    p.then(spy, spy);
    await vi.advanceTimersByTimeAsync(4999);
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({ code: "timeout" });
    late?.({ success: true, error: null, result: null, message: "" });
    await vi.advanceTimersByTimeAsync(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("el timeout empieza al entregar la petición, no durante la detección", async () => {
    installKeychain(createKeychainMock(silentResponder));
    const client = createKeychainClient({ requestTimeoutMs: 100 });
    const spy = vi.fn();
    client.requestVote("a", "p", "b", 1).catch(spy);
    await vi.advanceTimersByTimeAsync(100);
    expect(spy.mock.calls[0][0]).toMatchObject({ code: "timeout" });
  });

  it("la respuesta anterior al timeout cancela el temporizador", async () => {
    installKeychain(createKeychainMock());
    const client = createKeychainClient({ requestTimeoutMs: 100 });
    const p = client.requestVote("a", "p", "b", 1);
    await vi.advanceTimersByTimeAsync(0);
    await expect(p).resolves.toMatchObject({ success: true });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("no deja promesas rechazadas sin capturar si el usuario no usa la promesa", async () => {
    vi.useRealTimers();
    const client = createKeychainClient({ detection: { timeoutMs: 10 } });
    // El usuario captura el error: no debe haber ningún otro rechazo interno.
    await client.requestVote("a", "p", "b", 1).catch(() => {});
    await new Promise((r) => setTimeout(r, 20));
    expect(unhandled).not.toHaveBeenCalled();
  });
});
