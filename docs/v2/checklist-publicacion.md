# Checklist de publicación v2.0.0

Todo el trabajo está en la rama local `v2`. **No se ha hecho push, ni tag, ni publicación en npm.**

Abre una terminal en la raíz del repo y sigue los pasos en orden.

---

## 1. Revisar el diff

Revisa al menos `src/`, `package.json`, `README.md` y `docs/v2/hallazgos-y-cambios.md`.

```bash
git switch v2
```

```bash
git log --oneline main..v2
```

```bash
git diff main..v2 --stat
```

```bash
git diff main..v2 -- src package.json
```

## 2. Comprobaciones automáticas

Todo debe salir limpio. `npm run size` debe mostrar `dependencias runtime 0`.

```bash
npm ci
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

Este último compara con la extensión publicada en GitHub (necesita red). Si muestra diferencias, la extensión cambió desde el 2026-02-03: revísalas antes de publicar.

```bash
node scripts/check-extension-signatures.mjs
```

## 3. Probar con la extensión real (pendiente de prueba manual)

Yo no pude ejecutar nada de esta sección: no tengo navegador con la extensión ni una cuenta de Hive.

### 3.1 Preparación

Necesitas:

- Chrome o Brave con Hive Keychain actualizado (versión de febrero de 2026 o posterior, para `requestSavingsOperation`).
- Una cuenta de prueba con poco saldo.

Para probar el paquete tal cual se publicará, genera el `.tgz`:

```bash
npm pack
```

Instálalo en el playground (keychain-helper-playground.netlify.app o tu copia local) con `npm install ../keychain-helper/keychain-helper-2.0.0.tgz`.

> Usa importes mínimos (`"0.001"`) y, si puedes, una cuenta secundaria como destinataria.

### 3.2 Pruebas

Marca cada una:

**Detección**

- [ ] Recarga la página con la extensión activa: la primera petición sale sin esperar (no hay retraso apreciable).
- [ ] Desactiva la extensión en `chrome://extensions` y recarga. `KeychainHelperAsync.requestVote(...)` rechaza con `code: "not_installed"` en ~1 s. La API de callbacks responde `{ success: false, error: "not_installed", id: "vote", ... }` y escribe `console.error`.
- [ ] Con la extensión activa, `await waitForKeychain()` devuelve `true` al cargar la página. Pruébalo también dentro de un `useEffect` de React en el primer render.
- [ ] `KeychainHelperUtils.isKeychainInstalled(window, cb)` devuelve `true` con la extensión y `false` sin ella.

**Login (corrección del bug de `title`)**

- [ ] `KeychainHelper.requestLogin("cuenta", "reto-123", cb, "Mi App")`: el popup **muestra "Mi App"** como título.
- [ ] La respuesta trae `result` (firma) y `publicKey`.
- [ ] Repite la prueba con `KeychainHelperAsync.requestLogin("cuenta", "reto-123", "Mi App")`.

**Firmas y respuestas tipadas**

- [ ] `requestSignBuffer(null, "hola", "Posting")`: el usuario elige la cuenta; `result` es una cadena hexadecimal.
- [ ] `requestEncodeMessage("cuenta", "otra", "#hola", "Memo")` → `result` empieza por `#`.
- [ ] `requestVerifyKey("cuenta", mensajeCifradoParaCuenta, "Memo")` → `result` es `"#hola"`.
- [ ] `requestVote("cuenta", "permlink", "autor", 100)` sobre un post real: se vota **ese** post. Comprueba que el orden `permlink, author` es correcto. `result.tx_id` existe.
- [ ] `requestCustomJson(null, "follow", "Posting", JSON.stringify(["follow",{follower:"cuenta",following:"otra",what:["blog"]}]), "Seguir")` funciona.
- [ ] `requestTransfer("cuenta", "otra", "0.001", "prueba", "HIVE", true)` (promesas): `result` tiene `id`, `tx_id` y `confirmed`.
- [ ] Anota la forma real de `result` en `requestSignTx`, `requestSwap` y `requestAddAccount` (hoy tipados como `unknown`). Si es estable, se puede tipar en una 2.0.x.

**Métodos nuevos**

- [ ] `requestSavingsOperation("cuenta", "cuenta", "0.001", "HBD", "deposit", "")` funciona.
- [ ] `requestSavingsOperation(..., "withdraw", ...)` funciona. Recuerda que el retiro tarda 3 días; puedes cancelarlo después.
- [ ] `requestRecurrentTransfer(null, "otra", "0.001", "HIVE", "", 24, 2, cb, null, 1)` crea la recurrencia con `pair_id` 1. Cancélala después con `amount: "0"` y el mismo `pair_id`.

**Errores**

- [ ] Cancela el popup: la promesa rechaza con `code: "keychain_error"` y `response.error` es `"user_cancel"` o similar. Anota el valor real.
- [ ] `requestTransfer` con `"1"` (sin 3 decimales): rechaza con `code: "keychain_error"` y `response.error === "incomplete"`.
- [ ] Con `createKeychainClient({ requestTimeoutMs: 10000 })`, deja el popup abierto 10 s sin responder: rechaza con `code: "timeout"`. Al aprobar después, no pasa nada más en la app.
- [ ] Prueba del service worker dormido:
  1. Abre la página.
  2. Espera más de 1 minuto sin tocar la extensión.
  3. Lanza `requestSignBuffer`.
  4. Anota si llega a abrir el popup.

  Es el caso documentado en 2026; sirve para decidir si conviene un timeout por defecto en el futuro.

**Entornos**

- [ ] App Next.js (App Router): importar `keychain-helper` en un componente de servidor o en un módulo compartido no rompe el build ni el SSR.
- [ ] Firefox con Hive Keychain: repite la detección y un `requestSignBuffer`.
- [ ] (Opcional) Navegador integrado de la app móvil de Keychain: ¿existe `window.hive_keychain` y responde `requestSignBuffer`?

## 4. Fusionar, versionar y publicar

La versión ya es `2.0.0` en `package.json`, así que **no hace falta `npm version`**. Si prefieres que npm cree el commit y el tag, cambia antes la versión a `1.0.0` en `package.json` y ejecuta `npm version major`.

1. Fusiona `v2` en `main` mediante un PR para que corra el CI de GitHub Actions. Crea el PR en GitHub desde `v2` y espera a que el CI pase en Node 22 y 24.

   ```bash
   git push -u origin v2
   ```

2. Tras fusionar, actualiza `main` en local:

   ```bash
   git switch main
   ```

   ```bash
   git pull
   ```

3. Pon la fecha en `CHANGELOG.md` (sustituye "sin publicar" por la fecha de hoy), haz commit y push.

4. Comprueba qué se va a publicar. Deben salir solo `dist/`, `README.md`, `CHANGELOG.md` y `package.json`:

   ```bash
   npm pack --dry-run
   ```

5. Publica. `prepublishOnly` vuelve a ejecutar typecheck, tests, build y la prueba de humo:

   ```bash
   npm login
   ```

   ```bash
   npm publish
   ```

6. Crea el tag y súbelo:

   ```bash
   git tag v2.0.0
   ```

   ```bash
   git push origin v2.0.0
   ```

7. Comprueba que la publicación es correcta:

   ```bash
   npm view keychain-helper version repository.url
   ```

   Debe mostrar `2.0.0` y `git+https://github.com/theghost1980/keychain-helper.git`.

## 5. Después de publicar

- [ ] Actualiza el playground a `keychain-helper@2` y añade un ejemplo con promesas y uno de `requestSavingsOperation`.
- [ ] Crea una release en GitHub con el contenido de `CHANGELOG.md`.
- [ ] Opcional: anuncia la versión con la lista de cambios.
- [ ] Opcional: decide qué hacer con `docs/research/estudio-ecosistema-hive-2026.md`. No está incluido en los commits de `v2`.
