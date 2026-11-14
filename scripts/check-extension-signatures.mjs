// Compara las firmas de `window.hive_keychain` de la extensión publicada en GitHub
// (rama master) con la copia de referencia en test/fixtures/extension-signatures.json.
// Uso: node scripts/check-extension-signatures.mjs [ruta-local-a-hive_keychain.js]
// Sin argumento descarga el archivo (necesita red). Sale con código 1 si hay diferencias.
import { readFileSync } from "node:fs";

const SOURCE_URL =
  "https://raw.githubusercontent.com/hive-keychain/hive-keychain-extension/master/public/hive_keychain.js";

const parseSignatures = (source) => {
  const out = {};
  const re = /^\s{2}(request[A-Za-z]+):\s*function\s*\(([^)]*)\)/gm;
  let m;
  while ((m = re.exec(source))) {
    out[m[1]] = m[2]
      .split(",")
      .map((p) => p.trim().replace(/\s*=.*$/, ""))
      .filter(Boolean);
  }
  return out;
};

const main = async () => {
  const local = process.argv[2];
  const source = local
    ? readFileSync(local, "utf8")
    : await (await fetch(SOURCE_URL)).text();
  const current = parseSignatures(source);
  const reference = JSON.parse(
    readFileSync(new URL("../test/fixtures/extension-signatures.json", import.meta.url), "utf8")
  ).signatures;

  let diffs = 0;
  for (const name of new Set([...Object.keys(current), ...Object.keys(reference)])) {
    const a = JSON.stringify(reference[name] ?? null);
    const b = JSON.stringify(current[name] ?? null);
    if (a !== b) {
      diffs++;
      console.log(`${name}\n  referencia: ${a}\n  extensión:  ${b}`);
    }
  }
  if (diffs) {
    console.log(`\n${diffs} diferencia(s). Revisa src/types.ts, src/core/methods.ts y los tests.`);
    process.exit(1);
  }
  console.log(`Sin diferencias (${Object.keys(current).length} métodos).`);
};

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
