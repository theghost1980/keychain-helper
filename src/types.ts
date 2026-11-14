/**
 * Tipos públicos de keychain-helper.
 *
 * Fuente de verdad: `public/hive_keychain.js`, `src/content-scripts/hive/web-interface/input-validation.ts`
 * y `src/background/hive/requests/operations/operations.utils.ts` del repo
 * https://github.com/hive-keychain/hive-keychain-extension (rama master, revisada en noviembre de 2026).
 */

/** Tipo de clave aceptado por las peticiones de cifrado, descifrado y firma de mensajes. */
export type KeyType = "Posting" | "Active" | "Memo";

/**
 * Tipo de clave aceptado por las peticiones que emiten transacciones
 * (`requestBroadcast`, `requestSignTx`, `requestCustomJson`) y por el `role` de las
 * peticiones de autoridad. La extensión rechaza `"Memo"` en estas peticiones.
 */
export type AuthorityKeyType = "Posting" | "Active";

/** Monedas nativas. `TESTS` y `TBD` solo existen en testnet. */
export type HiveCurrency = "HIVE" | "HBD" | "TESTS" | "TBD";

/** Operación de ahorros para `requestSavingsOperation`. */
export type SavingsOperation = "deposit" | "withdraw";

/** Unidad de una delegación. */
export type DelegationUnit = "HP" | "VESTS";

/**
 * Respuesta que la extensión entrega al callback de cada petición.
 *
 * `success` indica si la operación se completó. Si es `false`, `error` trae el motivo
 * (por ejemplo `"user_cancel"`, `"incomplete"`, `"request_limit"`, o el error del nodo)
 * y `message` un texto legible.
 *
 * keychain-helper añade sus propios códigos en `error` cuando la petición ni siquiera
 * llega a la extensión: ver {@link KeychainHelperErrorCode}.
 */
export interface KeychainResponse<TResult = unknown> {
  success: boolean;
  /** Motivo del fallo, o `null` si la petición tuvo éxito. */
  error: unknown;
  /** Resultado de la operación, o `null` si falló. */
  result: TResult | null;
  /** Mensaje legible para el usuario. */
  message: string;
  /** Copia de los datos de la petición (sin `request_id`). */
  data?: Record<string, unknown>;
  /** Identificador interno de la petición en la extensión. */
  request_id?: number;
  /** Clave pública usada para firmar. Presente en `requestSignBuffer`. */
  publicKey?: string;
  /** Clave de traducción del mensaje (versiones recientes de la extensión). */
  messageKey?: string;
  messageParams?: unknown;
  /**
   * Solo en respuestas generadas por keychain-helper (no por la extensión):
   * identifica el método que falló. Se mantiene por compatibilidad con la v1.
   */
  id?: string;
}

/** Resultado de las peticiones que emiten una transacción en la cadena. */
export interface TransactionResult {
  id: string;
  tx_id: string;
  /** `true` si la extensión confirmó que la transacción entró en un bloque. */
  confirmed?: boolean;
  /** `true` si la cuenta usa multifirma y la transacción quedó pendiente de otros firmantes. */
  isUsingMultisig?: boolean;
}

/** Respuesta de las peticiones que emiten una transacción. */
export type TransactionResponse = KeychainResponse<TransactionResult>;
/** Respuesta de `requestSignBuffer` y `requestLogin`: `result` es la firma en hexadecimal. */
export type SignBufferResponse = KeychainResponse<string>;
/** Respuesta de `requestEncodeMessage` y `requestVerifyKey`: `result` es el mensaje cifrado o descifrado. */
export type MessageResponse = KeychainResponse<string>;
/** Respuesta de `requestEncodeWithKeys`: `result` asocia cada clave pública con su mensaje cifrado. */
export type EncodeWithKeysResponse = KeychainResponse<Record<string, string>>;

/** Callback genérico de Keychain. */
export type KeychainCallback<TResponse = KeychainResponse> = (
  response: TResponse
) => void;

/**
 * Códigos de error que genera keychain-helper cuando la petición no llega a la extensión.
 *
 * - `not_installed`: no se detectó `window.hive_keychain` dentro del tiempo de espera, o no hay `window`.
 * - `method_not_supported`: la extensión instalada no expone ese método (versión antigua).
 * - `dispatch_failed`: la llamada a la extensión lanzó una excepción.
 * - `timeout`: la extensión no respondió dentro de `requestTimeoutMs` (solo API con promesas).
 * - `keychain_error`: la extensión respondió con `success: false`.
 */
export type KeychainHelperErrorCode =
  | "not_installed"
  | "method_not_supported"
  | "dispatch_failed"
  | "timeout"
  | "keychain_error";

/** Opciones de detección de la extensión. */
export interface WaitForKeychainOptions {
  /** Tiempo máximo de espera en milisegundos. Por defecto 1000. */
  timeoutMs?: number;
  /** Intervalo entre comprobaciones en milisegundos. Por defecto 50. */
  intervalMs?: number;
}

/** Opciones de cuerpo de comentario (se serializa con `JSON.stringify` antes de pasarlo a `requestPost`). */
export interface CommentOptions {
  author: string;
  permlink: string;
  /** Por ejemplo `"1000000.000 HBD"`. */
  max_accepted_payout: string;
  /** En puntos básicos: `10000` = 50 % HBD / 50 % HP (valor por defecto de la cadena), `0` = 100 % HP. */
  percent_hbd: number;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  extensions: unknown[];
}

/** Claves o cuentas autorizadas para `requestAddAccount`. */
export type AddAccountKeys = {
  active?: string;
  posting?: string;
  memo?: string;
};

/**
 * Objeto `window.hive_keychain` tal como lo inyecta la extensión.
 * Todos los métodos son opcionales porque versiones antiguas pueden no tenerlos.
 */
export interface HiveKeychain {
  /**
   * La extensión llama al callback **sin argumentos**. La respuesta la da el content
   * script de la página, no el service worker, así que no sirve para saber si el
   * worker está despierto.
   */
  requestHandshake?: (callback: () => void) => void;
  requestEncodeMessage?: (
    username: string,
    receiver: string,
    message: string,
    key: KeyType,
    callback: KeychainCallback<MessageResponse>
  ) => void;
  requestEncodeWithKeys?: (
    username: string,
    publicKeys: string[],
    message: string,
    key: KeyType,
    callback: KeychainCallback<EncodeWithKeysResponse>
  ) => void;
  requestVerifyKey?: (
    account: string,
    message: string,
    key: KeyType,
    callback: KeychainCallback<MessageResponse>
  ) => void;
  requestSignBuffer?: (
    account: string | null,
    message: string,
    key: KeyType,
    callback: KeychainCallback<SignBufferResponse>,
    rpc?: string | null,
    title?: string | null
  ) => void;
  requestAddAccountAuthority?: (
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestRemoveAccountAuthority?: (
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestAddKeyAuthority?: (
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestRemoveKeyAuthority?: (
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestBroadcast?: (
    account: string,
    operations: [string, object][],
    key: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestSignTx?: (
    account: string,
    tx: object,
    key: AuthorityKeyType,
    callback: KeychainCallback<KeychainResponse>,
    rpc?: string | null
  ) => void;
  /**
   * @deprecated En la extensión actual este método solo escribe un aviso en consola
   * y **nunca llama al callback**. keychain-helper no lo envuelve.
   */
  requestSignedCall?: (
    account: string,
    method: string,
    params: string,
    key: KeyType,
    callback: KeychainCallback,
    rpc?: string | null
  ) => void;
  requestPost?: (
    account: string,
    title: string,
    body: string,
    parent_perm: string,
    parent_account: string | null,
    json_metadata: string,
    permlink: string,
    comment_options: string | null,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestVote?: (
    account: string,
    permlink: string,
    author: string,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestCustomJson?: (
    account: string | null,
    id: string,
    key: AuthorityKeyType,
    json: string,
    display_msg: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestTransfer?: (
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: HiveCurrency,
    callback: KeychainCallback<TransactionResponse>,
    enforce?: boolean,
    rpc?: string | null
  ) => void;
  requestSavingsOperation?: (
    username: string,
    to: string,
    amount: string,
    currency: HiveCurrency,
    operation: SavingsOperation,
    memo: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestSendToken?: (
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestDelegation?: (
    username: string | null,
    delegatee: string,
    amount: string,
    unit: DelegationUnit,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestWitnessVote?: (
    username: string | null,
    witness: string,
    vote: boolean,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestProxy?: (
    username: string | null,
    proxy: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestPowerUp?: (
    username: string,
    recipient: string,
    hive: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestPowerDown?: (
    username: string,
    hive_power: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestCreateClaimedAccount?: (
    username: string,
    new_account: string,
    owner: object,
    active: object,
    posting: object,
    memo: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestCreateProposal?: (
    username: string,
    receiver: string,
    subject: string,
    permlink: string,
    daily_pay: string,
    start: string,
    end: string,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestRemoveProposal?: (
    username: string,
    proposal_ids: string,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestUpdateProposalVote?: (
    username: string,
    proposal_ids: string,
    approve: boolean,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestAddAccount?: (
    username: string,
    keys: AddAccountKeys | object,
    callback: KeychainCallback
  ) => void;
  requestConversion?: (
    username: string,
    amount: string,
    collaterized: boolean,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null
  ) => void;
  requestRecurrentTransfer?: (
    username: string | null,
    to: string,
    amount: string,
    currency: HiveCurrency | string,
    memo: string,
    recurrence: number,
    executions: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: string | null,
    pair_id?: number
  ) => void;
  requestSwap?: (
    username: string | null,
    startToken: string,
    endToken: string,
    amount: number,
    slippage: number,
    steps: object[],
    callback: KeychainCallback,
    rpc?: string | null,
    partnerUsername?: string,
    partnerFee?: number
  ) => void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
}
