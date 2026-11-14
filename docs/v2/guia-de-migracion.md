# Guía de migración: de la v1 a la v2

**Resumen:** si usas `KeychainHelper.requestXxx(..., callback)` desde `"keychain-helper"`, lo normal es que **no tengas que cambiar nada**. Revisa los puntos 1 a 5 por si te afecta alguno. El punto 6 es opcional: sirve para empezar a usar las promesas.

```bash
npm install keychain-helper@2
```

---

## 1. `"Memo"` ya no compila en broadcast, signTx, customJson y autoridades

Solo afecta a TypeScript. La extensión ya rechazaba esas llamadas en tiempo de ejecución, así que el código que cambia aquí nunca funcionó.

**Antes (compilaba, pero Keychain respondía `error: "incomplete"`):**

```ts
KeychainHelper.requestBroadcast("yo", ops, "Memo", cb);
KeychainHelper.requestAddAccountAuthority("yo", "otra", "Memo", 1, cb);
```

**Después:**

```ts
KeychainHelper.requestBroadcast("yo", ops, "Posting", cb); // o "Active"
KeychainHelper.requestAddAccountAuthority("yo", "otra", "Posting", 1, cb);
```

Afecta a:

- `requestBroadcast`, `requestSignTx` y `requestCustomJson` (parámetro `key`);
- `requestAddAccountAuthority`, `requestRemoveAccountAuthority`, `requestAddKeyAuthority` y `requestRemoveKeyAuthority` (parámetro `role`).

## 2. La respuesta "no instalado" tiene dos campos más y llega más tarde

**Antes:**

```js
{ success: false, message: "Hive Keychain is not installed.", id: "vote" } // a los ~120 ms
```

**Después:**

```js
{ success: false, error: "not_installed", result: null, message: "Hive Keychain is not installed.", id: "vote" } // hasta ~1 s
```

Si comparabas `response.message` o `response.id`, sigue funcionando.

Ahora también puedes comprobar `response.error === "not_installed"`. Hay dos códigos nuevos posibles:

- `"method_not_supported"`: la extensión es antigua y no tiene ese método.
- `"dispatch_failed"`: la llamada a la extensión lanzó una excepción.

En la v1 esos dos casos dejaban el callback **sin llamar nunca**.

El retraso de ~1 s solo ocurre cuando la extensión **no** está. Si está, la petición sale de inmediato; antes siempre se esperaban 120 ms.

## 3. `requestLogin` ahora muestra el título

En la v1, el cuarto parámetro (`title`) llegaba a la extensión en la posición de `rpc`. **No tienes que cambiar tu código**: el mismo código de antes ahora muestra el título.

```ts
KeychainHelper.requestLogin("yo", challenge, cb, "Entrar en Mi App");
```

Si para sortear el bug pasabas un nodo RPC como título, quítalo.

## 4. Importa siempre desde la raíz del paquete

El paquete ahora declara `exports`, así que las rutas internas ya no se pueden importar.

**Antes (funcionaba por casualidad):**

```ts
import { KeychainHelper } from "keychain-helper/dist/requests/index";
import { HiveKeychain } from "keychain-helper/dist/interfaces/index";
```

**Después:**

```ts
import { KeychainHelper, type HiveKeychain } from "keychain-helper";
```

Los tipos (`HiveKeychain`, `CommentOptions`, `KeyType`, `KeychainResponse`, etc.) ahora se exportan desde la raíz. En la v1 no se exportaban.

## 5. Otros cambios pequeños

- **`requestAddAccount`:** el cuarto parámetro `rpc` se acepta pero se ignora, porque la extensión nunca lo admitió.
- **`KeychainHelperUtils.isKeychainInstalled`:**
  - Misma firma.
  - Ahora llama al callback en cuanto detecta la extensión, en lugar de esperar siempre `delayMs`.
  - Si la extensión se inyecta durante `delayMs`, también la detecta.
- **SSR / Node:** antes, llamar a cualquier método sin `window` lanzaba `ReferenceError`. Ahora responde `not_installed`.
- **`require()`:** ahora funciona. En la v1, ni `require` ni `import` funcionaban en Node sin bundler.

## 6. Opcional: pasar a promesas

Los métodos de la API con promesas tienen los mismos parámetros, sin el callback. Los opcionales que iban detrás del callback (`rpc`, `enforce`, `title`, `pair_id`, etc.) ocupan su lugar.

**Antes:**

```ts
KeychainHelper.requestTransfer("yo", "tu", "1.000", "", "HIVE", (res) => {
  if (res.success) mostrarOk(res.result.tx_id);
  else mostrarError(res.message);
}, true);
```

**Después:**

```ts
import { KeychainHelperAsync, KeychainError } from "keychain-helper";

try {
  const res = await KeychainHelperAsync.requestTransfer("yo", "tu", "1.000", "", "HIVE", true);
  mostrarOk(res.result?.tx_id);
} catch (e) {
  if (e instanceof KeychainError) mostrarError(e.message); // e.code, e.response
}
```

### Login

**Antes:**

```ts
KeychainHelper.requestLogin("yo", challenge, (res) => { /* ... */ }, "Mi App");
```

**Después:**

```ts
const res = await KeychainHelperAsync.requestLogin("yo", challenge, "Mi App");
```

### Detección

**Antes:**

```ts
KeychainHelperUtils.isKeychainInstalled(window, (ok) => setInstalada(ok), 500);
```

**Después:**

```ts
setInstalada(await waitForKeychain({ timeoutMs: 500 }));
```

### Opciones propias (tiempo de detección y timeout de petición)

```ts
const keychain = createKeychainClient({
  detection: { timeoutMs: 3000 },
  requestTimeoutMs: 120_000, // desactivado por defecto
});
```

## 7. Novedades disponibles

- **`requestSavingsOperation`:** depósito y retiro de ahorros. Requiere una extensión de febrero de 2026 o posterior.
- **`pair_id`:** último parámetro de `requestRecurrentTransfer`. Requiere una extensión de noviembre de 2025 o posterior.
- **`partnerUsername` y `partnerFee`:** últimos parámetros de `requestSwap`.
- **Tipos de respuesta**, por ejemplo:

  ```ts
  KeychainHelper.requestVote(..., (res: TransactionResponse) => res.result?.tx_id)
  ```
