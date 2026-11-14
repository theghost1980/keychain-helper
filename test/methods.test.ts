import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeychainHelper, KeychainHelperAsync } from "../src";
import { METHOD_SPECS } from "../src/core/methods";
import {
  EXTENSION_SIGNATURES,
  createKeychainMock,
  installKeychain,
  uninstallKeychain,
  type KeychainMock,
} from "./helpers";

const ops: [string, object][] = [["vote", { voter: "a", author: "b", permlink: "c", weight: 1 }]];

/**
 * Caso por método: `before` son los argumentos que van antes del callback y `after`
 * los opcionales que van detrás. Se pasan todos los opcionales para comprobar que
 * cada uno llega a su posición.
 */
const CASES: Record<string, { before: unknown[]; after: unknown[] }> = {
  requestEncodeMessage: { before: ["alice", "bob", "#hola", "Memo"], after: [] },
  requestEncodeWithKeys: { before: ["alice", ["STM1", "STM2"], "#hola", "Posting"], after: [] },
  requestVerifyKey: { before: ["alice", "#cifrado", "Posting"], after: [] },
  requestSignBuffer: { before: ["alice", "mensaje", "Active"], after: ["https://rpc", "Título"] },
  requestAddAccountAuthority: { before: ["alice", "bob", "Active", 2], after: ["https://rpc"] },
  requestRemoveAccountAuthority: { before: ["alice", "bob", "Posting"], after: ["https://rpc"] },
  requestAddKeyAuthority: { before: ["alice", "STM1", "Active", 1], after: ["https://rpc"] },
  requestRemoveKeyAuthority: { before: ["alice", "STM1", "Active"], after: ["https://rpc"] },
  requestBroadcast: { before: ["alice", ops, "Posting"], after: ["https://rpc"] },
  requestSignTx: { before: ["alice", { operations: ops }, "Active"], after: ["https://rpc"] },
  requestPost: {
    before: ["alice", "Título", "Cuerpo", "hive", null, "{}", "mi-post", null],
    after: ["https://rpc"],
  },
  requestVote: { before: ["alice", "mi-post", "bob", 10000], after: ["https://rpc"] },
  requestCustomJson: { before: [null, "follow", "Posting", "[]", "Seguir"], after: ["https://rpc"] },
  requestTransfer: { before: ["alice", "bob", "1.000", "memo", "HIVE"], after: [true, "https://rpc"] },
  requestSavingsOperation: {
    before: ["alice", "alice", "1.000", "HBD", "deposit", "memo"],
    after: ["https://rpc"],
  },
  requestSendToken: { before: ["alice", "bob", "1.000", "memo", "DEC"], after: ["https://rpc"] },
  requestDelegation: { before: [null, "bob", "1.000", "HP"], after: ["https://rpc"] },
  requestWitnessVote: { before: [null, "testigo", true], after: ["https://rpc"] },
  requestProxy: { before: [null, ""], after: ["https://rpc"] },
  requestPowerUp: { before: ["alice", "bob", "5.000"], after: ["https://rpc"] },
  requestPowerDown: { before: ["alice", "5.000"], after: ["https://rpc"] },
  requestCreateClaimedAccount: {
    before: ["alice", "nueva", { o: 1 }, { a: 1 }, { p: 1 }, "STM-memo"],
    after: ["https://rpc"],
  },
  requestCreateProposal: {
    before: ["alice", "alice", "Asunto", "permlink", "10.000 HBD", "2026-12-01T00:00:00", "2027-12-01T00:00:00", "[]"],
    after: ["https://rpc"],
  },
  requestRemoveProposal: { before: ["alice", "[216]", "[]"], after: ["https://rpc"] },
  requestUpdateProposalVote: { before: ["alice", "[216]", true, "[]"], after: ["https://rpc"] },
  requestAddAccount: { before: ["alice", { posting: "5K..." }], after: [] },
  requestConversion: { before: ["alice", "5.000", true], after: ["https://rpc"] },
  requestRecurrentTransfer: {
    before: [null, "bob", "5.000", "HIVE", "memo", 24, 7],
    after: ["https://rpc", 3],
  },
  requestSwap: {
    before: ["alice", "HIVE", "DEC", 5, 1, [{ step: 1 }]],
    after: ["https://rpc", "socio", 0.5],
  },
};

let mock: KeychainMock;
beforeEach(() => {
  vi.useFakeTimers();
  mock = createKeychainMock();
  installKeychain(mock);
});
afterEach(() => {
  vi.useRealTimers();
  uninstallKeychain();
});

describe("tabla de métodos", () => {
  it("cubre todos los métodos de la extensión salvo handshake y signedCall", () => {
    const wrapped = Object.keys(METHOD_SPECS).sort();
    const expected = Object.keys(EXTENSION_SIGNATURES)
      .filter((m) => m !== "requestHandshake" && m !== "requestSignedCall")
      .sort();
    expect(wrapped).toEqual(expected);
    expect(Object.keys(CASES).sort()).toEqual(expected);
  });

  it.each(Object.keys(METHOD_SPECS))(
    "%s: la posición del callback coincide con la firma de la extensión",
    (method) => {
      const params = EXTENSION_SIGNATURES[method];
      expect(METHOD_SPECS[method as keyof typeof METHOD_SPECS].callbackIndex).toBe(
        params.indexOf("callback")
      );
      const { before, after } = CASES[method];
      expect(before.length).toBe(params.indexOf("callback"));
      expect(before.length + 1 + after.length).toBeLessThanOrEqual(params.length);
    }
  );
});

describe("API con callbacks: los argumentos llegan en orden", () => {
  it.each(Object.keys(CASES))("%s", async (method) => {
    const { before, after } = CASES[method];
    const cb = vi.fn();
    (KeychainHelper as unknown as Record<string, (...a: unknown[]) => void>)[method](
      ...before,
      cb,
      ...after
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls).toHaveLength(1);
    const { method: called, args } = mock.calls[0];
    expect(called).toBe(method);
    expect(args.slice(0, before.length)).toEqual(before);
    expect(typeof args[before.length]).toBe("function");
    expect(args.slice(before.length + 1)).toEqual(after);
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toMatchObject({ success: true });
  });
});

describe("API con promesas: los argumentos llegan en orden", () => {
  it.each(Object.keys(CASES))("%s", async (method) => {
    const { before, after } = CASES[method];
    const promise = (
      KeychainHelperAsync as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>
    )[method](...before, ...after);
    await vi.advanceTimersByTimeAsync(0);
    const { method: called, args } = mock.calls[0];
    expect(called).toBe(method);
    expect(args.slice(0, before.length)).toEqual(before);
    expect(typeof args[before.length]).toBe("function");
    expect(args.slice(before.length + 1)).toEqual(after);
    await vi.advanceTimersByTimeAsync(0);
    await expect(promise).resolves.toMatchObject({ success: true });
  });
});

describe("casos especiales", () => {
  it("requestLogin envía title en la posición de title, no en la de rpc", async () => {
    KeychainHelper.requestLogin("alice", "reto", vi.fn(), "Mi App");
    await vi.advanceTimersByTimeAsync(0);
    const { method, args } = mock.calls[0];
    expect(method).toBe("requestSignBuffer");
    expect(args[0]).toBe("alice");
    expect(args[1]).toBe("reto");
    expect(args[2]).toBe("Posting");
    expect(typeof args[3]).toBe("function");
    expect(args[4]).toBeNull();
    expect(args[5]).toBe("Mi App");
  });

  it("KeychainHelperAsync.requestLogin usa la misma posición", async () => {
    const p = KeychainHelperAsync.requestLogin("alice", "reto", "Mi App");
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls[0].args[4]).toBeNull();
    expect(mock.calls[0].args[5]).toBe("Mi App");
    await vi.advanceTimersByTimeAsync(0);
    await p;
  });

  it("requestAddAccount no reenvía el rpc (la extensión no lo acepta)", async () => {
    KeychainHelper.requestAddAccount("alice", { posting: "k" }, vi.fn(), "https://rpc");
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls[0].args).toHaveLength(3);
  });

  it("KeychainHelperAsync.requestSavingsOperation usa memo '' si se omite", async () => {
    const p = KeychainHelperAsync.requestSavingsOperation("alice", "alice", "1.000", "HBD", "withdraw");
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls[0].args[5]).toBe("");
    expect(typeof mock.calls[0].args[6]).toBe("function");
    await vi.advanceTimersByTimeAsync(0);
    await p;
  });

  it("rellena con undefined si se omiten argumentos previos al callback", async () => {
    (KeychainHelperAsync.requestProxy as unknown as (...a: unknown[]) => Promise<unknown>)(null);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.calls[0].args[1]).toBeUndefined();
    expect(typeof mock.calls[0].args[2]).toBe("function");
  });

  it("requestSignedCall y requestHandshake no se exponen", () => {
    expect((KeychainHelper as unknown as Record<string, unknown>).requestSignedCall).toBeUndefined();
    expect((KeychainHelper as unknown as Record<string, unknown>).requestHandshake).toBeUndefined();
  });
});
