// Prueba de humo del paquete empaquetado.
//
// 1. `npm pack` del paquete ya compilado (ejecuta `npm run build` antes).
// 2. Instala el .tgz en un directorio temporal vacío.
// 3. Lo importa desde Node (ESM y CommonJS).
// 4. Comprueba los tipos con TypeScript (moduleResolution bundler, node16 ESM y node16 CJS).
// 5. Lo compila con Vite para navegador y verifica que no hacen falta polyfills.
//
// Sale con código distinto de 0 ante cualquier fallo.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Con `npm run` se usa el mismo npm (npm_execpath) sin shell; si no, se usa el del PATH.
const npmCli = process.env.npm_execpath;
const npmCmd = npmCli ? [process.execPath, [npmCli]] : [process.platform === "win32" ? "npm.cmd" : "npm", []];
const keep = process.argv.includes("--keep");

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "pipe", encoding: "utf8", shell: cmd.endsWith(".cmd") });
const runNpm = (args, cwd) => run(npmCmd[0], [...npmCmd[1], ...args], cwd);

const step = (name) => console.log(`\n▶ ${name}`);
const ok = (msg) => console.log(`  ✔ ${msg}`);
const fail = (msg) => {
  console.error(`  ✘ ${msg}`);
  process.exitCode = 1;
};

if (!existsSync(join(root, "dist", "index.js"))) {
  console.error("Falta dist/. Ejecuta `npm run build` primero.");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "keychain-helper-smoke-"));
try {
  step("npm pack");
  const packOut = runNpm(["pack", "--json", "--pack-destination", work], root);
  const packInfo = JSON.parse(packOut.slice(packOut.indexOf("[")))[0];
  const tgz = join(work, packInfo.filename);
  ok(`${packInfo.filename} (${packInfo.files.length} archivos, ${(packInfo.size / 1024).toFixed(1)} kB comprimido)`);
  const files = packInfo.files.map((f) => f.path).sort();
  console.log("    " + files.join("\n    "));
  for (const required of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/index.d.cts", "package.json", "README.md"]) {
    if (!files.includes(required)) fail(`falta ${required} en el paquete`);
  }
  if (files.some((f) => f.startsWith("src/") || f.startsWith("test/"))) fail("el paquete incluye src/ o test/");

  step("Instalación en un proyecto vacío");
  const app = join(work, "app");
  mkdirSync(app);
  writeFileSync(join(app, "package.json"), JSON.stringify({ name: "smoke-app", private: true, type: "module" }, null, 2));
  runNpm(["install", tgz, "--no-audit", "--no-fund", "--prefer-offline"], app);
  const installed = readdirSync(join(app, "node_modules")).filter((d) => !d.startsWith("."));
  if (installed.length === 1 && installed[0] === "keychain-helper") ok("solo se instaló keychain-helper (cero dependencias)");
  else fail(`se instalaron paquetes extra: ${installed.join(", ")}`);

  step("Node ESM (import)");
  writeFileSync(
    join(app, "esm.mjs"),
    `import * as kh from "keychain-helper";
const expected = ["KeychainHelper","KeychainHelperAsync","KeychainHelperUtils","KeychainError","createKeychainClient","waitForKeychain","getKeychain"];
for (const name of expected) if (!(name in kh)) throw new Error("falta export " + name);
if (await kh.waitForKeychain({ timeoutMs: 50 }) !== false) throw new Error("waitForKeychain debería ser false en Node");
try { await kh.KeychainHelperAsync.requestVote("a","p","b",1); throw new Error("no rechazó"); }
catch (e) { if (!(e instanceof kh.KeychainError) || e.code !== "not_installed") throw e; }
console.log("esm-ok");`
  );
  if (run(process.execPath, ["esm.mjs"], app).includes("esm-ok")) ok("import funciona y no hace falta window");

  step("Node CommonJS (require)");
  writeFileSync(
    join(app, "cjs.cjs"),
    `const kh = require("keychain-helper");
if (typeof kh.KeychainHelper.requestTransfer !== "function") throw new Error("require roto");
kh.KeychainHelper.requestVote("a","p","b",1,(r) => { if (r.error !== "not_installed") process.exit(1); console.log("cjs-ok"); });
console.error = () => {};`
  );
  if (run(process.execPath, ["cjs.cjs"], app).includes("cjs-ok")) ok("require funciona");

  step("Tipos (TypeScript)");
  const tsc = join(root, "node_modules", "typescript", "bin", "tsc");
  const typesSource = `import {
  KeychainHelper, KeychainHelperAsync, KeychainError, createKeychainClient,
  type KeychainResponse, type TransactionResponse, type HiveKeychain,
} from "keychain-helper";

// La ampliación global de Window llega al consumidor:
const k: HiveKeychain | undefined = window.hive_keychain;
k?.requestVote?.("a", "p", "b", 1, (r) => r.result?.tx_id);

KeychainHelper.requestTransfer("a", "b", "1.000", "", "HIVE", (r: TransactionResponse) => r.result?.tx_id, true);
const p: Promise<TransactionResponse> = KeychainHelperAsync.requestVote("a", "p", "b", 1);
p.catch((e: unknown) => { if (e instanceof KeychainError) { const c: string = e.code; const r: KeychainResponse = e.response; void c; void r; } });
createKeychainClient({ requestTimeoutMs: 1000, detection: { timeoutMs: 2000, intervalMs: 100 } });

// @ts-expect-error "Memo" no es válido en requestBroadcast
KeychainHelper.requestBroadcast("a", [], "Memo", () => {});
`;
  const configs = {
    bundler: { module: "esnext", moduleResolution: "bundler", file: "types-bundler.ts" },
    node16esm: { module: "node16", moduleResolution: "node16", file: "types-esm.mts" },
    node16cjs: { module: "node16", moduleResolution: "node16", file: "types-cjs.cts" },
  };
  for (const [name, c] of Object.entries(configs)) {
    const src = c.file.endsWith(".cts") ? typesSource.replace(/^import \{/, "import {") : typesSource;
    writeFileSync(join(app, c.file), src);
    writeFileSync(
      join(app, `tsconfig.${name}.json`),
      JSON.stringify({
        compilerOptions: {
          strict: true, noEmit: true, target: "es2020", lib: ["es2020", "dom"],
          module: c.module, moduleResolution: c.moduleResolution, skipLibCheck: false, types: [],
        },
        files: [c.file],
      })
    );
    try {
      run(process.execPath, [tsc, "-p", `tsconfig.${name}.json`], app);
      ok(`tipos resueltos con ${name}`);
    } catch (e) {
      fail(`tipos con ${name}:\n${e.stdout || e.message}`);
    }
  }

  step("Build de navegador con Vite");
  writeFileSync(join(app, "index.html"), `<!doctype html><html><body><script type="module" src="./main.ts"></script></body></html>`);
  writeFileSync(
    join(app, "main.ts"),
    `import { KeychainHelperAsync, waitForKeychain } from "keychain-helper";
waitForKeychain({ timeoutMs: 500 }).then((ok) => { document.body.dataset.keychain = String(ok); });
(window as unknown as { kh: unknown }).kh = KeychainHelperAsync;
`
  );
  const { build } = await import(pathToFileURL(join(root, "node_modules", "vite", "dist", "node", "index.js")).href);
  const warnings = [];
  await build({
    root: app,
    logLevel: "silent",
    configFile: false,
    build: { outDir: join(app, "dist"), emptyOutDir: true, minify: true },
    customLogger: {
      info() {}, warnOnce: (m) => warnings.push(m), warn: (m) => warnings.push(m),
      error: (m) => warnings.push(m), clearScreen() {}, hasErrorLogged: () => false, hasWarned: false,
    },
  });
  const assets = readdirSync(join(app, "dist", "assets")).filter((f) => f.endsWith(".js"));
  const bundle = assets.map((f) => readFileSync(join(app, "dist", "assets", f), "utf8")).join("\n");
  if (!bundle.includes("hive_keychain")) fail("el bundle de Vite no contiene el código del paquete");
  const nodeOnly = [/\brequire\(/, /\bBuffer\b/, /\bprocess\.env\b/, /\b__dirname\b/, /["']node:/]
    .filter((re) => re.test(bundle))
    .map(String);
  if (nodeOnly.length) fail(`el bundle referencia APIs de Node: ${nodeOnly.join(", ")}`);
  else ok("sin referencias a APIs de Node: no hacen falta polyfills");
  const externalized = warnings.filter((w) => /externalized|polyfill|browser compatibility/i.test(String(w)));
  if (externalized.length) fail(`Vite avisó de módulos de Node: ${externalized.join(" | ")}`);
  else ok(`Vite compiló sin avisos de compatibilidad (${(bundle.length / 1024).toFixed(2)} kB de JS total)`);
} catch (e) {
  fail(e.stdout || e.stderr || e.stack || String(e));
} finally {
  if (keep) console.log(`\nDirectorio conservado: ${work}`);
  else rmSync(work, { recursive: true, force: true });
}

console.log(process.exitCode ? "\nPRUEBA DE HUMO FALLIDA" : "\nPRUEBA DE HUMO OK");
