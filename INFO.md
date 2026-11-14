### KeychainHelper

Diseñado para contar con un lenguaje tipado, usando [Typescript](https://www.typescriptlang.org/) como una "superposición" de las peticiones que se llevan a cabo usando [Hive Keychain](https://hive-keychain.com/),

### Por qué crear esto si ya existe un [KeychainSDK](https://www.npmjs.com/package/keychain-sdk)?

Debido a que KeychainSDK permite un ambiente fluido en ciertos marcos de trabajo como: nodejs y algunas versiones de webpack, pero si intentamos hacer que nuestro Frontend interactúe directamente con la Keychain, para hacer uso del SDK tendriamos que instalar cosas que en mi opinión son innecesarias de tener del lado del cliente. Hablo específicamente de librerías como cripto, buffer, etc.

> Todo esto es debido a que el KeychainSDK utiliza funciones y utilidades de la biblioteca @hiveio/dhive a traves de su paquete hive-keychain-commons

Es por eso que me tomé la libertad de codificar un paquete que funciona como un ayudante específico para:

- Usar hacer que tu frontend moderno pueda interactuar con la Hive Keychain sin necesidad de dependencias.
- Hacer uso del poder del tipado para tener acceso a variables, tipos de variables y ayudas que son vitales, sobre todo cuando empiezas en HIVE.
- Contar con todos los tipos de peticiones, o al menos irlo agregando ya que esto es un proyecto en desarrollo.
- Tener un ayudante para impartir de tipos clases de formación de Hive en Venezuela, ya que actualmente la documentación se hacee dificil de comprender facilmente.

### Ejemplo de como ayuda este paquete

Supongamos que estas empezando a programar en web3 y especificamente en HIVE. Tu primera tarea es interactuar con la Hive Keychain utilizando Javascript. Entonces desde la documentacion oficial obtienes este codigo:

```
const keychain = window.hive_keychain;
keychain.requestVerifyKey('stoodkev', encodedMessage, 'Posting', (response) => {
  if (response.success === true) {
    const decodedMessage = response.result;
  }
});
```

Al momento de correr el codigo, por alguna razon que aun no conoces, la Hive Keychain no es detectada en tu codigo de react.

> Un detalle que aprendi, al trabajar incansablemente es que como la parte del codigo que llama a los eventos para la interaccion entre el sitio web y la Keychain, es un codigo injectado, esa injeccion **puede tardar hasta 120 milisengudos**

> **Actualización v2 (noviembre de 2026):** los 120 ms no son un límite. En 2026 otros equipos (Ecency, Mantequilla-Soft) documentaron inyecciones más lentas y apps que deslogueaban al usuario por comprobar demasiado pronto. Por eso la v2 ya no espera un tiempo fijo y comprueba una vez: **busca la extensión cada 50 ms durante hasta 1 segundo** y sigue en cuanto la encuentra. Si ya está inyectada, no espera nada.

### Soluciones de web3 para un desarrollo mas fluido

Entonces al codificar esta utilidad, se hace la llamada al comando de peticion para la Keychain pero antes de hacerlo:

1. Se espera a que la extensión esté inyectada (sondeo con tiempo máximo configurable, ver `waitForKeychain`).
2. Se comprueba que la extensión instalada tiene el método pedido (las versiones antiguas no tienen, por ejemplo, `requestSavingsOperation`).
3. Se muestran los tipos de datos de entrada **y de la respuesta**, así como ejemplos y otros detalles importantes.
4. Se ofrece la misma petición con callback o con promesa (`KeychainHelperAsync`).

---

#### Documentación

- Fuente de verdad de la API: el archivo [`public/hive_keychain.js`](https://github.com/hive-keychain/hive-keychain-extension/blob/master/public/hive_keychain.js) de la extensión. Es lo que se inyecta en la página como `window.hive_keychain`.
- La validación de cada petición está en [`src/content-scripts/hive/web-interface/input-validation.ts`](https://github.com/hive-keychain/hive-keychain-extension/blob/master/src/content-scripts/hive/web-interface/input-validation.ts). Ahí se ve, por ejemplo, que `requestBroadcast` no acepta la clave `Memo`.
- La [documentación oficial](https://github.com/hive-keychain/hive-keychain-extension/blob/master/documentation/README.md) está desactualizada: su último cambio es de mayo de 2024, y la extensión añadió después `pair_id` y `requestSavingsOperation`.
- Para detectar cambios en la API: `node scripts/check-extension-signatures.mjs` compara las firmas publicadas con `test/fixtures/extension-signatures.json`.

#### Configuraciones de este proyecto

Decidí no utilizar dependencias ya que considero importante que un ayudante como este, debe sumar en vez de restar y por ende, no debe sino depender de lo escencial.

> Esto sigue igual en la v2: **cero dependencias en tiempo de ejecución**. Las herramientas de build y pruebas (`tsup`, `vitest`, `happy-dom`, `vite`, `typescript`) son solo `devDependencies` y no se instalan en el proyecto de quien usa el paquete.

#### Carpeta .vscode

Normalmente se usa para configurar tu espacio de trabajo para el editor de codigo [VSCode](https://code.visualstudio.com/). He decidio incluirla ya que nos ayudará si estamos utilizando el mismo editor.

> Nota: Si estás utilizando otro editor de código simplemente borrala.

```
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",     // Configura Prettier como el formateador por defecto.
    "editor.formatOnSave": true,                             // Habilita el formato automático del archivo al guardar.
    "editor.codeActionsOnSave": {                            // Configura acciones de código para ejecutar al guardar.
      "source.fixAll": "explicit",                           // Intenta aplicar todas las correcciones automáticas ("fix all") al guardar.
      "source.organizeImports": "explicit"                   // Organiza (ordena/limpia) las importaciones al guardar.
    },
    // Prefiere rutas de importación no relativas en TypeScript cuando sea posible.
    "typescript.preferences.importModuleSpecifier": "non-relative",
}
```


#### Build y tsconfig

Desde la v2 el paquete se compila con [tsup](https://tsup.egoist.dev/) (`tsup.config.ts`) en lugar de `tsc` directamente:

- Genera `dist/index.js` (ESM) y `dist/index.cjs` (CommonJS), cada uno con su archivo de tipos (`index.d.ts` y `index.d.cts`).
- El campo `exports` de `package.json` indica a Node y a los bundlers qué archivo usar en cada caso. Antes, `main` apuntaba a un archivo ESM y `require("keychain-helper")` fallaba.
- `sideEffects: false` permite a los bundlers eliminar lo que no uses.
- Los tipos incluyen la ampliación global `window.hive_keychain`. En la v1 vivía en un `.d.ts` que `tsc` no copiaba a `dist`, así que no llegaba a quien instalaba el paquete.
- Se compila a ES2015 para máxima compatibilidad.

`tsconfig.json` ya no compila: solo comprueba tipos del código (`npm run typecheck`), sin tipos de Node, para garantizar que la librería no depende de Node. `tsconfig.test.json` añade los tests y los tipos de Node.

#### Nota sobre requestHandshake

Hive Keychain ofrece `requestHandshake(callback)`. En la v1 no se incluyó porque no logré hacerlo funcionar. Revisando el código de la extensión (noviembre de 2026) quedó claro por qué:

- **El callback se llama sin argumentos.** No hay objeto `response` con `success`, así que un código que espera `response.success` nunca ve un éxito.
- **Solo guarda un callback a la vez** (`handshake_callback`): dos llamadas seguidas pisan la primera.
- **Lo responde el content script de la página, no el service worker de la extensión.** Por eso no sirve como "ping" para saber si la extensión está despierta. El problema documentado en 2026 es justo que el service worker (Manifest V3) se duerme y las firmas quedan colgadas, y el handshake respondería igual con el worker dormido.

Por eso la v2 tampoco lo incluye. Para detectar la extensión usa `waitForKeychain`. Para no quedarte esperando una firma que nunca llega, usa `createKeychainClient({ requestTimeoutMs })`.
