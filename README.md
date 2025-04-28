# 🔑 Keychain Helper

> Facilita la interacción con Hive Keychain en aplicaciones Web3 modernas.

Keychain Helper proporciona una API sencilla y segura para interactuar con las funcionalidades principales de Hive Keychain, permitiendo realizar firmas de operaciones, logins seguros y más, con una integración rápida y orientada a desarrolladores web3.

---

## 🚀 Introducción

Keychain Helper es una librería simple, segura y amigable para TypeScript y JavaScript, que te permite interactuar de forma sencilla con Hive Keychain.

Ideal para proyectos de Web3 frontend que requieren login seguro, firmas de operaciones, manejo de Custom JSONs, transferencias y más.

## 📦 Instalación

Instala el paquete mediante npm:

```bash
npm install keychain-helper
```

> Nota: Este helper requiere que el usuario final tenga instalada la extensión [Hive Keychain](https://hive-keychain.com/) en su navegador.

## ✨ Características

- 🔒 Login seguro usando Hive Keychain.

- 🗳️ Firma de votos en posts o comentarios.

- 📝 Firma y envío de operaciones personalizadas (Custom JSONs).

- 💸 Transferencias de HIVE y HBD.

- 🔐 Encriptación y desencriptación de mensajes.

- 🏛️ Creación de propuestas para el Decentralized Hive Fund (DHF).

- 🧩 Totalmente tipado para TypeScript y compatible con JavaScript.

- ⚡ API moderna, sencilla y orientada a promesas y callbacks.

---

## ⚡ Uso Rápido

```
import { KeychainHelper } from "keychain-helper";

KeychainHelper.requestVote(
  "your_username", // Tu cuenta Hive
  "author",        // Autor del post
  "permlink",      // Permlink del post
  10000,           // Porcentaje de voto (10000 = 100%)
  (response) => {
    if (response.success) {
      console.log("✅ Voto realizado!");
    } else {
      console.error("❌ Error al votar:", response.message);
    }
  }
);
```

## 📋 Métodos Disponibles

<small>

| Método                | Descripción                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| requestLogin          | Realiza un login seguro usando Keychain como agente de validar una firma. |
| requestVote           | Permite votar un post o comentario en Hive.                               |
| requestBroadcast      | Firma y transmite operaciones directamente.                               |
| requestCustomJson     | Firma y envía Custom JSONs a la blockchain.                               |
| requestTransfer       | Realiza transferencias de HIVE o HBD.                                     |
| requestDecodeMessage  | Decodifica mensajes encriptados.                                          |
| requestEncodeMessage  | Encripta mensajes para otros usuarios.                                    |
| requestCreateProposal | Crea propuestas para el DHF (Decentralized Hive Fund).                    |

</small>

> 🚧 Más métodos y mejoras están en desarrollo activo...

---

## 🛠️ Ejemplos de Uso

### 🔐 Login seguro usando Keychain

```
import { KeychainHelper } from "keychain-helper";

KeychainHelper.requestLogin(
  "your_username",
  "custom_challenge_nonce",
  (response) => {
    if (response.success) {
      console.log("Login exitoso:", response.result);
    } else {
      console.error("Error en login:", response.message);
    }
  }
);
```

---

## 📊 Comparativa frente a otros paquetes

<small>

| Paquete                 | Uso en Frontend               | Instalación Sencilla | Depende de librerías grandes     | Sólo utiliza Hive Keychain Extension         | Peso ligero | Facilidad de uso |
| ----------------------- | ----------------------------- | -------------------- | -------------------------------- | -------------------------------------------- | ----------- | ---------------- |
| `keychain-helper`       | ✅ Sí                         | ✅ Sí                | 🚫 No                            | ✅ Sí                                        | ✅ Sí       | ✅ Muy Alta      |
| `hive-keychain-helpers` | ✅ Sí                         | ⚠️ Parcial           | 🚫 No                            | ✅ Sí                                        | ✅ Sí       | ✅ Alta          |
| `keychain-sdk`          | ⚠️ (Más pensado para Node.js) | 🚫 Complejo          | ⚠️ Sí (dhive, crypto, etc.)      | 🚫 No (puede usar Keychain y firmas locales) | 🚫 No       | ⚠️ Media         |
| `dhive`                 | 🚫 No                         | 🚫 No                | ✅ Sí (requiere librerías extra) | 🚫 No                                        | 🚫 No       | ⚠️ Media         |

</small>

---

✅ **Notas**:

- **keychain-helper** está diseñado **exclusivamente para el navegador** y para trabajar **directamente con Hive Keychain**, sin instalaciones innecesarias.
- Otros paquetes como `keychain-sdk` o `dhive` son potentes pero cargan dependencias pesadas no necesarias para simples operaciones de Keychain.
- Esto hace que `keychain-helper` sea **ideal para frontends rápidos, seguros y ligeros**.

---

## ❗ Requisitos

- Tener instalada la extensión Hive Keychain.

- Proyecto basado en frameworks modernos (React, Vue, Svelte, etc.) o web tradicional.

- Se recomienda HTTPS en producción. (Keychain funciona en http://localhost durante el desarrollo.)

## 🔧 Opciones Avanzadas

Keychain Helper está diseñado para integrarse fácilmente en sistemas backend que implementen autenticación avanzada (por ejemplo, utilizando JWT).

Esto permite construir soluciones Web3 seguras y totalmente descentralizadas basadas en Hive.

> 🔥 Implementa validación de identidad con solo firmar un "challenge" personalizado.

## 🤝 Contribuciones

¡Contribuciones, mejoras y sugerencias son bienvenidas!
Abre un issue o envía un pull request.

## 📜 Licencia

Este proyecto está bajo la licencia MIT.

## 📣 Créditos

Inspirado en el ecosistema Hive y en la necesidad de herramientas simples y robustas para Web3.

Desarrollado con ❤️ por @theghost1980

## 📫 Contacto

¿Tienes ideas o quieres colaborar?
Contactame: [@theghost1980](https://github.com/theghost1980/) / [Peakd](https://peakd.com/@theghost1980)
