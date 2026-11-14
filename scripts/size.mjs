// Mide el tamaño del paquete tal como lo vería un bundler: dist/index.js
// minificado y comprimido con gzip. Requiere `npm run build` antes.
// esbuild llega como dependencia de tsup y vite (solo desarrollo).
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const entry = new URL("../dist/index.js", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const result = await build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2015",
  write: false,
  logLevel: "silent",
});
const code = result.outputFiles[0].contents;
const raw = readFileSync(entry);
const kb = (n) => (n / 1024).toFixed(2) + " kB";

console.log(`dist/index.js          ${kb(raw.length)}`);
console.log(`minificado             ${kb(code.length)}`);
console.log(`minificado + gzip      ${kb(gzipSync(code, { level: 9 }).length)}`);
const deps = Object.keys(pkg.dependencies ?? {});
console.log(`dependencias runtime   ${deps.length}${deps.length ? " (" + deps.join(", ") + ")" : ""}`);
if (deps.length) process.exit(1);
