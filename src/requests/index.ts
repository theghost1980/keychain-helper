import { dispatch, type WrappedMethod } from "../core/dispatch";
import { METHOD_SPECS } from "../core/methods";
import type {
  AddAccountKeys,
  AuthorityKeyType,
  DelegationUnit,
  EncodeWithKeysResponse,
  HiveCurrency,
  KeychainCallback,
  KeychainResponse,
  KeyType,
  MessageResponse,
  SavingsOperation,
  SignBufferResponse,
  TransactionResponse,
} from "../types";

type Rpc = string | null;

/**
 * API con callbacks (la de la v1). Cada método espera a que la extensión esté
 * inyectada (hasta 1 s) y luego delega en `window.hive_keychain`. Si la extensión
 * no aparece, llama al callback con
 * `{ success: false, error: "not_installed", message: "Hive Keychain is not installed.", id }`.
 *
 * Los parámetros y su orden son los de la extensión; la documentación de cada uno
 * está en https://github.com/hive-keychain/hive-keychain-extension/blob/master/public/hive_keychain.js
 */
export interface KeychainHelperApi {
  /**
   * Login: pide al usuario firmar `challenge` con su clave Posting (`requestSignBuffer`).
   *
   * El `challenge` debe generarlo tu servidor, y el servidor debe verificar la firma
   * (`response.result`) contra la clave pública de la cuenta. Firmar en el cliente sin
   * verificar en el servidor no autentica a nadie.
   *
   * @param username Cuenta de Hive.
   * @param challenge Texto a firmar (único por intento de login).
   * @param callback Recibe la respuesta. `result` es la firma; `publicKey`, la clave usada.
   * @param [title] Título del popup de Keychain.
   *
   * @example
   * KeychainHelper.requestLogin("usuario", challengeDelServidor, (res) => {
   *   if (res.success) enviarAlServidor(res.result, res.publicKey);
   * }, "Entrar en Mi App");
   */
  requestLogin(
    username: string,
    challenge: string,
    callback: KeychainCallback<SignBufferResponse>,
    title?: string
  ): void;

  /**
   * Cifra un mensaje para `receiver` con la clave indicada de `username`.
   * El mensaje debe empezar por `#`.
   */
  requestEncodeMessage(
    username: string,
    receiver: string,
    message: string,
    key: KeyType,
    callback: KeychainCallback<MessageResponse>
  ): void;

  /**
   * Cifra un mensaje para varias claves públicas (multifirma).
   * `result` asocia cada clave pública con su mensaje cifrado.
   */
  requestEncodeWithKeys(
    username: string,
    publicKeys: string[],
    message: string,
    key: KeyType,
    callback: KeychainCallback<EncodeWithKeysResponse>
  ): void;

  /**
   * Descifra un mensaje cifrado (debe empezar por `#`) con la clave indicada.
   * Sirve para comprobar que el usuario controla esa clave. `result` es el texto descifrado.
   */
  requestVerifyKey(
    account: string,
    message: string,
    key: KeyType,
    callback: KeychainCallback<MessageResponse>
  ): void;

  /**
   * Firma un mensaje arbitrario. Con `account = null` el usuario elige la cuenta.
   * @param [rpc] Nodo RPC que sustituye al configurado por el usuario.
   * @param [title] Título del popup (sustituye a "Sign message").
   */
  requestSignBuffer(
    account: string | null,
    message: string,
    key: KeyType,
    callback: KeychainCallback<SignBufferResponse>,
    rpc?: Rpc,
    title?: string | null
  ): void;

  /** Concede autoridad de cuenta (multifirma). Firma con Active. */
  requestAddAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Retira una autoridad de cuenta. Firma con Active. */
  requestRemoveAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Añade una clave pública como autoridad. Firma con Active. */
  requestAddKeyAuthority(
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Retira una clave pública de las autoridades. Firma con Active. */
  requestRemoveKeyAuthority(
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Emite una o varias operaciones arbitrarias.
   * @example
   * KeychainHelper.requestBroadcast("usuario", [
   *   ["account_witness_vote", { account: "usuario", witness: "testigo", approve: true }],
   * ], "Active", (res) => console.log(res.result?.tx_id));
   */
  requestBroadcast(
    account: string,
    operations: [string, object][],
    key: AuthorityKeyType,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Firma (sin emitir) una transacción ya construida. `result` es la transacción firmada. */
  requestSignTx(
    account: string,
    tx: object,
    key: AuthorityKeyType,
    callback: KeychainCallback<KeychainResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Publica un post o un comentario.
   *
   * @param title Título; cadena vacía `""` para comentarios.
   * @param parent_perm Permlink del post padre (comentario) o la primera etiqueta/comunidad (post).
   * @param parent_account Autor del post padre, o `null` para un post nuevo.
   * @param json_metadata JSON serializado (`JSON.stringify`).
   * @param comment_options JSON serializado de {@link CommentOptions}, o `null`.
   *
   * @example
   * // Comentario a un post
   * const permlink = "re-" + autorPadre + "-" + KeychainHelperUtils.generateRandomString(6, true);
   * KeychainHelper.requestPost(
   *   "usuario", "", "¡Buen post!", permlinkPadre, autorPadre,
   *   JSON.stringify({ tags: ["hive"], app: "mi-app/1.0" }),
   *   permlink, null,
   *   (res) => { if (res.success) console.log("tx:", res.result?.tx_id); },
   * );
   */
  requestPost(
    account: string,
    title: string,
    body: string,
    parent_perm: string,
    parent_account: string | null,
    json_metadata: string,
    permlink: string,
    comment_options: string | null,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Vota un post o comentario. Ojo al orden: **primero `permlink`, luego `author`**.
   * @param weight De -10000 (-100 %) a 10000 (100 %).
   * @example
   * KeychainHelper.requestVote("votante", "mi-post", "autor", 10000, (res) => console.log(res));
   */
  requestVote(
    account: string,
    permlink: string,
    author: string,
    weight: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Emite un `custom_json`. Con `account = null` el usuario elige la cuenta.
   * @param json JSON serializado.
   * @param display_msg Texto que verá el usuario en el popup.
   */
  requestCustomJson(
    account: string | null,
    id: string,
    key: AuthorityKeyType,
    json: string,
    display_msg: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Transferencia de HIVE o HBD.
   * @param amount Cadena con exactamente 3 decimales, por ejemplo `"1.000"`.
   * @param memo Si empieza por `#` se cifra con la clave Memo.
   * @param [enforce=false] Si es `true`, el usuario no puede cambiar la cuenta de origen.
   */
  requestTransfer(
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: HiveCurrency,
    callback: KeychainCallback<TransactionResponse>,
    enforce?: boolean,
    rpc?: Rpc
  ): void;

  /**
   * Deposita en ahorros o retira de ahorros (HIVE o HBD).
   * Añadido a la extensión en febrero de 2026: requiere una versión reciente.
   * @param amount Cadena con 3 decimales.
   * @param memo Puede ser `""`.
   */
  requestSavingsOperation(
    username: string,
    to: string,
    amount: string,
    currency: HiveCurrency,
    operation: SavingsOperation,
    memo: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Transfiere un token de Hive Engine. */
  requestSendToken(
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Delega HP. `amount` con 3 decimales para HP o 6 para VESTS. `"0.000"` retira la delegación.
   */
  requestDelegation(
    username: string | null,
    delegatee: string,
    amount: string,
    unit: DelegationUnit,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Vota (`true`) o retira el voto (`false`) a un testigo. */
  requestWitnessVote(
    username: string | null,
    witness: string,
    vote: boolean,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Fija un proxy de gobernanza. `proxy = ""` lo elimina. */
  requestProxy(
    username: string | null,
    proxy: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Convierte HIVE en HP para `recipient`. `hive` con 3 decimales. */
  requestPowerUp(
    username: string,
    recipient: string,
    hive: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Inicia un power down. `hive_power` con 3 decimales; `"0.000"` lo cancela. */
  requestPowerDown(
    username: string,
    hive_power: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Crea una cuenta usando un token de cuenta reclamado. */
  requestCreateClaimedAccount(
    username: string,
    new_account: string,
    owner: object,
    active: object,
    posting: object,
    memo: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Crea una propuesta del DHF.
   * @param daily_pay Formato `"10.000 HBD"`.
   * @param start Formato `"2026-12-01T00:00:00"`.
   * @param end Formato `"2027-12-01T00:00:00"`.
   * @param extensions Array serializado, normalmente `"[]"`.
   */
  requestCreateProposal(
    username: string,
    receiver: string,
    subject: string,
    permlink: string,
    daily_pay: string,
    start: string,
    end: string,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Elimina propuestas. `proposal_ids` es un array serializado, por ejemplo `"[216]"`. */
  requestRemoveProposal(
    username: string,
    proposal_ids: string,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /** Apoya (`true`) o retira el apoyo (`false`) a propuestas. `proposal_ids` serializado. */
  requestUpdateProposalVote(
    username: string,
    proposal_ids: string,
    approve: boolean,
    extensions: string,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Añade una cuenta a Keychain con sus claves privadas.
   * Nunca manejes claves privadas en tu aplicación si puedes evitarlo.
   * @param [rpc] **Ignorado.** La extensión no acepta `rpc` en esta petición; se mantiene por compatibilidad con la v1.
   */
  requestAddAccount(
    username: string,
    keys: AddAccountKeys | object,
    callback: KeychainCallback,
    rpc?: Rpc
  ): void;

  /** Convierte HBD en HIVE (`collaterized = false`) o HIVE en HBD (`true`). */
  requestConversion(
    username: string,
    amount: string,
    collaterized: boolean,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc
  ): void;

  /**
   * Transferencia recurrente.
   * @param amount 3 decimales; `"0"` detiene la recurrencia.
   * @param recurrence Horas entre pagos (mínimo 24).
   * @param executions Número de pagos (mínimo 2).
   * @param [pair_id] Permite varias recurrencias al mismo destinatario (requiere extensión de noviembre de 2025 o posterior).
   */
  requestRecurrentTransfer(
    username: string | null,
    to: string,
    amount: string,
    currency: HiveCurrency | string,
    memo: string,
    recurrence: number,
    executions: number,
    callback: KeychainCallback<TransactionResponse>,
    rpc?: Rpc,
    pair_id?: number
  ): void;

  /**
   * Intercambio de tokens con Keychain Swaps.
   * @param steps Pasos devueltos por la estimación del servicio de swaps de Keychain.
   * @param [partnerUsername] Cuenta socia que aloja el widget.
   * @param [partnerFee] Comisión del socio (0 a 1 %).
   */
  requestSwap(
    username: string | null,
    startToken: string,
    endToken: string,
    amount: number,
    slippage: number,
    steps: object[],
    callback: KeychainCallback,
    rpc?: Rpc,
    partnerUsername?: string,
    partnerFee?: number
  ): void;
}

const callbackMethod =
  (method: WrappedMethod, maxArgs?: number) =>
  (...all: unknown[]): void => {
    const { callbackIndex, id } = METHOD_SPECS[method];
    const callback = all[callbackIndex];
    const after = all.slice(callbackIndex + 1);
    const args = [
      ...all.slice(0, callbackIndex),
      ...(maxArgs === undefined ? after : after.slice(0, maxArgs - callbackIndex)),
    ];
    dispatch({
      method,
      args,
      callbackIndex,
      id,
      logNotInstalled: true,
      onResponse: (response) => {
        if (typeof callback === "function") callback(response);
      },
    });
  };

const requestLogin: KeychainHelperApi["requestLogin"] = (
  username,
  challenge,
  callback,
  title
) => {
  dispatch({
    method: "requestSignBuffer",
    // Orden de la extensión: account, message, key, callback, rpc, title.
    // La v1 pasaba `title` en la posición de `rpc`; aquí va en su sitio.
    args: [username, challenge, "Posting", null, title],
    callbackIndex: 3,
    id: "login",
    logNotInstalled: true,
    onResponse: (response) => {
      if (typeof callback === "function")
        callback(response as SignBufferResponse);
    },
  });
};

const methods = {} as Record<WrappedMethod, (...args: unknown[]) => void>;
(Object.keys(METHOD_SPECS) as WrappedMethod[]).forEach((method) => {
  methods[method] = callbackMethod(
    method,
    // requestAddAccount no acepta rpc en la extensión: no se reenvía.
    method === "requestAddAccount" ? METHOD_SPECS[method].callbackIndex : undefined
  );
});

/**
 * API con callbacks, compatible con la v1. Ver {@link KeychainHelperApi} para la
 * documentación de cada método, y `KeychainHelperAsync` para la versión con promesas.
 */
export const KeychainHelper: KeychainHelperApi = {
  ...(methods as unknown as Omit<KeychainHelperApi, "requestLogin">),
  requestLogin,
};
