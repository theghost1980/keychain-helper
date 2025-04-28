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

### Soluciones de web3 para un desarrollo mas fluido

Entonces al codificar esta utilidad, se hace la llamada al comando de peticion para la Keychain pero antes de hacerlo:

1. Se garantiza al menos intentar detectarla
2. Se muestran los tipos de datos de entrada, asi como otros detalles importantes, como ejemplos y demas.

---

#### Documentación

- Oficial para hive keychain. [Clic aquí](https://github.com/hive-keychain/hive-keychain-extension/blob/master/documentation/README.md)

#### Configuraciones de este proyecto

Decidí no utilizar dependencias ya que considero importante que un ayudante como este, debe sumar en vez de restar y por ende, no debe sino depender de lo escencial.

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

#### Tsconfig explicado

A continuación te explico cada detalle de configuración para que se entienda, e incluso a futuro, pueda ser mejorado o adaptado según las necesidades.

```
{
    "compilerOptions": {
      "target": "es2015", // Compila a JavaScript antiguo para mayor compatibilidad
      "module": "esnext", // Usa módulos ESM (import/export)
      "declaration": true, // Genera archivos .d.ts (definiciones de tipos)
      "outDir": "./dist", // Directorio de salida para los archivos compilados
      "rootDir": "./src", // Directorio raíz de los archivos fuente
      "strict": true, // Habilita opciones estrictas de TypeScript
      "esModuleInterop": true, // Permite importar módulos CommonJS como si fueran ESM
      "skipLibCheck": true, // Omite la verificación de tipos de librerías externas (útil a veces)
      "forceConsistentCasingInFileNames": true // Asegura consistencia en nombres de archivos
    },
    "include": [
      "src/**/*" // Incluye todos los archivos .ts dentro de src
    ],
    "exclude": [
      "node_modules", // Excluye node_modules
      "dist" // Excluye el directorio de salida
    ]
  }
```

#### Nota sobre requestHandshake:

Hive Keychain ofrece una función requestHandshake para verificar la conexión entre la página web y la extensión.
Sin embargo:

- Su uso era el de detectar la keychain. Pero ahora contamos con una funcion de login request haciendo el proceso mas organizado y ya probado como óptimo y seguro.
- Actualmente a pesar de haber probado con https, ngrok, no pude hacerla funcionar.
- Para mayor información contacta directamente al equipo de [Hive Keychain](https://hive-keychain.com/).

Por esta razón, este helper no incluye handshake automático.
Si necesitas verificar conexión, puedes hacer un try-catch manual sobre cualquier otra operación de Keychain.
