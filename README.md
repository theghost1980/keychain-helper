# 🔑 Keychain Helper

**English** · [Español](https://github.com/theghost1980/keychain-helper/blob/main/README.es.md)

**0 dependencies · ~2.2 kB min+gzip · TypeScript · ESM + CommonJS · SSR-safe**

> Talk to Hive Keychain from modern Web3 apps, with no dependencies.

Keychain Helper is a thin, typed layer over `window.hive_keychain`, the API injected by the [Hive Keychain](https://hive-keychain.com/) browser extension. It handles the usual integration problems:

- waits for the extension to finish injecting instead of failing when it is slow;
- answers predictably when the extension is missing;
- offers the same API with **callbacks** (v1-compatible) and with **promises**;
- types both inputs **and responses**;
- can be imported during SSR (Next.js, Nuxt, Node) without breaking.

---

## 🔗 Live demo

> 👉 [https://keychain-helper-playground.netlify.app](https://keychain-helper-playground.netlify.app)

---

## 📦 Installation

```bash
npm install keychain-helper
```

It works with `import` (ESM) and `require` (CommonJS) and ships its own TypeScript types. It installs no other dependencies and needs no polyfills (`buffer`, `crypto`, etc.).

> End users need the [Hive Keychain](https://hive-keychain.com/) extension in their browser.

---

## ⚡ Quick start

### With promises (recommended)

```ts
import { KeychainHelperAsync, KeychainError } from "keychain-helper";

try {
  const res = await KeychainHelperAsync.requestVote(
    "your_username", // voting account
    "post-permlink", // permlink (comes BEFORE the author)
    "author", // post author
    10000 // weight: 10000 = 100%
  );
  console.log("✅ Vote broadcast. tx:", res.result?.tx_id);
} catch (e) {
  if (e instanceof KeychainError) {
    if (e.code === "not_installed") console.warn("Please install Hive Keychain");
    else console.error("❌ Vote failed:", e.message);
  }
}
```

Each promise:

- **resolves** with Keychain's response when `success` is `true`;
- **rejects** with a `KeychainError` otherwise. `error.code` tells you why:

| `code`                 | Meaning                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `not_installed`        | The extension was not detected (or there is no `window`, e.g. in SSR).   |
| `method_not_supported` | The installed extension is too old and lacks that method.                |
| `dispatch_failed`      | Calling the extension threw an exception.                                |
| `timeout`              | `requestTimeoutMs` expired (only if you enabled it).                     |
| `keychain_error`       | Keychain answered `success: false` (user cancelled, node error, etc.).   |

`error.response` holds the full response and `error.method` the method that was called.

### With callbacks (v1 API)

```ts
import { KeychainHelper } from "keychain-helper";

KeychainHelper.requestVote("your_username", "post-permlink", "author", 10000, (response) => {
  if (response.success) {
    console.log("✅ Voted!", response.result?.tx_id);
  } else {
    console.error("❌ Vote failed:", response.message);
  }
});
```

If the extension is missing, the callback receives:

```js
{ success: false, error: "not_installed", result: null, message: "Hive Keychain is not installed.", id: "vote" }
```

---

## 🔍 Extension detection

The extension injects `window.hive_keychain` after a variable delay, sometimes longer than expected. Before each request, keychain-helper **waits up to 1 second**, checking every 50 ms, and continues **as soon as it finds it**. If it is already there, there is no wait at all.

You can also check it yourself:

```ts
import { waitForKeychain, getKeychain } from "keychain-helper";

const installed = await waitForKeychain({ timeoutMs: 2000, intervalMs: 100 }); // true | false, never rejects
const keychain = getKeychain(); // window.hive_keychain or undefined, no waiting
```

The v1 function is still available with the same signature:

```ts
KeychainHelperUtils.isKeychainInstalled(window, (installed) => { /* ... */ }, 500);
```

> ℹ️ Since v2 it answers as soon as it detects the extension, instead of always waiting `delayMs`.

### Client with its own options

```ts
import { createKeychainClient } from "keychain-helper";

const keychain = createKeychainClient({
  detection: { timeoutMs: 3000, intervalMs: 100 },
  requestTimeoutMs: 120_000, // off by default
});

await keychain.requestTransfer("me", "you", "1.000", "Thanks", "HIVE");
```

**About `requestTimeoutMs`.** It is off by default because users can take as long as they want to approve the popup. Turn it on if you need to recover from a known case: the extension's service worker (Manifest V3) can go to sleep and leave a request unanswered. Use generous values. When it expires, the promise rejects with `code: "timeout"`, but the Keychain popup may still be open.

---

## 📋 Available methods

Every method exists in `KeychainHelper` (callbacks) and in `KeychainHelperAsync` / `createKeychainClient()` (promises).

The promise version drops the callback: the optional parameters that come after the callback in the extension (`rpc`, `enforce`, `title`, `pair_id`, etc.) move into its place.

<small>

| Method                          | What it does                                                         | Parameters (without callback)                                                                  |
| ------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `requestLogin`                  | Login: signs a challenge with the Posting key.                       | `username, challenge, title?`                                                                  |
| `requestSignBuffer`             | Signs an arbitrary message.                                          | `account \| null, message, key, rpc?, title?`                                                  |
| `requestEncodeMessage`          | Encrypts a message (must start with `#`) for another account.        | `username, receiver, message, key`                                                             |
| `requestEncodeWithKeys`         | Encrypts a message for several public keys.                          | `username, publicKeys, message, key`                                                           |
| `requestVerifyKey`              | Decrypts a `#...` message; proves the user controls the key.         | `account, message, key`                                                                        |
| `requestVote`                   | Votes on a post or comment.                                          | `account, permlink, author, weight, rpc?`                                                      |
| `requestPost`                   | Publishes a post or comment.                                         | `account, title, body, parent_perm, parent_account, json_metadata, permlink, comment_options, rpc?` |
| `requestCustomJson`             | Broadcasts a `custom_json`.                                          | `account \| null, id, key, json, display_msg, rpc?`                                            |
| `requestBroadcast`              | Broadcasts arbitrary operations.                                     | `account, operations, key, rpc?`                                                               |
| `requestSignTx`                 | Signs a transaction without broadcasting it.                         | `account, tx, key, rpc?`                                                                       |
| `requestTransfer`               | Transfers HIVE or HBD.                                               | `account, to, amount, memo, currency, enforce?, rpc?`                                          |
| `requestSavingsOperation`       | Deposits to or withdraws from savings. **New in v2.**                | `username, to, amount, currency, "deposit" \| "withdraw", memo, rpc?`                          |
| `requestRecurrentTransfer`      | Recurrent transfer.                                                  | `username \| null, to, amount, currency, memo, recurrence, executions, rpc?, pair_id?`         |
| `requestSendToken`              | Transfers a Hive Engine token.                                       | `account, to, amount, memo, currency, rpc?`                                                    |
| `requestDelegation`             | Delegates HP (or removes it with `"0.000"`).                         | `username \| null, delegatee, amount, "HP" \| "VESTS", rpc?`                                   |
| `requestPowerUp`                | HIVE → HP.                                                           | `username, recipient, hive, rpc?`                                                              |
| `requestPowerDown`              | Starts or cancels a power down.                                      | `username, hive_power, rpc?`                                                                   |
| `requestConversion`             | Converts HBD ↔ HIVE.                                                 | `username, amount, collaterized, rpc?`                                                         |
| `requestSwap`                   | Swap through Keychain Swaps.                                         | `username \| null, startToken, endToken, amount, slippage, steps, rpc?, partnerUsername?, partnerFee?` |
| `requestWitnessVote`            | Votes or unvotes a witness.                                          | `username \| null, witness, vote, rpc?`                                                        |
| `requestProxy`                  | Sets or removes (`""`) a governance proxy.                           | `username \| null, proxy, rpc?`                                                                |
| `requestCreateProposal`         | Creates a DHF proposal.                                              | `username, receiver, subject, permlink, daily_pay, start, end, extensions, rpc?`               |
| `requestRemoveProposal`         | Removes DHF proposals.                                               | `username, proposal_ids, extensions, rpc?`                                                     |
| `requestUpdateProposalVote`     | Supports or unsupports proposals.                                    | `username, proposal_ids, approve, extensions, rpc?`                                            |
| `requestAddAccountAuthority`    | Grants account authority (multisig).                                 | `account, authorizedUsername, role, weight, rpc?`                                              |
| `requestRemoveAccountAuthority` | Removes an account authority.                                        | `account, authorizedUsername, role, rpc?`                                                      |
| `requestAddKeyAuthority`        | Adds a public key as an authority.                                   | `account, authorizedKey, role, weight, rpc?`                                                   |
| `requestRemoveKeyAuthority`     | Removes a public key from the authorities.                           | `account, authorizedKey, role, rpc?`                                                           |
| `requestCreateClaimedAccount`   | Creates an account with a claimed token.                             | `username, new_account, owner, active, posting, memo, rpc?`                                    |
| `requestAddAccount`             | Adds an account to Keychain with its keys.                           | `username, keys`                                                                               |

</small>

**Formats the extension requires:**

- HIVE, HBD and HP amounts as a **string with 3 decimals** (`"1.000"`), and VESTS with 6.
- `daily_pay` as `"10.000 HBD"`.
- Dates as `"2026-12-01T00:00:00"`.
- `json`, `json_metadata`, `comment_options`, `proposal_ids` and `extensions` as **serialized JSON** (`JSON.stringify`).

**Keys:**

- `key` accepts `"Posting"`, `"Active"` or `"Memo"` for message requests.
- In `requestBroadcast`, `requestSignTx` and `requestCustomJson`, and in the `role` of the authority requests, only `"Posting"` or `"Active"` are accepted: the extension rejects `"Memo"`.

**Not included:**

- `requestSignedCall`: the extension marks it as deprecated and it no longer does anything (it never answers).
- `requestHandshake`: it only confirms that the page has the content script, not that the extension is awake. See [INFO.md](https://github.com/theghost1980/keychain-helper/blob/main/INFO.md) (Spanish).

Extra utilities in `KeychainHelperUtils`:

- `generateRandomString(length, includeTimestamp)`: handy for permlinks.
- `isKeychainInstalled`, `waitForKeychain` and `getKeychain`.

---

## 🛠️ Examples

### 🔐 Login

```ts
import { KeychainHelperAsync } from "keychain-helper";

// 1. Your server generates a unique challenge and sends it to the client.
const challenge = await fetch("/api/challenge").then((r) => r.text());

// 2. The user signs it with their Posting key.
const res = await KeychainHelperAsync.requestLogin("your_username", challenge, "Sign in to My App");

// 3. Your server verifies the signature (res.result) against the account's Posting public key.
await fetch("/api/login", {
  method: "POST",
  body: JSON.stringify({ username: "your_username", signature: res.result, publicKey: res.publicKey }),
});
```

> ⚠️ Signing on the client does not authenticate anyone by itself: verification must happen on your server.

### 💬 Comment on a post

```ts
import { KeychainHelperAsync, KeychainHelperUtils } from "keychain-helper";

const parentAuthor = "theghost1980";
const parentPermlink = "my-post";
const permlink = `re-${parentAuthor}-${KeychainHelperUtils.generateRandomString(6, true)}`;

await KeychainHelperAsync.requestPost(
  "your_username",
  "", // comments have no title
  "Great post!",
  parentPermlink,
  parentAuthor,
  JSON.stringify({ tags: ["hive"], app: "my-app/1.0", format: "markdown" }),
  permlink,
  null // no comment_options
);
```

### 💸 Transfer with an encrypted memo

```ts
// If the memo starts with "#", Keychain encrypts it with the Memo key.
await KeychainHelperAsync.requestTransfer("me", "you", "1.500", "#private message", "HBD");
```

### 🏦 Savings

```ts
await KeychainHelperAsync.requestSavingsOperation("me", "me", "10.000", "HBD", "deposit");
```

### 🧩 Custom JSON

```ts
await KeychainHelperAsync.requestCustomJson(
  null, // the user picks the account
  "follow",
  "Posting",
  JSON.stringify(["follow", { follower: "me", following: "theghost1980", what: ["blog"] }]),
  "Follow @theghost1980"
);
```

---

## 🧪 Environments

- **Desktop browsers** with the Hive Keychain extension (Chromium and Firefox). The in-app browser of the Keychain mobile app has not been tested with this package.
- **Bundlers:** Vite, Webpack, Next.js, etc. The package declares `exports` for ESM and CommonJS and `sideEffects: false`.
- **SSR / Node:** importing the package is safe. Requests answer `not_installed` because there is no `window`.
- **TypeScript:** types included, including the `window.hive_keychain` augmentation.
- Compiled to ES2015.

> HTTPS is recommended in production. Keychain works on `http://localhost` during development.

---

## 🧑‍💻 Development

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

- `npm test`: Vitest tests with a mocked `window.hive_keychain`.
- `npm run test:smoke`: packs the package, installs the `.tgz` in a temporary directory and tests it with Node, TypeScript and Vite.
- `npm run size`: minified and gzipped size.
- `check-extension-signatures.mjs`: compares the method signatures with the extension published on GitHub.

---

## 🤝 Contributing

Contributions, improvements and suggestions are welcome! Open an issue or send a pull request.

## 📜 License

MIT.

## 📣 Credits

Inspired by the Hive ecosystem and the need for simple, robust Web3 tools.

Made with ❤️ by @theghost1980

## 📫 Contact

Have ideas or want to collaborate?
Reach me at [@theghost1980](https://github.com/theghost1980/) / [PeakD](https://peakd.com/@theghost1980)

> More: [project purpose and technical notes (INFO.md, Spanish)](https://github.com/theghost1980/keychain-helper/blob/main/INFO.md) · [Changelog](https://github.com/theghost1980/keychain-helper/blob/main/CHANGELOG.md) · [Migrating from v1 (Spanish)](https://github.com/theghost1980/keychain-helper/blob/main/docs/v2/guia-de-migracion.md)
