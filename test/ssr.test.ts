// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

describe("entorno sin window (SSR, Node)", () => {
  it("no hay window en este entorno", () => {
    expect(typeof window).toBe("undefined");
  });

  it("importar el paquete no lanza", async () => {
    await expect(import("../src")).resolves.toBeDefined();
  });

  it("waitForKeychain y getKeychain no lanzan y devuelven 'no instalado' sin esperar", async () => {
    const { waitForKeychain, getKeychain } = await import("../src");
    expect(getKeychain()).toBeUndefined();
    const start = Date.now();
    await expect(waitForKeychain({ timeoutMs: 5000 })).resolves.toBe(false);
    expect(Date.now() - start).toBeLessThan(100);
  });

  it("la API de callbacks responde not_installed sin lanzar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { KeychainHelper } = await import("../src");
    const response = await new Promise((resolve) =>
      KeychainHelper.requestVote("a", "p", "b", 1, resolve)
    );
    expect(response).toMatchObject({ success: false, error: "not_installed" });
  });

  it("la API con promesas rechaza con not_installed", async () => {
    const { KeychainHelperAsync } = await import("../src");
    await expect(KeychainHelperAsync.requestVote("a", "p", "b", 1)).rejects.toMatchObject({
      code: "not_installed",
    });
  });

  it("isKeychainInstalled con window indefinido devuelve false", async () => {
    const { KeychainHelperUtils } = await import("../src");
    const installed = await new Promise((resolve) =>
      KeychainHelperUtils.isKeychainInstalled(undefined as unknown as Window, resolve)
    );
    expect(installed).toBe(false);
  });
});
