# Changelog

Todos los cambios relevantes de este paquete. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado [SemVer](https://semver.org/lang/es/).

## [2.0.1] - 2026-11-14

Solo documentación; el código es idéntico a la 2.0.0.

### Cambiado

- `README.md` pasa a estar en inglés (es el que muestra npm) y la versión en español se mueve a `README.es.md`. Ambos enlazan entre sí.
- Se quitan los badges de shields.io, que no se mostraban en npm, y se sustituyen por una línea de texto con los datos clave.
- Los enlaces a `INFO.md`, `CHANGELOG.md` y `docs/` usan URLs absolutas de GitHub, porque esos archivos no viajan en el paquete.
- La descripción de `package.json` pasa a inglés.

## [2.0.0] - 2026-11-14

Detalle completo, con la verificación de cada punto, en [docs/v2/hallazgos-y-cambios.md](./docs/v2/hallazgos-y-cambios.md). Cómo actualizar: [docs/v2/guia-de-migracion.md](./docs/v2/guia-de-migracion.md).

### Añadido

- **API con promesas:**
  - `KeychainHelperAsync` y `createKeychainClient(options)`, con los mismos métodos que `KeychainHelper` pero sin callback.
  - Las promesas se resuelven si `success` es `true` y se rechazan con `KeychainError` (`code`, `response`, `method`) en cualquier otro caso.
- **Detección robusta:**
  - `waitForKeychain({ timeoutMs, intervalMs })` busca la extensión por sondeo y resuelve en cuanto la encuentra. Nunca rechaza.
  - `getKeychain()` devuelve `window.hive_keychain` sin esperar.
  - Las peticiones esperan hasta 1 s, comprobando cada 50 ms.
- **Timeout por petición** opcional (`requestTimeoutMs`), desactivado por defecto.
- **Tipos de respuesta:** `KeychainResponse<T>`, `TransactionResult`, `TransactionResponse`, `SignBufferResponse`, `MessageResponse` y `EncodeWithKeysResponse`.
- **Tipos auxiliares exportados:** `KeyType`, `AuthorityKeyType`, `HiveCurrency`, `HiveKeychain`, `CommentOptions` y otros.
- **Métodos y parámetros nuevos de la extensión:**
  - `requestSavingsOperation`.
  - `pair_id` en `requestRecurrentTransfer`.
  - `partnerUsername` y `partnerFee` en `requestSwap`.
- Nuevo código de error `method_not_supported` cuando la extensión instalada no tiene el método. Antes la petición quedaba sin respuesta.
- **Empaquetado:**
  - Build dual ESM y CommonJS, con campo `exports` y `sideEffects: false`.
  - Los tipos incluyen la ampliación de `window.hive_keychain`.
- **Pruebas y mantenimiento:**
  - Pruebas con Vitest.
  - Prueba de humo del paquete empaquetado con Node, TypeScript y Vite.
  - Script para comparar las firmas con la extensión publicada.
  - CI en GitHub Actions.

### Corregido

- `requestLogin` pasaba el `title` en la posición de `rpc` de `requestSignBuffer`, así que la extensión lo usaba como nodo RPC y el título nunca se mostraba.
- Importar o llamar al paquete sin `window` (SSR, Node) ya no lanza `ReferenceError`. Ahora responde `not_installed`.
- `isKeychainInstalled` ya no espera siempre 120 ms: responde en cuanto detecta la extensión, y la sigue buscando hasta `delayMs` si aún no se ha inyectado.
- Si el callback del usuario lanza un error, ya no puede provocar una segunda llamada al callback ni una promesa rechazada sin capturar.
- `package.json` tenía URLs de plantilla (`tu_usuario/nombre_repo`).
- **README:**
  - El ejemplo de `requestVote` invertía `author` y `permlink`.
  - Listaba `requestDecodeMessage`, que no existe.
  - Decía que había promesas cuando no las había.
  - La tabla de métodos estaba incompleta.
- **JSDoc:**
  - Algunos ejemplos usaban nombres que no existen: `KeychainHelperUtil`, `PermlinkUtils`, `author`.
  - Algunos ejemplos usaban `response.tx_id` en lugar de `response.result.tx_id`.
- `generateRandomString` usa `crypto.getRandomValues` cuando está disponible.

### Cambiado (posibles roturas)

- **Solo tipos:**
  - `key` en `requestBroadcast`, `requestSignTx` y `requestCustomJson`, y `role` en las cuatro peticiones de autoridad, ya no aceptan `"Memo"`. La extensión ya rechazaba ese valor en tiempo de ejecución.
- **Respuesta "not installed":**
  - La respuesta de la API de callbacks añade `error: "not_installed"` y `result: null`. Se conservan `success`, `message` e `id`.
  - Cuando la extensión no está, el aviso llega a 1 s en lugar de 120 ms.
- **Ya no se reenvían argumentos que la extensión no admite:**
  - `requestAddAccount` ya no pasa `rpc` a la extensión, que no lo acepta. El parámetro sigue en la firma.
  - `requestSignedCall` tampoco se envuelve: en la extensión no hace nada y nunca llama al callback. En la v1 estaba definido pero no se exportaba.
- **Rutas de importación:** se eliminan las rutas internas `dist/requests`, `dist/utils` y `dist/interfaces`. Importa siempre desde `"keychain-helper"`.
- **Requisitos:** se necesita un entorno ES2015 con `Promise`, igual que antes.

## [1.0.0] - 2025-04-28

- Primera versión: API con callbacks para 29 métodos de Hive Keychain, detección con espera fija de 120 ms y `KeychainHelperUtils`.
