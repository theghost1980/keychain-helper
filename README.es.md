# 🔑 Keychain Helper

[English](https://github.com/theghost1980/keychain-helper/blob/main/README.md) · **Español**

**0 dependencias · ~2,2 kB min+gzip · TypeScript · ESM + CommonJS · seguro en SSR**

> Facilita la interacción con Hive Keychain en aplicaciones Web3 modernas, sin dependencias.

Keychain Helper es una capa fina y tipada sobre `window.hive_keychain`, la API que inyecta la extensión [Hive Keychain](https://hive-keychain.com/). Resuelve los problemas típicos de integración:

- espera a que la extensión termine de inyectarse en lugar de fallar si tarda;
- responde de forma predecible cuando la extensión no está;
- ofrece la misma API con **callbacks** (compatible con la v1) y con **promesas**;
- tipa las entradas **y las respuestas**;
- se puede importar en SSR (Next.js, Nuxt, Node) sin romper.

---

## 🔗 Demo en vivo

> 👉 [https://keychain-helper-playground.netlify.app](https://keychain-helper-playground.netlify.app)

---

## 📦 Instalación

```bash
npm install keychain-helper
```

Funciona con `import` (ESM) y con `require` (CommonJS), y trae sus tipos TypeScript. No instala ninguna otra dependencia ni necesita polyfills (`buffer`, `crypto`, etc.).

> El usuario final necesita la extensión [Hive Keychain](https://hive-keychain.com/) en su navegador.

---

## ⚡ Uso rápido

### Con promesas (recomendado)

```ts
import { KeychainHelperAsync, KeychainError } from "keychain-helper";

try {
  const res = await KeychainHelperAsync.requestVote(
    "tu_usuario", // cuenta que vota
    "permlink-del-post", // permlink (va ANTES que el autor)
    "autor", // autor del post
    10000 // peso: 10000 = 100 %
  );
  console.log("✅ Voto emitido. tx:", res.result?.tx_id);
} catch (e) {
  if (e instanceof KeychainError) {
    if (e.code === "not_installed") console.warn("Instala Hive Keychain");
    else console.error("❌ No se pudo votar:", e.message);
  }
}
```

Cada promesa:

- **se resuelve** con la respuesta de Keychain cuando `success` es `true`;
- **se rechaza** con un `KeychainError` en cualquier otro caso. `error.code` indica el motivo:

| `code`                 | Significado                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `not_installed`        | No se detectó la extensión (o no hay `window`, por ejemplo en SSR).         |
| `method_not_supported` | La extensión instalada es antigua y no tiene ese método.                    |
| `dispatch_failed`      | La llamada a la extensión lanzó una excepción.                              |
| `timeout`              | Venció `requestTimeoutMs` (solo si lo activaste).                           |
| `keychain_error`       | Keychain respondió `success: false` (usuario canceló, error del nodo, etc.). |

`error.response` contiene la respuesta completa y `error.method` el método llamado.

### Con callbacks (API de la v1)

```ts
import { KeychainHelper } from "keychain-helper";

KeychainHelper.requestVote("tu_usuario", "permlink-del-post", "autor", 10000, (response) => {
  if (response.success) {
    console.log("✅ Voto realizado!", response.result?.tx_id);
  } else {
    console.error("❌ Error al votar:", response.message);
  }
});
```

Si la extensión no está, el callback recibe:

```js
{ success: false, error: "not_installed", result: null, message: "Hive Keychain is not installed.", id: "vote" }
```

---

## 🔍 Detección de la extensión

La extensión inyecta `window.hive_keychain` con un retraso variable, y a veces tarda más de lo esperado. Antes de cada petición, keychain-helper **espera hasta 1 segundo** comprobando cada 50 ms, y continúa **en cuanto la detecta**. Si ya está presente, no espera nada.

También puedes comprobarlo tú:

```ts
import { waitForKeychain, getKeychain } from "keychain-helper";

const instalada = await waitForKeychain({ timeoutMs: 2000, intervalMs: 100 }); // true | false, nunca rechaza
const keychain = getKeychain(); // window.hive_keychain o undefined, sin esperar
```

La función de la v1 sigue disponible con la misma firma:

```ts
KeychainHelperUtils.isKeychainInstalled(window, (instalada) => { /* ... */ }, 500);
```

> ℹ️ Desde la v2 responde en cuanto detecta la extensión, en lugar de esperar siempre `delayMs`.

### Cliente con opciones propias

```ts
import { createKeychainClient } from "keychain-helper";

const keychain = createKeychainClient({
  detection: { timeoutMs: 3000, intervalMs: 100 },
  requestTimeoutMs: 120_000, // desactivado por defecto
});

await keychain.requestTransfer("yo", "tu", "1.000", "Gracias", "HIVE");
```

**Sobre `requestTimeoutMs`.** Está desactivado por defecto porque el usuario puede tardar lo que quiera en aprobar el popup. Actívalo si necesitas recuperarte de un caso conocido: el service worker de la extensión (Manifest V3) puede dormirse y dejar la petición sin respuesta. Usa valores generosos. Al vencer, la promesa se rechaza con `code: "timeout"`, pero el popup de Keychain puede seguir abierto.

---

## 📋 Métodos disponibles

Todos existen en `KeychainHelper` (callbacks) y en `KeychainHelperAsync` / `createKeychainClient()` (promesas).

En la versión con promesas se quita el callback: los parámetros opcionales que en la extensión van detrás del callback (`rpc`, `enforce`, `title`, `pair_id`, etc.) pasan a ocupar su lugar.

<small>

| Método                          | Qué hace                                                                    | Parámetros (sin callback)                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `requestLogin`                  | Login: firma un challenge con la clave Posting.                             | `username, challenge, title?`                                                                  |
| `requestSignBuffer`             | Firma un mensaje arbitrario.                                                | `account \| null, message, key, rpc?, title?`                                                  |
| `requestEncodeMessage`          | Cifra un mensaje (debe empezar por `#`) para otra cuenta.                   | `username, receiver, message, key`                                                             |
| `requestEncodeWithKeys`         | Cifra un mensaje para varias claves públicas.                               | `username, publicKeys, message, key`                                                           |
| `requestVerifyKey`              | Descifra un mensaje `#...`; demuestra que el usuario controla la clave.     | `account, message, key`                                                                        |
| `requestVote`                   | Vota un post o comentario.                                                  | `account, permlink, author, weight, rpc?`                                                      |
| `requestPost`                   | Publica un post o comentario.                                               | `account, title, body, parent_perm, parent_account, json_metadata, permlink, comment_options, rpc?` |
| `requestCustomJson`             | Emite un `custom_json`.                                                     | `account \| null, id, key, json, display_msg, rpc?`                                            |
| `requestBroadcast`              | Emite operaciones arbitrarias.                                              | `account, operations, key, rpc?`                                                               |
| `requestSignTx`                 | Firma una transacción sin emitirla.                                         | `account, tx, key, rpc?`                                                                       |
| `requestTransfer`               | Transfiere HIVE o HBD.                                                      | `account, to, amount, memo, currency, enforce?, rpc?`                                          |
| `requestSavingsOperation`       | Deposita en ahorros o retira de ahorros. **Nuevo en v2.**                   | `username, to, amount, currency, "deposit" \| "withdraw", memo, rpc?`                          |
| `requestRecurrentTransfer`      | Transferencia recurrente.                                                   | `username \| null, to, amount, currency, memo, recurrence, executions, rpc?, pair_id?`         |
| `requestSendToken`              | Transfiere un token de Hive Engine.                                         | `account, to, amount, memo, currency, rpc?`                                                    |
| `requestDelegation`             | Delega HP (o la retira con `"0.000"`).                                      | `username \| null, delegatee, amount, "HP" \| "VESTS", rpc?`                                   |
| `requestPowerUp`                | HIVE → HP.                                                                  | `username, recipient, hive, rpc?`                                                              |
| `requestPowerDown`              | Inicia o cancela un power down.                                             | `username, hive_power, rpc?`                                                                   |
| `requestConversion`             | Convierte HBD ↔ HIVE.                                                       | `username, amount, collaterized, rpc?`                                                         |
| `requestSwap`                   | Intercambio con Keychain Swaps.                                             | `username \| null, startToken, endToken, amount, slippage, steps, rpc?, partnerUsername?, partnerFee?` |
| `requestWitnessVote`            | Vota o retira el voto a un testigo.                                         | `username \| null, witness, vote, rpc?`                                                        |
| `requestProxy`                  | Fija o quita (`""`) un proxy de gobernanza.                                 | `username \| null, proxy, rpc?`                                                                |
| `requestCreateProposal`         | Crea una propuesta del DHF.                                                 | `username, receiver, subject, permlink, daily_pay, start, end, extensions, rpc?`               |
| `requestRemoveProposal`         | Elimina propuestas del DHF.                                                 | `username, proposal_ids, extensions, rpc?`                                                     |
| `requestUpdateProposalVote`     | Apoya o retira el apoyo a propuestas.                                       | `username, proposal_ids, approve, extensions, rpc?`                                            |
| `requestAddAccountAuthority`    | Concede autoridad de cuenta (multifirma).                                   | `account, authorizedUsername, role, weight, rpc?`                                              |
| `requestRemoveAccountAuthority` | Retira una autoridad de cuenta.                                             | `account, authorizedUsername, role, rpc?`                                                      |
| `requestAddKeyAuthority`        | Añade una clave pública como autoridad.                                     | `account, authorizedKey, role, weight, rpc?`                                                   |
| `requestRemoveKeyAuthority`     | Retira una clave pública de las autoridades.                                | `account, authorizedKey, role, rpc?`                                                           |
| `requestCreateClaimedAccount`   | Crea una cuenta con un token reclamado.                                     | `username, new_account, owner, active, posting, memo, rpc?`                                    |
| `requestAddAccount`             | Añade una cuenta a Keychain con sus claves.                                 | `username, keys`                                                                               |

</small>

**Formatos que exige la extensión:**

- Cantidades de HIVE, HBD y HP como **cadena con 3 decimales** (`"1.000"`), y VESTS con 6.
- `daily_pay` con el formato `"10.000 HBD"`.
- Fechas con el formato `"2026-12-01T00:00:00"`.
- `json`, `json_metadata`, `comment_options`, `proposal_ids` y `extensions` como **JSON serializado** (`JSON.stringify`).

**Claves:**

- `key` acepta `"Posting"`, `"Active"` o `"Memo"` en las peticiones de mensajes.
- En `requestBroadcast`, `requestSignTx` y `requestCustomJson`, y en el `role` de las autoridades, solo se acepta `"Posting"` o `"Active"`: la extensión rechaza `"Memo"`.

**No incluidos:**

- `requestSignedCall`: la extensión lo marca como deprecado y ya no hace nada (nunca responde).
- `requestHandshake`: solo confirma que la página tiene el content script, no que la extensión esté despierta. Ver [INFO.md](https://github.com/theghost1980/keychain-helper/blob/main/INFO.md).

Utilidades extra en `KeychainHelperUtils`:

- `generateRandomString(length, includeTimestamp)`: útil para permlinks.
- `isKeychainInstalled`, `waitForKeychain` y `getKeychain`.

---

## 🛠️ Ejemplos

### 🔐 Login

```ts
import { KeychainHelperAsync } from "keychain-helper";

// 1. Tu servidor genera un challenge único y lo envía al cliente.
const challenge = await fetch("/api/challenge").then((r) => r.text());

// 2. El usuario lo firma con su clave Posting.
const res = await KeychainHelperAsync.requestLogin("tu_usuario", challenge, "Entrar en Mi App");

// 3. Tu servidor verifica la firma (res.result) contra la clave pública Posting de la cuenta.
await fetch("/api/login", {
  method: "POST",
  body: JSON.stringify({ username: "tu_usuario", signature: res.result, publicKey: res.publicKey }),
});
```

> ⚠️ Firmar en el cliente no autentica a nadie por sí solo: la verificación tiene que ocurrir en tu servidor.

### 💬 Comentar un post

```ts
import { KeychainHelperAsync, KeychainHelperUtils } from "keychain-helper";

const autorPadre = "theghost1980";
const permlinkPadre = "mi-post";
const permlink = `re-${autorPadre}-${KeychainHelperUtils.generateRandomString(6, true)}`;

await KeychainHelperAsync.requestPost(
  "tu_usuario",
  "", // los comentarios no llevan título
  "¡Excelente post!",
  permlinkPadre,
  autorPadre,
  JSON.stringify({ tags: ["hive"], app: "mi-app/1.0", format: "markdown" }),
  permlink,
  null // sin comment_options
);
```

### 💸 Transferencia con memo cifrado

```ts
// Si el memo empieza por "#", Keychain lo cifra con la clave Memo.
await KeychainHelperAsync.requestTransfer("yo", "tu", "1.500", "#mensaje privado", "HBD");
```

### 🏦 Ahorros

```ts
await KeychainHelperAsync.requestSavingsOperation("yo", "yo", "10.000", "HBD", "deposit");
```

### 🧩 Custom JSON

```ts
await KeychainHelperAsync.requestCustomJson(
  null, // el usuario elige la cuenta
  "follow",
  "Posting",
  JSON.stringify(["follow", { follower: "yo", following: "theghost1980", what: ["blog"] }]),
  "Seguir a @theghost1980"
);
```

---

## 🧪 Entornos

- **Navegadores de escritorio** con la extensión Hive Keychain (Chromium y Firefox). El navegador integrado de la app móvil de Keychain no se ha probado con este paquete.
- **Bundlers:** Vite, Webpack, Next.js, etc. El paquete declara `exports` para ESM y CommonJS y `sideEffects: false`.
- **SSR / Node:** importar el paquete es seguro. Las peticiones responden `not_installed` porque no hay `window`.
- **TypeScript:** tipos incluidos, incluida la ampliación de `window.hive_keychain`.
- Compilado a ES2015.

> Se recomienda HTTPS en producción. Keychain funciona en `http://localhost` durante el desarrollo.

---

## 🧑‍💻 Desarrollo

```bash
npm install
```

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

```bash
npm run test:smoke
```

```bash
npm run size
```

```bash
node scripts/check-extension-signatures.mjs
```

- `npm test`: pruebas con Vitest y un `window.hive_keychain` simulado.
- `npm run test:smoke`: empaqueta, instala el `.tgz` en un directorio temporal y lo prueba con Node, TypeScript y Vite.
- `npm run size`: tamaño minificado y comprimido con gzip.
- `check-extension-signatures.mjs`: compara las firmas con la extensión publicada en GitHub.

---

## 🤝 Contribuciones

¡Contribuciones, mejoras y sugerencias son bienvenidas! Abre un issue o envía un pull request.

## 📜 Licencia

MIT.

## 📣 Créditos

Inspirado en el ecosistema Hive y en la necesidad de herramientas simples y robustas para Web3.

Desarrollado con ❤️ por @theghost1980

## 📫 Contacto

¿Tienes ideas o quieres colaborar?
Contáctame: [@theghost1980](https://github.com/theghost1980/) / [Peakd](https://peakd.com/@theghost1980)

> Más información: [propósito del proyecto y notas técnicas (INFO.md)](https://github.com/theghost1980/keychain-helper/blob/main/INFO.md) · [Cambios (CHANGELOG.md)](https://github.com/theghost1980/keychain-helper/blob/main/CHANGELOG.md) · [Migrar desde la v1](https://github.com/theghost1980/keychain-helper/blob/main/docs/v2/guia-de-migracion.md)
