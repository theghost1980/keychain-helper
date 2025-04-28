# 🔑 Keychain Helper

Simplifica la interacción con Hive Keychain en aplicaciones web modernas.

Keychain Helper proporciona una API sencilla y segura para interactuar con las funcionalidades principales de Hive Keychain, permitiendo realizar firmas de operaciones, logins seguros y más, con una integración rápida y orientada a desarrolladores web3.

---

## 🚀 Instalación

Instala el paquete mediante npm:

```bash
npm install keychain-helper
```

> Nota: Este helper requiere que el usuario final tenga instalada la extensión [Hive Keychain](https://hive-keychain.com/) en su navegador.

## ✨ Características

- Firma de transacciones en Hive de manera simple.
- Login seguro usando Keychain (útil para sistemas con JWT).
- Firma y decodificación de mensajes.
- Gestión de Custom JSON, transferencias, propuestas DHF y más.
- API amigable para TypeScript y JavaScript.
- Ideal para proyectos de Web3 frontend.

---

## 📦 Uso Rápido

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

> Proyecto en desarrollo, mas metodos por agregar...

---

## 🛠️ Ejemplos de Uso

### 🔐 Login usando Keychain

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

## ❗ Requisitos

- Tener instalada la extensión Hive Keychain en el navegador.

- Proyecto basado en frameworks modernos de frontend (React, Vue, Svelte, etc.) o aplicaciones web tradicionales.

- Conexiones HTTPS en ambientes de producción para garantizar la compatibilidad de Keychain, recomendado pero hasta el momento la hive keychain se puede usar en ambientes de desarrollo local. `ej: http://localhost`

## 🔧 Opciones Avanzadas

Keychain Helper está diseñado para integrarse fácilmente en sistemas backend que implementen autenticación avanzada (por ejemplo, utilizando JWT).

Esto permite construir soluciones Web3 seguras y totalmente descentralizadas basadas en Hive.

> Tip: Combina requestLogin con tu backend para validar identidades mediante la firma de retos personalizados.

## 🤝 Contribuciones

- ¡Toda contribución es bienvenida!
- Si deseas mejorar este proyecto, puedes:
  - Abrir un Issue con sugerencias o reportes de bugs.
  - Enviar un Pull Request con mejoras o nuevas funciones.
- Ayudar a mejorar la documentación.

> Antes de contribuir, revisa las buenas prácticas en CONTRIBUTING.md (próximamente).

## 📜 Licencia

Este proyecto está bajo la licencia MIT.
Consulta el archivo LICENSE para más detalles.

## 📣 Créditos

Inspirado en el ecosistema Hive y en la necesidad de herramientas simples y robustas para Web3.

Desarrollado con ❤️ por [@theghost1980](https://github.com/theghost1980/) / [Peakd](https://peakd.com/@theghost1980)
