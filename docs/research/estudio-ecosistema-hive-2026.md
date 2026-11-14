# Estudio del ecosistema Hive y veredicto sobre keychain-helper

Fecha de corte de los datos: **14 de noviembre de 2026** (bloque ~111.662.000).

**Cómo leer este informe**

- Todo dato lleva fuente y fecha. Si no se indica otra fecha, el dato se consultó el 2026-11-14.
- **NO VERIFICADO** marca lo que viene de una sola fuente secundaria, de una opinión o de algo que no se pudo comprobar.
- "Sin datos" significa que se buscó y no se encontró una cifra fiable. No se estimó nada para rellenar.
- Las secciones tituladas **Opinión** son juicio propio; el resto es evidencia.
- Método: cinco líneas de investigación en paralelo (wallets/SDKs, cadena/capa 2/dApps, DHF, IA/MCP, dolores de devs), más lectura directa del código de este repo. Los datos de cadena salen de llamadas a `api.hive.blog`; los de paquetes, de las API de npm, GitHub y GitLab.
- Límites: Discord no es rastreable, Reddit falló, y X y los threads de Inleo no se cubrieron. Varias webs (hiveauth.com, hivesigner.com, explorador de Magi) no respondieron desde la máquina de trabajo, lo que no prueba que estén caídas.

---

## 1. Resumen ejecutivo

**Recomendación: mantener keychain-helper con una v2 acotada de dos semanas, sin pivote grande y sin contar con el DHF. Si en 60 días no hay adopción externa, pasarlo a mantenimiento mínimo.**

Las razones, en orden de peso:

1. **El paquete hoy no tiene usuarios.** 3 descargas la última semana, 24 el último mes, 176 en 18 meses, 0 dependientes y 0 estrellas (API de npm y GitHub).
2. **El mercado entero es pequeño y se encoge.** El wrapper oficial, keychain-sdk, tiene 188 descargas/semana; Aioha, unas 700; la librería JS más usada de Hive (`@hiveio/dhive`), unas 3.000. Entre 14 y 34 personas publican trabajo de desarrollo al mes en HiveDevs. Los firmantes diarios de la cadena bajaron de unos 65.000 (enero 2024) a unos 16.000 (noviembre 2026).
3. **El DHF está cerrado en la práctica.** Solo tres propuestas cobran (835 HBD/día en total). En 2026 fallaron una propuesta de 5 HBD/día de un witness con diez años y otra de 3.576 HBD en total para infraestructura en uso. HIVE cotiza a unos 0,04 USD y la emisión de HBD está en cero.
4. **Sí existe un dolor real y sin resolver justo donde está el paquete.** En 2026, cuatro equipos independientes (Ecency, Mantequilla-Soft, HiveNova y un issue sin respuesta en keychain-sdk) arreglaron por separado el mismo problema: la extensión se inyecta tarde, el service worker MV3 se duerme, y no hay timeouts ni errores manejables. Además ya hay cuatro extensiones con globales distintos.
5. **La idea de "MCP de Hive sin claves" llegó tarde a medias.** Ya existe un MCP oficial de solo lectura desde septiembre de 2026. Falta el tramo de firma con aprobación humana, que la documentación oficial recomienda y nadie implementó; pero no se encontró ni un post ni un issue pidiéndolo.
6. **"Cero dependencias" sigue siendo cierto y medible** (1,25 kB gzip frente a ~402 kB de keychain-sdk), pero la ventaja se estrecha: la rama principal de Aioha, aún sin publicar, está quitando dhive y haciendo wax opcional.

**Qué hacer**

| Opción planteada | Veredicto |
|---|---|
| (a) Mantener mínimo | Es el suelo. Arreglar README, URLs del `package.json` y publicar 1.0.1 hay que hacerlo en cualquier caso. |
| (b) Pivotar a firma para agentes / WebMCP / MCP sin claves | No como apuesta principal: demanda medida cercana a cero. Sí como demo de una semana encima de la v2. WebMCP, no. |
| (c) Archivar y crear proyecto nuevo | No. Archivar no ahorra nada (el paquete no cuesta) y un proyecto nuevo cae en el mismo mercado de 20-35 devs. |

**La v2 acotada** convierte el paquete en una capa "wallet lista": detección que espera la inyección, comprobación de que la extensión responde, timeouts por petición, API con promesas y respuestas tipadas. Es la única oportunidad de las analizadas que tiene a la vez evidencia de dolor, competencia débil y esfuerzo de semanas.

**Expectativa honesta:** en el mejor caso, decenas a pocos cientos de descargas semanales y un enlace desde la documentación oficial. Es valor de reputación y de material docente, no ingresos.

---

## 2. Mapa del ecosistema

### 2.1 Estado general de la cadena

| Métrica | 2023 | 2024 | 2025 | 2026 (hasta 14 nov) |
|---|---|---|---|---|
| Transacciones por año | 568,5 M | 336,0 M | 250,6 M | 171,0 M |
| Votos | 109,3 M | 104,1 M | 99,2 M | 63,7 M |
| Operaciones de comentario | 10,6 M | 9,5 M | 8,4 M | 3,8 M |
| Cuentas nuevas | 47.666 | 63.974 | 57.556 | 19.035 |

| Métrica | Ene 2024 | Ene 2025 | Oct 2025 | Oct 2026 |
|---|---|---|---|---|
| Transacciones por día (media mensual) | 1,27 M | 775 k | 648 k | 540 k |
| Autores únicos por mes | 9.931 | 12.106 | 8.136 | 4.747 |

- Firmantes diarios: 64-69 k (enero 2024), 22-32 k (enero 2025), 15-17,7 k (noviembre 2026).
- Retención a 90 días de las cohortes de enero-junio 2026: 8,0-12,7 %.
- Precio: feed de la cadena 0,043 HBD por HIVE (confirmado en dos nodos); CoinGecko 0,0398 USD. `hbd_print_rate` = 0; interés de ahorro HBD 10 %.
- Fuente: `hafbe-api` y `haf-stats-api` en `api.hive.blog`; `condenser_api.get_current_median_history_price`.

**Core.** HF28 se activó el 2025-11-19 (hived 1.28.0). Última versión: 1.28.8 (2026-10-05). HF29 no tiene fecha de mainnet. El desarrollo del core está muy activo (2.215 commits de 29 personas desde HF28, según el resumen de @hiveio del 2026-10-23).

Cambios de HF28 que afectan a wallets y apps:

- **Coincidencia estricta de autoridad:** una clave activa u owner ya no satisface una operación de nivel posting.
- Una transacción puede mezclar operaciones de distintos niveles, cada una con su clave.
- Expiración de transacción de 1 h a 24 h.
- Varias transferencias recurrentes por par emisor/receptor (de ahí el nuevo `pair_id` en Keychain).

Pendientes del roadmap de hive.io con fecha vencida: cuentas lite ("en pruebas", según la reunión de core devs n.º 85 del 2026-11-12, resumen generado por IA), contratos inteligentes en L1 ("prototipado de diseño"), Denser sustituyendo a Condenser.

### 2.2 Wallets y autenticación

| Nombre | Mantenedor | Última actividad | Uso | Estado |
|---|---|---|---|---|
| Hive Keychain (extensión) | hive-keychain (stoodkev, cedricguillas) | v4.1.4 en Chrome Web Store, 2026-11-13 | 60.000 usuarios en Chrome; 1.200 diarios en Firefox | Vivo, muy activo |
| Hive Keychain (móvil) | mismo equipo | Play Store 2026-09-16 (v2.13.7) | 50 K+ descargas en Play | Vivo |
| HiveSigner | Ecency (feruzm) | API 2026-11-03; npm `hivesigner` 4.0.0 (2026-04-04) | 559 descargas/semana | Vivo |
| Ecency (wallet y SDK) | Ecency | commits 2026-11-14; `@ecency/sdk` 2.8.1 | `@ecency/sdk` 1.198/semana | Vivo, muy activo |
| MetaMask Hive Snap | thebeedevs / openhive | 1.8.0 (2026-10-28) | 182 descargas/semana; instalaciones: sin datos | Vivo |
| HiveAuth (HAS) | arcange | cliente sin cambios desde 2023-06-29 | `hive-auth-wrapper` ~221-333/semana (dos lecturas distintas) | Estancado; se sigue usando vía Aioha |
| Ledger (app Hive) | LedgerHQ | 2026-08-24 (solo subida de SDK) | Sin datos | Estancado |
| PeakVault | PeakD (asgarth) | Tienda: 0.2.12 (2024-11-12); repo 0.3.0 (2026-02-06) | 25 usuarios en Chrome | Estancado / nicho |
| Keeper (Ecency) | Ecency | anunciado 2026-04-23; propone el global `window.hive` | Sin datos | Nuevo |
| Signet | @beggars | anunciado 2026-03-15; inyecta `window.signet` y un shim de `window.hive_keychain` | Sin datos | Nuevo |
| hb-auth (Beekeeper en IndexedDB) | thebeedevs | 1.28.4-rc0 (2025-11-07) | 13 descargas/semana | RC, adopción mínima |
| Passkeys / WebAuthn | — | — | — | No existe en Hive |

**API de la extensión Keychain desde abril de 2025** (diff de `public/hive_keychain.js`):

- Un método nuevo: `requestSavingsOperation` (2026-02-03).
- Un parámetro nuevo: `pair_id` en `requestRecurrentTransfer` (2025-11-20).
- Los métodos VSC (`requestVscCallContract`, etc.) solo existen en una rama sin fusionar (`feature/vsc-requests`, último commit 2025-06-27), aunque keychain-sdk expone envoltorios que los llaman. Basado en lectura del código, no en prueba contra la extensión instalada.
- v4.1 (2026-11-10) añade un proveedor EVM (EIP-6963) junto a `window.hive_keychain`.
- En 19 meses la API de Hive de Keychain prácticamente no cambió.

### 2.3 SDKs y librerías

**JavaScript / TypeScript**

| Paquete | Mantenedor | Última versión | Descargas/semana | Tamaño min / gzip | Estado |
|---|---|---|---|---|---|
| `@hiveio/dhive` | openhive | 1.3.6 (2026-04-02) | 3.002 | 729 kB / 187 kB | Vivo, mantenimiento |
| `@hiveio/wax` | thebeedevs | 2.0.2 (2026-02-25), **ya estable** | 749 | 282 kB / 63 kB (el WASM probablemente no cuenta) | Vivo, adopción baja |
| `@aioha/aioha` | techcoderx (1 persona) | 1.8.5 (2026-04-29); commits 2026-11-13 | 697 | 64 kB / 16,8 kB según Bundlephobia — **NO VERIFICADO**, ver nota | Vivo, muy activo |
| `@hiveio/hive-js` | openhive | 2.0.9 (2025-11-30) | 572 | 485 kB / 136 kB | Legado |
| `hivesigner` | Ecency | 4.0.0 (2026-04-04) | 559 | 13,7 kB / 5 kB | Vivo |
| `hive-tx` | mahdiyari | 7.2.2 (2026-10-15) | 393 | 87 kB / 30,8 kB, 0 deps | Vivo |
| `keychain-sdk` | Keychain | 0.11.1 (2026-02-03), sin commits desde entonces | 188 | 1.490 kB / 402,6 kB | Vivo, lento |
| `hive-keychain-commons` | Keychain | 1.14.0 (2026-02-13) | 198 | 484 kB / 151,5 kB | Vivo, lento |
| `@hiveio/beekeeper` | thebeedevs | 1.28.7-rc0 (2026-02-19) | 96 | Sin datos | RC |
| `@hiveio/workerbee` | thebeedevs | 1.28.4-rc1 (2026-02-25) | 48 | Sin datos | RC |
| `@peakd/hive-wallet-sdk` | PeakD | 0.2.3 (2024-09-29) | 47 | Sin datos | Abandonado |
| `@hiveio/keychain` | openhive | 1.0.7 (2021) | 131 | Sin datos | Abandonado |
| **`keychain-helper`** | theghost1980 | 1.0.0 (2025-04-28) | **3** | 9,3 kB / 1,25 kB, 0 deps | Estancado |

Nota sobre Aioha: su `package.json` 1.8.5 declara `@hiveio/dhive` y `@hiveio/wax` como dependencias directas (comprobado en el registro de npm), lo que no cuadra con 16,8 kB gzip. La cifra de Bundlephobia puede excluirlas. La rama principal, sin publicar, incluye commits "use our types library in place of dhive" y "wax is optional" (2026-10-15).

Otros datos:

- keychain-sdk tiene abierto desde 2025-03-31 el issue #3 (llamar a cualquier método sin la extensión provoca una promesa rechazada sin capturar) y el PR #4 que lo arregla sigue sin fusionar desde 2025-07-22.
- No hay ningún otro wrapper de Keychain tipado y sin dependencias en npm. Lo más cercano es `hivexph-sdk` (nuevo, septiembre 2026, 126/semana, centrado en custom_json).
- Proyectos nuevos de 2026: Pollen (@thecrazygm, reemplazo de dhive), `@hiveio/x402` (Ecency, pagos HBD), `hive-react-kit`.

**Python y otros**

| Nombre | Mantenedor | Última versión | Descargas | Estado |
|---|---|---|---|---|
| beem | holgern | 0.24.26 (2021); repo archivado | 1.671/semana (PyPI) | Abandonado, y aun así el más descargado |
| hive-nectar | TheCrazyGM | 1.0.7 (2026-07-30) | 147/semana | Vivo |
| lighthive | emrebeyler | 0.4.4 (2026-10-17) | 114/semana | Vivo, poca actividad |
| hiveio-wax (Python) | thebeedevs | 2.0.1 (2026-02-08) | Sin datos | Vivo |
| clive (wallet TUI/CLI) | thebeedevs | v1.28.8.2 (2026-10-12) | Sin datos | Vivo |
| Go, Rust, Dart, PHP, .NET | varios | — | — | Nada notable o abandonado |

### 2.4 APIs y nodos

| Componente | Mantenedor | Estado |
|---|---|---|
| HAF, HAfAH, Hivemind, balance_tracker, reputation_tracker, hafbe | BlockTrades / SynCad | Vivos, commits del 2026-11-12 al 14 |
| API REST con OpenAPI (77 endpoints en `api.hive.blog`) | BlockTrades | Vivo |
| hivesense (búsqueda semántica), haf-stats, haf_fyp (feed "para ti") | BlockTrades + hdev | Vivos |
| HafSQL | mahdiyari | v2.7.0 (2026-10-18); su propuesta de financiación falló |
| HiveSQL | arcange | En marcha; propuesta #329 nunca pagada en 22 meses. Modelo de acceso futuro: NO VERIFICADO |
| condenser_api | — | No está deprecada entera; sí métodos sueltos |

Nodos públicos (beacon.peakd.com): 12 listados, 9 con puntuación 100; `hapi.ecency.com` en 0 y `hive-api.3speak.tv` en 3.

Incidente: hacia el 2026-07-09/10 un nodo de pruebas de Gopherd (segundo cliente, en Go, de @howo) provocó una tormenta de forks; cayeron al menos 5 nodos API. Corregido en 1.28.7.

### 2.5 Capa 2

| Proyecto | Equipo | Última actividad | Uso | Estado |
|---|---|---|---|---|
| Magi (ex VSC) | lordbutterfly, tibfox, techcoderx | Magi 0.12 el 2026-11-03; commits en `develop`: ago 46, sep 141, oct 265 | Oct 2026: 909 `vsc.call`, 11 `vsc.transfer` en L1. TVL: sin datos | Vivo, equipo de 1-2 personas, sin fondos del DHF desde 2026-05-07 |
| Hive Engine | aggroed, eonwarped | commit 2026-11-07 | `ssc-mainnet-hive`: 6,16 M ops (oct 2024) → 2,60 M (oct 2026) | Vivo, en descenso. Puentes EVM/Solana hackeados el 2026-05-18 |
| SPK / LARYNX / Honeycomb | disregardfiat | último push 2025-09-12 | Fuera del top 30 de custom_json | Estancado o abandonado; sin mainnet |
| DLUX | disregardfiat | repo archivado (2024-10-19) | — | Abandonado |
| Contratos sobre HAF | BlockTrades | "prototipado de diseño" | Ninguno | No entregado |

Sobre Magi: la duda de que su desarrollo se frenó es cierta para julio-agosto de 2026 y falsa desde septiembre. El riesgo real es otro: casi ningún constructor externo (un solo proyecto ajeno al equipo entre 22 repos de contratos; `@vsc.eco/sdk` con 13 descargas/semana) y propuesta #378 de 900 HBD/día sin financiar. Lo recibido del DHF hasta mayo de 2026 fue 248.624 + 420.113 HBD según las operaciones de pago. La salida del fundador en enero de 2026 es **NO VERIFICADO** (un solo post).

### 2.6 dApps

custom_json por app en octubre de 2026 (`haf-stats-api`):

| App | Oct 2026 | Oct 2024 |
|---|---|---|
| Splinterlands | 5,44 M | 2,85 M |
| Hive Engine | 2,60 M | 6,16 M |
| Podping | 1,28 M | 0,95 M |
| TerraCore | 293 k | 379 k |
| Magi (casi todo producción de bloques) | 88 k | — |
| Ecency | 50 k | 87 k |
| InLeo | 31 k | — |
| Genesis League Sports | fuera del top 30 | 864 k |

| App | Mantenedor | Uso (fecha) | Estado |
|---|---|---|---|
| PeakD | asgarth, jarvie | ~2,3 k posts+comentarios/día; ~2 k MAU que publican (jul 2026, @dalz) | Vivo; propuesta #382 sin financiar |
| Ecency | good-karma | ~2,4 k/día; 1,8 k MAU (jul 2026, @dalz) | Vivo; financiado a 100 HBD/día |
| Hive.blog / Denser | BlockTrades | ~600/día; 657 MAU | Vivo; Denser sigue en beta |
| Splinterlands | Splinterlands Inc. | ~3,5 k DAU, 75 k tx/día (sep 2026) | Vivo, lejos del pico |
| InLeo | khaleelkazi | ~265/día; 395 MAU | Vivo en Hive, encogiéndose |
| 3Speak | threespeak | 194 codificaciones/semana | Vivo, mínimo |
| Actifit | mcfarhat | ~210/día | Vivo |
| V4V.app, Distriator/HiveSuite | brianoflondon, sagarkothari88 | Sin datos de volumen | Vivos |
| Liketu, Snapie, D.Buzz, Holozing, dCity, Rising Star, VIMM | — | Sin datos | NO VERIFICADO |

Las cifras de @dalz se leen de gráficos y tienen inconsistencias internas menores.

### 2.7 Herramientas, documentación y exploradores

| Elemento | Estado |
|---|---|
| developers.hive.io | Activo (commits hasta 2026-11-03). Tiene página "Building agents", `llms.txt`, MCP de lectura y páginas de Aioha y Magi. Sigue centrado en JSON-RPC y los tutoriales JS usan dhive. |
| Versión en español (`/es/`) | Existe; navegación y quickstarts traducidos, pero el tutorial muestreado sigue en inglés en el cuerpo. |
| Testnet | La documentación apunta a un host que no responde. El que funciona es `api.fake.openhive.network`. Alternativas locales: Tin Toy (@inertia, 2026-10-04) y Hoverfly (@thecrazygm, 2026-07-30). |
| Exploradores | explore.openhive.network, hivescan.info, hivehub.dev: vivos. |
| Plantilla de arranque | **No existe** ningún `create-hive-app` en npm. Lo más cercano es la lista `ecency/awesome-hive`. |
| Preguntas y respuestas públicas | 0 resultados relevantes en Stack Overflow. El soporte vive en Discord. |

### 2.8 Tamaño de la comunidad de desarrollo

| Indicador | Valor |
|---|---|
| Posts en HiveDevs, últimos 12 meses | 816 de 129 autores; uno solo escribió 239 |
| Autores por mes en HiveDevs | 14 a 34, mediana ~22 |
| Repos con temas `hive` + `blockchain` activos en 12 meses | 41 de 79 |
| `package.json` en GitHub que dependen de `@hiveio/dhive` | 286 |
| Ídem `keychain-sdk` / `@aioha/aioha` / `keychain-helper` | 47 / 20 / 16 |

Lectura: del orden de 20-35 personas publican trabajo de desarrollo cada mes y hay unos pocos cientos de repos activos. Las descargas incluyen CI y bots.

---

## 3. Lo que se está construyendo y el estado del DHF

### 3.1 Proyectos en desarrollo activo (2025-2026)

| Área | Qué | Quién | Evidencia |
|---|---|---|---|
| Core y APIs | HF29 (RC en consenso), API REST, hivesense, haf_fyp, Denser, Clive, cuentas lite | BlockTrades, hdev, thebeedevs | Tags 1.29.0-rc1/rc2 (ago-sep 2026); notas de 1.28.8 |
| Segundo cliente | Gopherd (Go) | @howo | Primer bloque en mainnet el 2026-08-10 |
| Wallets | Keychain multichain/EVM, agregador de swaps | Keychain | v4.1, 2026-11-10 |
| Wallets | Keeper y protocolo `window.hive`; reescritura de HiveSigner con PKCE | Ecency | Post 2026-04-23; PRs 2026-11-05 |
| Librerías | Aioha sin dhive; Pollen; Anther (Go); hive-tx 7 | techcoderx, thecrazygm, mahdiyari | Commits y posts de 2026 |
| Capa 2 | Magi 0.12 (BTC Vault v2), Magi Market | equipo Magi | 2026-11-03 |
| Pagos | `@hiveio/x402` (HBD como esquema x402), facilitador en x402.ecency.com | Ecency | Anunciado 2026-03-19; 52 descargas/semana |
| Pruebas | Hoverfly, Tin Toy, pruebas offline de hive-stream | thecrazygm, inertia, beggars | Posts de jul-oct 2026 |

### 3.2 IA y agentes en Hive

| Proyecto | Qué es | Manejo de claves | Uso | Estado |
|---|---|---|---|---|
| MCP de referencia del devportal | Servidor de solo lectura (`list_methods`, `hive_rpc_call`, etc.) | Ninguna; no firma | Sin datos | Oficial, desde 2026-09-30 |
| `llms.txt`, `llms-skill.txt`, OpenRPC en developers.hive.io | Documentación para agentes | Indica firmar fuera del agente (Keychain, HiveAuth o Beekeeper) | Sin datos | Activo |
| `@gluneau/hive-mcp-server` | Único MCP que escribe en cadena (17 herramientas) | Claves privadas en variables de entorno, sin aprobación | 42 descargas/semana; 5 estrellas | Abandonado (~18 meses) |
| `@peakd/hive-tx-cli` + skill `hive` | CLI y skill para agentes | Claves locales | 17 descargas/semana | Publicado, poca actividad |
| `hive-master-skill` | Skill de Claude Code (~3.800 líneas) | Solo documentación | 4 estrellas | Activo |
| Rafiki (InLeo) | Chatbot en Threads | — | Capacidades: marketing del proveedor, NO VERIFICADO | Activo |
| Ecency y PeakD | Asistentes de escritura, imágenes, etiquetas de uso de IA | — | — | Activos |
| Hove / Five Senses | "Agencias" de agentes que venden servicios por HBD | Clave posting en entorno | Autodeclarado: 6 agentes, 8 pedidos pagados (2026-11-12) | Minúsculo |

Lo que **no** existe: plugins de Hive para ElizaOS, LangChain, AgentKit, GOAT o Vercel AI SDK; MCP para Hive Engine, HiveSQL, PeakD, Ecency o Keychain; ninguna implementación de "el agente propone, el humano aprueba en Keychain".

Hoja de ruta de Keychain: su propuesta financiada (#373, 2026-04-15) incluye crear un "Keychain AI Skill" y dar soporte a Hive-x402. Ninguno está publicado.

Actitud de la comunidad: históricamente hostil al contenido escrito por IA; en 2025-2026 se desplazó a "herramienta, no escritor fantasma". Las herramientas para devs son bienvenidas; las cuentas-agente que publican por recompensas generan recelo.

Fuera de Hive (noviembre 2026):

- **WebMCP:** origin trial en Chrome M149-M156, estado "Proposed", sin fecha de lanzamiento; Firefox y Safari sin señal (Chrome Status).
- **MCP:** revisión 2026-07-28. La elicitación en modo URL es la vía para flujos sensibles, aunque la especificación la sigue marcando como susceptible de cambio. MCP Apps es una extensión oficial, no parte del núcleo.
- **Patrón que ganó en otras cadenas:** wallets dedicadas de agente con límites de gasto (Phantom, Coinbase), no aprobación por popup en cada transacción. El análogo más cercano a aprobación humana es la cola de Ledger Agent Intent (anunciada 2026-10-15). Las cifras de adopción de estos productos son NO VERIFICADO.

### 3.3 Estado del DHF

| Métrica | Valor |
|---|---|
| Saldo de `@hive.fund` | 23.274.750 HBD + 27.434.805 HIVE |
| Presupuesto diario teórico | ~232.700 HBD/día |
| Salida real | **835 HBD/día** (0,36 % del presupuesto) |
| Umbral (propuesta de retorno #0) | 47,06 M HP, ~21,6 % de todo el HP |
| Propuestas que cobran | 3 |
| Estabilizador de HBD | Ninguno activo desde 2026-11-05 |

Pagos fuera de retorno y estabilizador, según operaciones de pago:

| Periodo | HBD/día aprox. |
|---|---|
| 2024 | 9.300 |
| 2025 ene-oct | 7.300 |
| 2025 nov – 2026 mar | 3.500 |
| 2026 jul-oct | 1.200 |
| 2026 nov | 835 |

El quiebre es de finales de octubre de 2025: @theycallmedan votó la propuesta de retorno el 2025-10-30.

**Propuestas votables**

| Id | Propuesta | HBD/día | HP | ¿Cobra? |
|---|---|---|---|---|
| 373 | Hive Keychain 2026 | 540 | 79,61 M | Sí (desde 2026-06-22) |
| 379 | Ecency | 100 | 57,71 M | Sí (desde 2026-08-04) |
| 348 | Worldmappin 2.0 | 195 | 51,66 M | Sí |
| **0** | **Retorno** | — | **47,06 M** | — |
| 391 | Hdev n.º 3 | 275 | 44,69 M | No ha empezado; le faltan ~2,4 M |
| 329 | HiveSQL | 135 | 34,81 M | Nunca |
| 331 | HiveBuzz | 150 | 28,62 M | Nunca |
| 382 | PeakD | 150 | 19,49 M | Nunca |
| 371 | Core dev año 7 (howo) | 150 | 18,03 M | Nunca |
| 378 | Magi 2026 | 900 | 12,07 M | Nunca |
| 362 | Hive Analytics 2026 | 101 | 10,83 M | Nunca |

**Quién decide.** @blocktrades controla 33,39 M HP efectivos (71 % del umbral). Keychain y Ecency empezaron a cobrar el mismo día que él votó. Sin su voto nada pasa (el apoyo a Keychain sin él es ~46,5 M, bajo el umbral), y con su voto ya no basta: #369 y #390 lo tenían y fallaron. Los que más apoyan trabajo pequeño de desarrollo: @acidyo, @stoodkev, @smooth, @oflyhigh, @pharesim, @solominer.

**Precedentes pequeños de herramientas**

| Id | Qué | Petición | Resultado |
|---|---|---|---|
| 301 | HafSQL público (mahdiyari), 2024 | 55/día × 1 año | Pagado: 19.952 HBD |
| 366 | Hive Dev Fund piloto (suscripciones de Claude Code) | 170/día × 60 días | Pagado: 10.200 HBD |
| 386 | AI Coding Subscriptions (acidyo) | 200/día × 60 días | Pagado: 12.000 HBD |
| 358 | Hive Analytics, piloto | 100/día × 60 días | Pagado: 4.808 HBD |
| 355 | Snapie | 100/día × 40 días | Pagado: 3.899 HBD |
| 390 | HafSQL 2026 | 3.576 en total | **Falló** con 43,98 M HP y voto de blocktrades |
| 369 | CombFlow, "simbólica" | 5/día | **Falló** con 45,87 M HP |
| 289 | HiveLive, herramientas open source | 138/día | Falló (6,47 M) |
| 302 | HBD Pay (inglés/español) | 485/día | Falló (3,05 M) |
| 375 | Onboarding en Cuba | 1.000 en total | Falló (1,30 M) |

No se encontró ninguna propuesta de Aioha, hive-tx, hive-nectar ni del MCP de gluneau: las librerías de la comunidad se hacen sin DHF.

**Coste:** 10 HBD, más 1 HBD por día por encima de 60 días (`config.hpp`). El patrón barato es ventana corta con tarifa diaria alta.

**Alternativas.** Los dos programas de suscripciones de IA terminaron y no tienen sucesor. HiveBounty (@beggars, marzo 2026) ofrece microrrecompensas; volúmenes: sin datos. Las recompensas por posts de desarrollo van de 4 a 132 USD por post para autores conocidos. Hackatones 2025-2026: sin datos.

---

## 4. Brechas reales, con evidencia

Ordenadas por solidez de la evidencia. Las citas son paráfrasis fieles; el texto exacto está en cada enlace.

### 4.1 Nodos públicos: caídas, límites 429/403, CORS (8+ fuentes)

- @woelfchen, 2026-03-05: el beacon mostraba solo 4 nodos plenamente en línea. https://peakd.com/@woelfchen/many-hive-nodes-down
- @mantequilla-soft, 2026-03-22: vídeos de 3Speak marcados como fallidos por rate limiting transitorio. https://peakd.com/@mantequilla-soft/d7934262
- @sagarkothari88, 2026-10-02: fallos de arranque de HiveSuite por CORS y 429. https://peakd.com/@sagarkothari88/hivesuite-development-update-rpc-reliability-mob-rvvhsis8
- hive-keychain-extension #520, abierto desde 2024-09-18: la wallet queda inutilizable si ningún nodo responde.
- hive-tx-js #73, abierto desde 2026-05-22: healthchecks de nodos, en pausa.
- **Ya existe:** failover en hive-tx y dhive, beacon.peakd.com. Cada app reimplementa la rotación. **Abierto.**

### 4.2 Integración con extensiones: inyección tardía, worker MV3 dormido, globales incompatibles (6+ fuentes)

- ecency/vision-web PR #966 (feruzm, 2026-06-18): la detección era una foto única al montar, así que "a slow-injecting extension could be missed"; además el service worker MV3 se duerme a los ~30 s y la firma gira hasta un timeout de 60 s. https://github.com/ecency/vision-web/pull/966
- @mantequilla-soft, 2026-02-23: usuarios deslogueados al refrescar porque la app comprobaba Keychain antes de que terminara de inyectarse. https://peakd.com/@mantequilla-soft/0569933a
- HiveNova #434 (abierto desde 2026-08-29) y PR #663 (2026-11-09, abierto): dentro del navegador de Keychain móvil la app pide instalar la extensión. https://github.com/Hive-Pizza-Team/HiveNova/issues/434
- keychain-sdk #3 (2025-03-31, 0 respuestas, autor: un dev de wax). https://github.com/hive-keychain/keychain-sdk/issues/3
- snapie-io PR #231 (2026-10-07): `TypeError` por leer `window.hive_keychain` sin comprobar.
- @ecency, 2026-04-23: cada wallet expone un global distinto; propone `window.hive`. Solo Keeper lo adoptó. https://peakd.com/@ecency/introducing-hive-keeper
- **Ya existe:** Aioha (multi-wallet, hoy con dhive y wax), `@peakd/hive-wallet-sdk` (abandonado), código privado de Ecency. No hay una librería pequeña y compartida que cubra espera, comprobación de vida, timeout y varias wallets. **Abierto, y peor en 2026.**

### 4.3 Fragmentación y peso de las librerías JS (6 fuentes)

- @ecency, 2026-03-30: comparativa de cuatro librerías; en comentarios @asgarth cuenta que su agente de código volvió a dhive porque wax era difícil. https://peakd.com/@ecency/ultimate-stand-off
- snapie-io PR #349 (2026-11-12): dhive genera un chunk de ~727 kB y una tarea larga de 210-240 ms en móvil.
- @thecrazygm, 2026-06-08: su escaneo de dhive da 906 paquetes y 117 CVE. **NO VERIFICADO** (escaneo de un solo autor).
- @sagarkothari88, agosto 2025 y abril-mayo 2026: polyfills de `Buffer` para keychain-sdk, hive-auth-wrapper y dhive con Vite. Un solo autor: NO VERIFICADO como queja generalizada.
- **Ya existe:** hive-tx 7 (0 deps), wax 2, Pollen. **Mejorando.** El dolor ahora es elegir y migrar.

### 4.4 Móvil: sin extensión en navegadores móviles (5 fuentes)

- @jerome-colley, 2026-11-11: en Safari de iPhone, TribalDex le pide instalar algo que ya tiene. https://peakd.com/@jerome-colley/help-needed-hive-keychain-and
- HiveNova #434; @lebah (2025-08-17); @oneteacher365 (2026-03-11); @yecier (2025-05-04).
- **Ya existe:** deep link y QR de Keychain móvil, HiveAuth, navegador de Ecency. Cada dApp lo cablea a mano. **Abierto.**

### 4.5 Onboarding (4 fuentes)

- @ecency, 2026-05-08: 400-600 altas al mes; ~47 % de las comprobaciones de registro eran fraudulentas. https://peakd.com/@ecency/ecency-operational-transparency-infrastructure-insights
- **Abierto.** Requiere infraestructura y antifraude, no una librería.

### 4.6 Moral, descubrimiento y sostenibilidad de devs (4 fuentes)

- @beggars, 2026-02-13: Hive se siente vacío; el descubrimiento de proyectos está roto. https://peakd.com/@beggars/where-did-everyone-go
- @sagarkothari88 (comentario, 2026-02-17): evita el DHF por el abuso que atraen los proyectos financiados.
- No es un problema de código.

### 4.7 Otros, con menos evidencia

| Brecha | Fuentes | Estado |
|---|---|---|
| Inestabilidad de nodos de Hive Engine | 3 | Parcialmente abierto |
| Backend para apps de custom_json sin correr HAF (devportal #82, abierto 18 meses) | 4 | Parcialmente resuelto (hive-stream, WorkerBee, HafSQL) |
| Pruebas sin mainnet | 4 | Resuelto en gran parte en 2026; espacio saturado |
| Sin bug bounty; issues de seguridad de Keychain sin respuesta (#624, #591) | 3 | Abierto |
| Errores irreversibles de usuario en la wallet (@enrique89 perdió 200 HIVE, 2026-08-09) | 3 | Abierto |
| Documentación y formación de desarrollo en español | Débil | Ver abajo |

**Sobre el español.** La comunidad "Develop Spanish" (hive-154226) tiene 163 suscriptores y 0 autores activos. La etiqueta `programacion` muestra ~16 posts desde enero de 2025, la mayoría ajenos a Hive. Tus tutoriales de abril-junio de 2025 recibieron 0-6 comentarios. No hay cifras de asistencia a cursos ni de devs hispanohablantes. Nadie más se queja de esta brecha: es un hueco real en la oferta, pero **NO VERIFICADO** como dolor sentido.

**Sobre firma segura para agentes.** 0 posts o issues pidiéndola. Dos operadores de agentes (@vincentassistant, @jabezagent) trataron el tema y concluyeron que "solo clave posting" les basta.

---

## 5. Veredicto sobre keychain-helper

### 5.1 Estado real del código

Hallazgos de la lectura directa del repo:

| Hallazgo | Dónde |
|---|---|
| El README promete "promesas y callbacks"; el código solo tiene callbacks | `src/requests/index.ts` |
| El ejemplo de `requestVote` del README pasa `autor, permlink`; la firma real es `permlink, author` | `README.md` línea 63; `src/requests/index.ts:386` |
| El README lista `requestDecodeMessage`, que no existe (es `requestVerifyKey`) | `README.md` línea 89 |
| Todas las respuestas son `any`: el tipado cubre entradas, no salidas | todo `src/requests/index.ts` |
| Cada llamada espera 120 ms fijos y comprueba una sola vez | `src/utils/index.ts:4` |
| `requestSignedCall` está definido pero no se exporta en `KeychainHelper` | `src/requests/index.ts:317` |
| `"Memo"` se acepta como clave en operaciones de broadcast donde no aplica | varias firmas |
| `package.json` conserva URLs de plantilla (`tu_usuario/nombre_repo`), y así está publicado en npm | `package.json` |
| No hay tests | — |
| Faltan `requestSavingsOperation` y `pair_id` | — |

El punto de los 120 ms importa: es exactamente el patrón (una comprobación única con retraso fijo) que Ecency y Mantequilla-Soft identificaron como causa de fallos. El paquete nombra bien el problema en `INFO.md` y lo resuelve a medias.

### 5.2 ¿Vale la pena mantenerlo?

Sí, pero solo porque mantenerlo es casi gratis. La API de Keychain cambió una vez en 19 meses, así que el coste de seguirla es de horas al año. Como producto con usuarios, hoy no existe.

### 5.3 Diferenciación real frente a keychain-sdk y Aioha

| | keychain-helper | keychain-sdk | Aioha |
|---|---|---|---|
| Dependencias | 0 | 4 directas, arrastra dhive, moment, winston | 6 directas, incluye dhive y wax (cambiando) |
| Tamaño gzip | 1,25 kB | ~402 kB | NO VERIFICADO |
| Promesas | No | Sí | Sí |
| Respuestas tipadas | No | Sí | Sí |
| Maneja "sin extensión" | Sí (callback con error) | No (bug #3 abierto) | Sí |
| Espera a la inyección | A medias (120 ms fijos) | No | Sin datos |
| Multi-wallet | No | No | Sí |
| Mantenimiento | 1 release | Lento | Muy activo |
| Respaldo | Individual | Oficial, financiado | Individual |

Diferenciación que se sostiene: **tamaño y cero dependencias**, medible y de dos órdenes de magnitud frente al SDK oficial. Diferenciación que podría tener y no tiene: **robustez de detección**, que es el dolor documentado.

Riesgo: cuando Aioha publique su versión sin dhive, la ventaja de tamaño frente a Aioha se reduce mucho, y Aioha además es multi-wallet.

### 5.4 ¿Tienen usuarios los nichos?

| Nicho | Usuarios potenciales | Base |
|---|---|---|
| "Cero dependencias" | Decenas de equipos. Techo realista: 50-300 descargas/semana | keychain-sdk 188/semana; 47 `package.json` lo usan en GitHub; 20-35 devs activos al mes |
| "Educativo" | Tus propios alumnos. Cifra: sin datos | El taller de Barquisimeto nombra cuatro universidades sin asistencia; tutoriales con 0-6 comentarios |
| "Listo para IA" | 5-10 desarrolladores | asgarth, jarvie, hivetrending, Mantequilla-Soft, Ecency, helo, Hove; paquetes del área con 17-52 descargas/semana |

### 5.5 Las tres opciones

- **(a) Mantener mínimo.** Correcto como suelo. Obligatorio corregir README y `package.json`: hoy el ejemplo principal del README vota con los argumentos cruzados.
- **(b) Pivotar a firma para agentes, WebMCP o MCP sin claves.**
  - *MCP sin claves:* la mitad de lectura ya la hizo el devportal. Queda la firma.
  - *Firma con humano en el ciclo:* hueco real y sin ocupar, recomendado por la documentación oficial. Demanda medida: cero. Keychain lo tiene en su hoja de ruta financiada. Vale como demo, no como proyecto principal.
  - *WebMCP:* no. API en origin trial sin fecha, un solo navegador, y exigiría que cada dApp de Hive lo adopte.
- **(c) Archivar y crear proyecto nuevo.** No aporta. El nombre no arrastra mala reputación (no tiene ninguna) y el público del proyecto nuevo sería el mismo.

### 5.6 Opinión

Tus tres etiquetas de nicho describen el paquete, no un público. "Cero dependencias" es verdad pero nadie lo busca por eso con 3 descargas semanales. "Educativo" depende de que sigas dando clases, y ahí sí tiene sentido porque el público lo traes tú. "Listo para IA" hoy no significa nada concreto en el código.

Lo que sí encontró la investigación es un problema que cuatro equipos resolvieron cada uno por su cuenta y que tu `INFO.md` ya describía en abril de 2025. Ese es el único argumento sólido para invertir más de un día en el paquete.

No es un paquete sin futuro, pero su futuro es pequeño: una utilidad correcta y citada, no un producto.

---

## 6. Oportunidades priorizadas

Ninguna es financiable hoy por el DHF (ver 3.3). El encaje con el DHF se indica igualmente para cuando cambie el clima.

### O1. Capa "wallet lista" (keychain-helper v2)

- **Problema:** inyección tardía, worker MV3 dormido, sin timeouts, errores sin capturar, cuatro globales distintos. Evidencia en 4.2.
- **Qué sería:** `waitForWallet()` con sondeo y timeout, ping de vida antes de firmar, timeout por petición, API de promesas, respuestas tipadas, y una interfaz mínima sobre Keychain, Keeper, Peak Vault, Signet y el navegador de Keychain móvil. Cero dependencias.
- **Usuarios:** equipos de frontends de Hive; unas decenas. Realista: 50-300 descargas/semana.
- **Competencia:** Aioha (el rival serio), keychain-sdk (con el bug abierto), `window.hive` de Ecency.
- **Esfuerzo:** MVP solo Keychain, 1-2 semanas; multi-wallet, 2-3 semanas más.
- **DHF:** no hay precedente de librería pequeña financiada; Aioha y hive-tx nunca pidieron.
- **Riesgos:** Aioha publica su versión ligera; Ecency impone su protocolo; mantenimiento de cuatro wallets con una sola persona.

### O2. Firma con aprobación humana para agentes (MCP)

- **Problema:** la documentación oficial dice "firmar fuera del agente (Keychain, HiveAuth o Beekeeper)" y no hay implementación. El único MCP que escribe pide claves privadas en el entorno.
- **Qué sería:** servidor MCP local que, ante una operación, abre una página en localhost que llama a Keychain (reutiliza O1) y devuelve el resultado. Segunda fase: HiveAuth para agentes remotos.
- **Usuarios:** 5-10 desarrolladores hoy.
- **Competencia:** ninguna publicada. Keychain tiene "AI Skill" y x402 en su propuesta.
- **Esfuerzo:** variante localhost, 1-2 semanas; variante HiveAuth, 2-3 semanas más.
- **DHF:** los únicos precedentes de IA (#366 y #386, 10.200 y 12.000 HBD) pagaron suscripciones, no herramientas.
- **Riesgos:** Keychain lo publica primero; que Keychain se inyecte en `http://localhost` para este flujo es NO VERIFICADO; el cliente de HiveAuth lleva sin cambios desde 2023; los popups por transacción no cuajaron en otras cadenas.
- **Valor:** enlace desde la página "Building agents" del devportal. Reputación, no usuarios.

### O3. Plantilla moderna y curso en español

- **Problema:** no existe `create-hive-app`; los tutoriales oficiales de JS usan dhive; el tutorial en `/es/` muestreado está en inglés.
- **Qué sería:** plantilla Vite + hive-tx + O1, con tutoriales en español aportados al `_i18n/es` del devportal.
- **Usuarios:** tus alumnos (sin datos de cuántos) y devs nuevos (cuentas nuevas por debajo de 2.000 al mes en toda la cadena).
- **Competencia:** `ecency/awesome-hive`, `hive-master-skill`. Poca.
- **Esfuerzo:** 3-4 semanas.
- **DHF:** el peor encaje. El gasto en educación y onboarding fue lo primero que se recortó; #375 (Cuba) y #302 fallaron.
- **Riesgos:** demanda no probada; depende de que sigas enseñando.

### O4. Resiliencia de nodos en el navegador

- **Problema:** el mejor documentado (4.1).
- **Qué sería:** puntuación de salud, rotación consciente de 429/403/CORS, lista compartida, incluyendo nodos de Hive Engine.
- **Usuarios:** todo equipo de dApp y bots.
- **Competencia:** hive-tx ya tiene failover y quórum; su mantenedor tiene el healthcheck en pausa (#73).
- **Esfuerzo:** 2-3 semanas como paquete; menos como contribución.
- **DHF:** HafSQL, infraestructura comparable, cobró en 2024 y falló en 2026.
- **Riesgos:** duplicar a hive-tx. **Mejor como PR a hive-tx que como paquete nuevo.**

### O5. Ayudante de "cuenta de agente acotada"

- **Problema:** la dirección de la industria son permisos acotados, no popups. Hive L1 no tiene claves de sesión; el equivalente es una cuenta dedicada con autoridad posting delegada.
- **Qué sería:** flujo guiado vía Keychain para crear la cuenta, delegar RC, y conceder y revocar autoridad posting.
- **Usuarios:** los mismos 5-10 operadores de agentes.
- **Competencia:** ninguna empaquetada; lo hacen a mano.
- **Esfuerzo:** 1-2 semanas.
- **Riesgos:** recelo comunitario hacia cuentas-agente; público mínimo.

### Matriz de impacto frente a esfuerzo

Impacto = evidencia del dolor × usuarios alcanzables. Es una valoración propia (opinión).

| | Esfuerzo bajo (≤ 2 semanas) | Esfuerzo medio (3-5 semanas) |
|---|---|---|
| **Impacto alto** | **O1** (solo Keychain) | O1 multi-wallet |
| **Impacto medio** | O4 como PR a hive-tx | O3 |
| **Impacto bajo** | O2 (localhost), O5 | O2 con HiveAuth |

**Orden recomendado:** O1 (solo Keychain) → O2 variante localhost como demo → decidir con datos si seguir con O1 multi-wallet u O3.

---

## 7. Siguiente paso concreto: próximas dos semanas

**Días 1-2. Validar antes de programar.**

1. Preguntar a @stoodkev qué planean para el "Keychain AI Skill" y por qué el PR #4 de keychain-sdk sigue sin fusionar.
2. Preguntar a @techcoderx cuándo sale Aioha sin dhive y si cubre la inyección tardía y el worker dormido.
3. Preguntar a los tres equipos que arreglaron el problema en privado (feruzm de Ecency, Mantequilla-Soft, Hive-Pizza-Team) si usarían una librería compartida de 1-2 kB.
4. En paralelo, publicar 1.0.1 con el README corregido y las URLs reales del repo.

Si dos de los tres equipos dicen que no la usarían, parar aquí y quedarse en mantenimiento mínimo.

**Días 3-9. v2 solo Keychain.**

- `waitForKeychain({ timeout })` con sondeo en lugar de los 120 ms fijos.
- Ping de vida antes de firmar y timeout por petición.
- API de promesas junto a los callbacks actuales.
- Tipos de respuesta.
- `requestSavingsOperation` y `pair_id`.
- Tests con `window` simulado.

**Días 10-12. Publicar y medir.**

- Post en HiveDevs (inglés y español) que explique el problema con los cuatro casos enlazados.
- PR de ejemplo a HiveNova #663 usando la librería.

**Días 13-14. Demo opcional de O2.** Solo si la v2 quedó publicada: servidor MCP mínimo con página en localhost, y comprobar primero si Keychain se inyecta ahí.

**Criterio de corte a 60 días:** si ningún proyecto externo la adopta y las descargas siguen por debajo de ~50/semana, dejar el paquete en mantenimiento mínimo y no invertir más.

---

## 8. Fuentes

Consultadas el 2026-11-14 salvo indicación.

**Cadena y estadísticas**

- `https://api.hive.blog` — `database_api.get_hardfork_properties`, `list_proposals`, `list_proposal_votes`, `condenser_api.get_dynamic_global_properties`, `get_current_median_history_price`, `get_accounts`
- `https://api.hive.blog/hafbe-api/`, `/haf-stats-api/`, `/hafah-api/accounts/hive.fund/operations?operation-types=66`
- https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd
- https://beacon.peakd.com/api/nodes · https://beacon.peakd.com/api/he/nodes
- https://hive.io/roadmap · https://hive.io/eco/ · https://signup.hive.io
- https://peakd.com/@dalz/active-hive-accounts-by-category-or-posts-votes-transfers-custom-json-or-july-2026 (2026-07-20)

**Core y APIs**

- https://github.com/openhive-network/hive/releases · https://gitlab.syncad.com/api/v4/projects/hive%2Fhive/repository/tags
- https://peakd.com/@blocktrades/haf-api-stack-1-28-8-release-notes-changes-since-1-28-6 (2026-10-06)
- https://peakd.com/@hiveio/nine-awesome-updates-you-re-already-using-meet-hive-1-28-release-roundup (2026-10-23)
- https://peakd.com/@borislavzlatanov/witness-updated-to-hardfork-28--review-of-hardfork-features (2025-11-15)
- https://peakd.com/@howo/core-dev-meeting-85 (2026-11-12) · https://peakd.com/@howo/core-dev-meeting-78 (2026-03-02)
- https://peakd.com/@howo/hive-is-now-a-multi-client-network-the-forking-incident-i-caused-and-reducing-my-proposal-to-150-hbd-a-day (2026-08-12)
- https://raw.githubusercontent.com/openhive-network/hive/master/libraries/protocol/include/hive/protocol/config.hpp

**Wallets y librerías**

- `https://api.npmjs.org/downloads/point/last-week/<paquete>` · `https://registry.npmjs.org/<paquete>` · `https://bundlephobia.com/api/size?package=<paquete>` · https://pypistats.org
- https://github.com/hive-keychain/hive-keychain-extension (issues #520, #552, #591, #624) · https://github.com/hive-keychain/keychain-sdk/issues/3
- https://chromewebstore.google.com/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep
- https://peakd.com/@keychain/hive-keychain-development-proposal-2026 (2026-04-15)
- https://hive.blog/keychain/@keychain/the-multichain-update-is-here-for-keychain-extension (2026-11-10)
- https://github.com/ecency/vision-web/pull/966 · https://github.com/ecency/vision-web/pull/980
- https://peakd.com/@ecency/introducing-hive-keeper (2026-04-23) · https://peakd.com/@ecency/ultimate-stand-off (2026-03-30)
- https://peakd.com/@beggars/introducing-signet-a-new-kind-of-hive-wallet-that-is-100percent-open-source (2026-03-15)
- https://github.com/Hive-Pizza-Team/HiveNova/issues/434 · https://github.com/Hive-Pizza-Team/HiveNova/pull/663
- https://github.com/Mantequilla-Soft/snapie-io/pull/231 · https://github.com/Mantequilla-Soft/snapie-io/pull/349
- https://github.com/mahdiyari/hive-tx-js/issues/73
- https://peakd.com/@thecrazygm/pollen-a-safer-cleaner-path-forward-for-hive-javascript-developers (2026-06-08)
- https://peakd.com/@sagarkothari88/hive-keychain-sdk-the-react-adventure-with-vite-tailwind-and-facepalms (2025-08)

**Capa 2 y dApps**

- https://peakd.com/@magi.network/magi-0-12-btc-vault-v2-poa-seats (2026-11-03)
- https://peakd.com/@vsc.network/vsc-is-now-magi-network-rebrand-announcement (2025-11-06)
- https://peakd.com/@blanchy/what-the-git-logs-actually (2026-08-13) — fuente única de varias afirmaciones sobre Magi
- https://peakd.com/@aggroed/hive-engine-hacked (2026-05-18)
- https://peakd.com/@ecency/ecency-operational-transparency-infrastructure-insights (2026-05-08)

**DHF**

- https://peakd.com/proposals/373 (y el resto por id)
- https://peakd.com/@valueplan/important-announcement-vibes (2025-11-10)
- https://peakd.com/@dhfinflation/who-is-printing-hive-who-is-getting-paid-and-how-much (2026-01-02)
- https://peakd.com/@peak.open/lowering-our-proposal--for-the-benefit-of-hive (2026-02-23)
- https://peakd.com/@keychain/hive-keychain-dhf-and-transparency-update (2026-03-13)
- https://peakd.com/@acidyo/ai-coding-proposal · https://peakd.com/@hdev/hive-dev-proposal-3 (2026-10-29)

**IA, agentes y MCP**

- https://developers.hive.io/quickstart/building_agents.html · https://developers.hive.io/llms.txt · https://github.com/openhive-network/devportal
- https://github.com/gluneau/hive-mcp-server · https://github.com/asgarth/hive-tx-cli · https://github.com/Mantequilla-Soft/hive-master-skill · https://github.com/ecency/hive-x402
- https://peakd.com/@asgarth/getting-ready-for-the-agentic-web (2026-06-05)
- https://developer.chrome.com/docs/ai/webmcp · https://chromestatus.com/feature/5117755740913664
- https://modelcontextprotocol.io/specification/2026-07-28/changelog

**Dolores de devs**

- https://peakd.com/@woelfchen/many-hive-nodes-down (2026-03-05)
- https://peakd.com/@beggars/where-did-everyone-go (2026-02-13)
- https://peakd.com/@beggars/what-is-hive-missing-and-what-do-you-want-to-see-built-for-hive (2026-03)
- https://peakd.com/@jerome-colley/help-needed-hive-keychain-and (2026-11-11)
- https://peakd.com/@enrique89/perdi-200-hive-por-un-error-pero-creo-que-la-experiencia-tambien-puede-mejorar (2026-08-09)
- https://peakd.com/@louis88/keeping-hive-and-its-projects-safe-my-sunday-dedicated-to-more-secure-frontends-on-hive (2025-08-10)
- https://gitlab.syncad.com/hive/devportal/-/work_items/82
- https://peakd.com/@theghost1980/hivedev-1st-workshop-barquisimeto-venezuela-enes (2025-05-27)
- https://developers.hive.io/es/

**Principales puntos NO VERIFICADOS**

- TVL, volumen y número de contratos de Magi; salida de su fundador.
- Tamaño real del bundle de Aioha.
- Si los puentes EVM de Hive Engine se restauraron; volumen de Hive Engine.
- Si Keychain se inyecta en `http://localhost` para un flujo de aprobación; si Keychain móvil acepta peticiones de clave activa de apps arbitrarias vía HiveAuth.
- Disponibilidad actual de la infraestructura de HiveAuth.
- Cifras de adopción de wallets de agente en otras cadenas y de x402.
- Número de devs hispanohablantes o venezolanos en Hive y asistencia a cursos: sin datos.
- Discrepancia: 15 de los 21 witnesses principales reportan versión 1.28.9, pero no existe ese tag público.
