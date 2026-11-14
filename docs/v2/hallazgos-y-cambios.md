# v2.0.0: hallazgos y cambios

Rama `v2`, noviembre de 2026.

**Fuente de verdad consultada:** `public/hive_keychain.js`, `src/content-scripts/hive/web-interface/{index,input-validation,response.logic}.ts` y `src/background/hive/requests/operations/` del repo `hive-keychain/hive-keychain-extension`, rama master. El último cambio en `hive_keychain.js` es el commit `6bb7da68` del 2026-02-03 ("feature(savings)"). Las firmas quedan copiadas en `test/fixtures/extension-signatures.json`.

**Cómo se verificó en general:**

- `npm run typecheck`, `npm test` (133 pruebas) y `npm run build`.
- `npm run test:smoke`: `npm pack`, instalación del `.tgz` en un directorio temporal, `import` y `require` desde Node, tipos con TypeScript en tres modos de resolución, y build con Vite.
- `node scripts/check-extension-signatures.mjs`: compara con la extensión publicada; 0 diferencias el 2026-11-14.

Nada de esto prueba contra la extensión real: ver la sección "Pendiente de prueba manual" del [checklist](./checklist-publicacion.md).

## 1. Defectos de la lista inicial

| # | Defecto | Dónde estaba | ¿Confirmado? | Qué se hizo | Cómo se verificó |
|---|---|---|---|---|---|
| D1 | El README dice "promesas y callbacks" pero solo hay callbacks | `README.md`, sección Características | Sí | Se añadió la API con promesas (ver M2) y se reescribió el README | `test/async.test.ts`; README revisado |
| D2 | El ejemplo de `requestVote` del README pasa `author, permlink` | `README.md` (v1), Uso rápido | Sí: la extensión es `(account, permlink, author, weight, callback, rpc)` | Ejemplo corregido, con aviso explícito del orden en el README y en el JSDoc | `methods.test.ts` → `requestVote` comprueba el orden |
| D3 | El README lista `requestDecodeMessage`, que no existe | `README.md` (v1), tabla de métodos | Sí: el método es `requestVerifyKey` (tipo `decode`) | Tabla reescrita | Revisión manual |
| D4 | La tabla de métodos del README está incompleta | `README.md` (v1) | Sí: listaba 8 de 29 | Tabla con los 30 métodos y sus parámetros | Revisión manual contra `METHOD_SPECS` |
| D5 | JSDoc con nombres inexistentes | `src/utils/index.ts` (`KeychainHelperUtil`, `generateRandomString` suelto); `src/requests/index.ts` (`PermlinkUtils`, `author` sin definir, `requestLoginLogic`) | Sí. Además varios ejemplos usaban `response.tx_id` (es `response.result.tx_id`) y `"SBD"`/`percent_hbd: 100` (en Hive es HBD, y `percent_hbd` va en puntos básicos) | JSDoc reescrito en `src/requests/index.ts`, `src/async.ts`, `src/utils/index.ts`, `src/types.ts` | `grep` de los nombres; `npm run typecheck` |
| D6 | `isKeychainInstalled` espera 120 ms fijos y comprueba una vez | `src/utils/index.ts:4` (v1) | Sí | Se apoya en `waitForKeychain` (M1). Misma firma: si está, responde ya; si no, sigue buscando hasta `delayMs` | `detection.test.ts` → bloque `isKeychainInstalled (firma v1)` |
| D7 | Todas las respuestas son `any` | Todo `src/requests/index.ts` | Sí | Tipos en `src/types.ts` sacados de `createMessage` (`operations.utils.ts`) y de `HiveTxUtils` (ver M3) | `npm run typecheck`; prueba de tipos en la prueba de humo |
| D8 | `requestSignedCall` definido pero no exportado | `src/requests/index.ts:317` (v1) | Sí | **Eliminado** del código. Se mantiene en el tipo `HiveKeychain` marcado `@deprecated`. En la extensión actual solo hace `console.warn` y **nunca llama al callback**: un wrapper con promesa se quedaría colgado para siempre | `methods.test.ts` → "requestSignedCall y requestHandshake no se exponen" |
| D9 | `"Memo"` aceptado donde no aplica | Firmas de broadcast, signTx, customJson y autoridades (v1) | Sí, en parte. `input-validation.ts` usa `authority = valid('Posting','Active')` para `broadcast` y `signTx`, y para `role` en las cuatro de autoridad. `custom` usa `valid('Posting','Active')`. En `decode`, `encode`, `encodeWithKeys` y `signBuffer` sí se acepta `Memo` | Nuevo tipo `AuthorityKeyType`. Se estrecha **solo** en esos siete métodos | Prueba de humo: `@ts-expect-error` en `requestBroadcast(..., "Memo")` |
| D10 | Faltan `requestSavingsOperation` y `pair_id` | — | Sí: `requestSavingsOperation` (commit `6bb7da68`, 2026-02-03); `pair_id` (commit `f6a5a387`, 2025-11-20) | Añadidos en las dos API | `methods.test.ts` (tabla) |
| D11 | Acceso directo a `window`: ¿rompe sin `window`? | `src/requests/index.ts` (v1) | **En parte.** Importar no fallaba (el acceso estaba dentro de las funciones), pero **llamar** a cualquier método en SSR lanzaba `ReferenceError: window is not defined` | `getWindow()` con `typeof window` | `test/ssr.test.ts` (entorno Node); prueba de humo en Node ESM y CJS |
| D12 | ~30 funciones con el mismo bloque repetido | `src/requests/index.ts` (v1, 1814 líneas) | Sí | Un único ayudante `dispatch` (`src/core/dispatch.ts`) y una tabla `METHOD_SPECS` (`src/core/methods.ts`). Sin cambio externo salvo lo anotado en la sección 3 | `v1-compat.test.ts`; `methods.test.ts` |
| D13 | URLs de plantilla en `package.json` | `repository`, `bugs`, `homepage` | Sí: `git remote -v` → `github.com/theghost1980/keychain-helper` | URLs reales | Revisión de `package.json` |
| D14 | `main`/`module` al mismo ESM, sin `type` ni `exports` | `package.json` (v1) | Sí. Comprobado instalando `keychain-helper@1.0.0` desde npm en Node 24: tanto `require("keychain-helper")` como `import("keychain-helper")` fallan con `Cannot find module '.../dist/requests/index'`. El ESM que genera `tsc` tiene imports relativos sin extensión, que Node no resuelve. Funcionaba en bundlers (Webpack, Vite) pero no en Node, SSR ni tests con Node. Además, `dist/` no traía `global.d.ts` | tsup genera ESM (`.js`) y CJS (`.cjs`). `"type": "module"`, mapa `exports` con `types` por condición, `sideEffects: false` | Prueba de humo: Node ESM, Node CJS y TS `bundler`/`node16` ESM/CJS |
| D15 | `global.d.ts` no llega a `dist` | `src/global.d.ts` (v1) | Sí: `tsc` no copia `.d.ts` de entrada | La ampliación `declare global { interface Window { hive_keychain?: HiveKeychain } }` vive en `src/types.ts` y tsup la incluye en `dist/index.d.ts` | Prueba de humo: `window.hive_keychain?.requestVote?.(...)` compila en el proyecto consumidor |

## 2. Defectos que encontré además

| # | Defecto | Dónde | Qué se hizo | Cómo se verificó |
|---|---|---|---|---|
| N1 | **`requestLogin` pasaba `title` como `rpc`.** La firma es `requestSignBuffer(account, message, key, callback, rpc, title)` y la v1 llamaba `(..., callback, title)`. La extensión usaba el título como nodo RPC y el popup nunca mostraba el título | `src/requests/index.ts:11` (v1) | Se envía `(username, challenge, "Posting", cb, null, title)` | `methods.test.ts` → "requestLogin envía title en la posición de title" |
| N2 | Si la extensión instalada no tenía el método (versión antigua), `window.hive_keychain?.requestX?.(...)` no hacía nada y el callback **nunca se llamaba** | Todas las funciones (v1) | Respuesta `error: "method_not_supported"` | `v1-compat.test.ts`, `async.test.ts` |
| N3 | Si la llamada a la extensión lanzaba una excepción, se propagaba sin llamar al callback | Todas las funciones (v1) | Respuesta `error: "dispatch_failed"`. Si la excepción viene del callback del usuario (llamado de forma síncrona), se relanza aparte y no se llama dos veces | `async.test.ts`, `v1-compat.test.ts` |
| N4 | `requestSwap` no aceptaba `partnerUsername` ni `partnerFee` (en la extensión desde mayo de 2024) | `src/interfaces/index.ts` (v1) | Añadidos como opcionales al final | `methods.test.ts` |
| N5 | `requestAddAccount` reenviaba `rpc`, que la extensión no acepta (`requestAddAccount(username, keys, callback)`) | v1 | Se mantiene en la firma (compatibilidad) pero no se reenvía. Marcado como ignorado en el JSDoc | `methods.test.ts` → "requestAddAccount no reenvía el rpc" |
| N6 | `requestTransfer` solo aceptaba `HIVE \| HBD`. La extensión valida `HIVE, HBD, TESTS, TBD` (testnet) | Tipos (v1) | Tipo `HiveCurrency` ampliado (no rompe nada) | `npm run typecheck` |
| N7 | `requestHandshake` estaba tipado con `(response: any) => void`, pero la extensión llama al callback **sin argumentos** | `src/interfaces/index.ts` (v1) | Tipo corregido a `() => void`, con nota | Lectura de `hive_keychain.js` (línea 1121) |
| N8 | Los tipos de entrada no se exportaban: `src/index.ts` solo exportaba `KeychainHelper` y `KeychainHelperUtils` | `src/index.ts` (v1) | Se exportan todos los tipos públicos | Prueba de humo (imports de tipos) |
| N9 | `generateRandomString` usaba `Math.random` y un alfabeto con mayúsculas que luego pasaba a minúsculas, así que las letras salían el doble de veces que los dígitos | `src/utils/index.ts` (v1) | Alfabeto `a-z0-9` directo y `crypto.getRandomValues` con rechazo de sesgo. Misma forma de salida | `detection.test.ts` → `generateRandomString` |
| N10 | El script `prepare: tsc` hacía que `npm ci` compilara y dejara en `dist/` archivos viejos que el build nuevo no limpiaba | `package.json` (v1) | Se quitó `prepare`. `prepublishOnly` ejecuta typecheck, tests, build y prueba de humo | Manual |
| N11 | La documentación oficial de la extensión está desactualizada (último cambio 2024-05-10) | Externo | `INFO.md` apunta a `hive_keychain.js` como fuente de verdad, y hay un script que detecta cambios en las firmas | `scripts/check-extension-signatures.mjs` |

## 3. Mejoras implementadas y decisiones de diseño

### M1. Detección robusta

`waitForKeychain({ timeoutMs = 1000, intervalMs = 50 })`:

- Si la extensión ya está, resuelve `true` en el siguiente microtask.
- Si no está, la busca por sondeo y resuelve `false` al agotar el tiempo.
- Sin `window`, resuelve `false` de inmediato.
- Nunca rechaza.
- Valores no válidos (negativos, `NaN`) usan los valores por defecto.

`getKeychain()` devuelve el objeto solo si es un objeto. Si es una cadena u otro valor, devuelve `undefined`.

**Decisión: 1 s por defecto para las peticiones.** La v1 avisaba "no instalado" a los 120 ms; ahora tarda hasta 1 s. Es lo conservador entre dos riesgos:

- Un tiempo corto da falsos "no instalado" cuando la inyección es lenta. Es el fallo documentado por Ecency y Mantequilla-Soft.
- Un tiempo largo retrasa el aviso a quien no tiene la extensión.

Se puede ajustar con `createKeychainClient({ detection })`. La API de callbacks usa el valor por defecto, porque añadir un parámetro de opciones habría cambiado las firmas.

**Decisión: `isKeychainInstalled` conserva 120 ms por defecto.** Es la firma pública de la v1. Lo que cambia es que ahora responde antes cuando detecta la extensión, y que la sigue buscando durante esos 120 ms. Con `windowObj` indefinido responde `false` tras `delayMs`, como la v1, y no recurre al `window` global.

### M2. API con promesas: objeto paralelo

**Elegido: un objeto paralelo** (`KeychainHelperAsync`) más una fábrica (`createKeychainClient`) con las mismas firmas sin callback.

**Descartado:**

- **Detectar la ausencia de callback:** varios métodos tienen opcionales detrás del callback (`rpc`, `enforce`, `title`, `pair_id`). `requestTransfer(a, b, c, d, e, undefined, true)` sería ambiguo. Además, un callback olvidado por error convertiría en silencio la llamada en una promesa que nadie captura.
- **Un sufijo** (`requestVoteAsync`): duplica la superficie de `KeychainHelper` y mezcla en el mismo objeto métodos que se comportan distinto.
- La fábrica permite opciones por cliente sin estado global mutable.

**Semántica:**

- La promesa resuelve solo si `success === true`.
- En cualquier otro caso rechaza con `KeychainError`, una subclase de `Error` con `code`, `response` y `method`.
- Solo rechaza la promesa que devuelve al usuario; no crea promesas internas que puedan quedar rechazadas. Lo comprueba un test que escucha `unhandledRejection`.

**Detalle: memo opcional en `requestSavingsOperation`.** En la API con promesas, `memo` es opcional y vale `""` por defecto, igual que hace la propia extensión cuando se omite.

### M3. Respuestas tipadas

`KeychainResponse<T>` sigue el mensaje que arma `createMessage` en la extensión:

- `success`, `error`, `result`, `data`, `message`, `messageKey`, `messageParams`, `request_id` y `publicKey`.
- `id` solo aparece en las respuestas que genera keychain-helper.

Tipos de `result` por método:

| Métodos | Tipo de `result` | Origen |
|---|---|---|
| Operaciones que emiten transacción | `TransactionResult { id, tx_id, confirmed?, isUsingMultisig? }` | `HiveTxUtils.sendOperation` |
| `requestSignBuffer` / `requestLogin` | `string` (firma) | Firma en `sign-buffer.ts`; además devuelven `publicKey` |
| `requestEncodeMessage`, `requestVerifyKey` | `string` | `encode-memo.ts` y `decode-memo.ts` |
| `requestEncodeWithKeys` | `Record<string, string>` | `encode-with-keys.ts` |
| `requestSignTx`, `requestSwap`, `requestAddAccount` | `unknown` | No pude confirmar la forma exacta |

`error` es `unknown`: la extensión devuelve cadenas como `"user_cancel"`, `"incomplete"` o `"request_limit"`, o el error del nodo tal cual.

**Pendiente:** confirmar con la extensión real la forma de `result` en `requestSignTx`, `requestSwap` y `requestAddAccount`.

### M4. Comprobación de que la extensión responde (`requestHandshake`): **no se incluye**

Investigado en `public/hive_keychain.js` y `src/content-scripts/hive/web-interface/index.ts`:

1. `requestHandshake` dispara el evento `swHandshake_hive`.
2. El **content script** lo responde con un `postMessage` de tipo `hive_keychain_handshake`, **sin pasar por el service worker**.
3. La extensión llama al callback **sin argumentos** y guarda **un único** `handshake_callback`.

**Por qué no sirve como ping:** el content script vive en la página y responde aunque el service worker MV3 esté dormido. Así que el handshake no detecta el problema documentado en 2026 (firmas colgadas por el worker dormido).

**Por qué no funcionaba en la v1** (según `INFO.md`):

- El autor esperaba un `response` con `success`, y la extensión no pasa argumentos.
- Si se hacían llamadas seguidas, la última pisaba el callback de las anteriores.

**Alternativa ofrecida:** `requestTimeoutMs` (M5) y la documentación del caso.

### M5. Timeout por petición

`createKeychainClient({ requestTimeoutMs })` está desactivado por defecto y solo existe en la API con promesas.

- El reloj empieza cuando la petición se entrega a la extensión, no durante la detección.
- Al vencer, rechaza con `code: "timeout"`.
- Una respuesta tardía se ignora.
- Si la respuesta llega antes, se limpia el temporizador; un test comprueba que no queda ninguno pendiente.

No se añadió a la API de callbacks porque habría cambiado sus firmas.

## 4. Decisiones de no cambiar

| Tema | Decisión | Motivo |
|---|---|---|
| Firmas de la API de callbacks | Idénticas a la v1, salvo el estrechamiento de tipos D9 | Requisito de compatibilidad |
| `console.error("Hive Keychain is not installed.")` en la API de callbacks | Se mantiene | Comportamiento visible de la v1. La API con promesas no escribe en consola |
| Mensaje `"Hive Keychain is not installed."` e `id` por método | Se mantienen, incluido `id: "conversion"` para `requestConversion` | Compatibilidad: puede haber código que compare esos valores |
| Respuesta "not installed" | Se **añaden** `error` y `result: null` | Añadir campos no rompe a quien lee `success`, `message` o `id` |
| Callback de la API v1 cuando la extensión ya está | Se llama cuando responde la extensión (asíncrono, como antes) | Sin cambio |
| Validación de entradas (3 decimales, formato de fechas) | **No** se valida en el cliente | Lo valida la extensión con Joi y responde `error: "incomplete"`. Duplicarlo añadiría código y otra fuente de verdad que se puede desincronizar. Se documenta en el README |
| VSC/Magi, otras wallets, MCP | No se implementan | Fuera de alcance. Ninguno de los métodos VSC existe en `hive_keychain.js` (comprobado) |
| `generateRandomString` | Misma firma y forma de salida | Compatibilidad |
| Ampliación global de `Window` | Se distribuye | Era la intención de la v1. **Riesgo:** si otro paquete declara `hive_keychain` con otro tipo, TypeScript avisará de declaraciones incompatibles. Se puede evitar con `skipLibCheck` |
| `.vscode/settings.json` | Sin cambios | No forma parte del paquete |
| `docs/research/` | No se incluye en los commits de esta rama | No es parte del trabajo de la v2. Lo decides tú |
| Aviso de `npm audit` (esbuild, severidad baja) | Se deja | Afecta solo al servidor de desarrollo de esbuild en Windows, que este proyecto no usa. Llega como dependencia de tsup y vite |

## 5. Tamaño y dependencias

Medido con `npm run size`:

| | v1.0.0 | v2.0.0 |
|---|---|---|
| Dependencias en runtime | 0 | 0 |
| `dist/index.js` sin minificar | — | 12,51 kB |
| Minificado | — | 5,66 kB |
| Minificado + gzip | ~1,25 kB (según el estudio) | **2,24 kB** |
| Paquete `.tgz` (9 archivos: ESM, CJS, tipos, sourcemaps, README, CHANGELOG) | — | 49,3 kB |

El aumento sale de la API con promesas, la detección y los mensajes de error. Con `sideEffects: false`, un bundler puede descartar lo que no se use; por ejemplo, la API con promesas si solo usas callbacks.

## 6. Herramientas de desarrollo añadidas

Todas son `devDependencies` con versión fija:

- typescript 5.9.3
- tsup 8.5.1
- vitest 5.0.5
- happy-dom 21.0.4
- vite 7.3.8
- @types/node 24.19.2

Se eligieron vitest 5 y happy-dom 21 en lugar de versiones anteriores porque estas tienen avisos de seguridad (`npm audit`).

**Consecuencia:** vitest 5 exige Node ^22.12 o >=24 para **desarrollar**. El CI prueba con Node 22 y 24. El paquete publicado no depende de Node: `engines` declara `>=18` solo para el uso en Node/SSR.
