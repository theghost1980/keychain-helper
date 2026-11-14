import { dispatch, type WrappedMethod } from "./core/dispatch";
import { METHOD_SPECS } from "./core/methods";
import type {
  AddAccountKeys,
  AuthorityKeyType,
  DelegationUnit,
  EncodeWithKeysResponse,
  HiveCurrency,
  KeychainHelperErrorCode,
  KeychainResponse,
  KeyType,
  MessageResponse,
  SavingsOperation,
  SignBufferResponse,
  TransactionResponse,
  WaitForKeychainOptions,
} from "./types";

type Rpc = string | null;

/**
 * Error con el que se rechazan las promesas de {@link KeychainHelperAsync}.
 *
 * - `code`: ver {@link KeychainHelperErrorCode}. `"keychain_error"` significa que la
 *   extensión respondió `success: false` (por ejemplo, el usuario canceló).
 * - `response`: la respuesta completa (de la extensión o generada por keychain-helper).
 * - `method`: el método de la extensión que se llamó.
 */
export class KeychainError extends Error {
  readonly code: KeychainHelperErrorCode;
  readonly response: KeychainResponse;
  readonly method: string;

  constructor(
    code: KeychainHelperErrorCode,
    response: KeychainResponse,
    method: string
  ) {
    super(response.message || code);
    this.name = "KeychainError";
    this.code = code;
    this.response = response;
    this.method = method;
  }
}

/** Opciones de un cliente con promesas. */
export interface KeychainClientOptions {
  /** Detección de la extensión antes de cada petición. Por defecto 1000 ms, cada 50 ms. */
  detection?: WaitForKeychainOptions;
  /**
   * Tiempo máximo de espera de la respuesta de la extensión, en milisegundos, contado
   * desde que se le entrega la petición. **Desactivado por defecto**: el usuario puede
   * tardar lo que quiera en aprobar el popup. Si lo activas, usa valores generosos
   * (por ejemplo 120000). Al vencer, la promesa se rechaza con `code: "timeout"` y
   * una respuesta tardía se ignora. El popup de Keychain puede seguir abierto.
   */
  requestTimeoutMs?: number;
}

/**
 * API con promesas. Mismos métodos y mismo orden de parámetros que
 * {@link KeychainHelperApi}, **sin el callback**: los parámetros opcionales que en la
 * extensión van detrás del callback (`rpc`, `enforce`, `title`, `pair_id`...) pasan a
 * ocupar su lugar.
 *
 * Cada promesa se **resuelve** con la respuesta si `success` es `true`, y se
 * **rechaza** con un {@link KeychainError} en cualquier otro caso.
 */
export interface KeychainHelperAsyncApi {
  /** Login firmando `challenge` con la clave Posting. Ver `KeychainHelper.requestLogin`. */
  requestLogin(
    username: string,
    challenge: string,
    title?: string
  ): Promise<SignBufferResponse>;
  requestEncodeMessage(
    username: string,
    receiver: string,
    message: string,
    key: KeyType
  ): Promise<MessageResponse>;
  requestEncodeWithKeys(
    username: string,
    publicKeys: string[],
    message: string,
    key: KeyType
  ): Promise<EncodeWithKeysResponse>;
  requestVerifyKey(
    account: string,
    message: string,
    key: KeyType
  ): Promise<MessageResponse>;
  requestSignBuffer(
    account: string | null,
    message: string,
    key: KeyType,
    rpc?: Rpc,
    title?: string | null
  ): Promise<SignBufferResponse>;
  requestAddAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    weight: number,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestRemoveAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityKeyType,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestAddKeyAuthority(
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    weight: number,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestRemoveKeyAuthority(
    account: string,
    authorizedKey: string,
    role: AuthorityKeyType,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestBroadcast(
    account: string,
    operations: [string, object][],
    key: AuthorityKeyType,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestSignTx(
    account: string,
    tx: object,
    key: AuthorityKeyType,
    rpc?: Rpc
  ): Promise<KeychainResponse>;
  requestPost(
    account: string,
    title: string,
    body: string,
    parent_perm: string,
    parent_account: string | null,
    json_metadata: string,
    permlink: string,
    comment_options: string | null,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  /** Ojo al orden: primero `permlink`, luego `author`. */
  requestVote(
    account: string,
    permlink: string,
    author: string,
    weight: number,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestCustomJson(
    account: string | null,
    id: string,
    key: AuthorityKeyType,
    json: string,
    display_msg: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestTransfer(
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: HiveCurrency,
    enforce?: boolean,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  /** `memo` es opcional; por defecto `""`. */
  requestSavingsOperation(
    username: string,
    to: string,
    amount: string,
    currency: HiveCurrency,
    operation: SavingsOperation,
    memo?: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestSendToken(
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestDelegation(
    username: string | null,
    delegatee: string,
    amount: string,
    unit: DelegationUnit,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestWitnessVote(
    username: string | null,
    witness: string,
    vote: boolean,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestProxy(
    username: string | null,
    proxy: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestPowerUp(
    username: string,
    recipient: string,
    hive: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestPowerDown(
    username: string,
    hive_power: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestCreateClaimedAccount(
    username: string,
    new_account: string,
    owner: object,
    active: object,
    posting: object,
    memo: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestCreateProposal(
    username: string,
    receiver: string,
    subject: string,
    permlink: string,
    daily_pay: string,
    start: string,
    end: string,
    extensions: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestRemoveProposal(
    username: string,
    proposal_ids: string,
    extensions: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestUpdateProposalVote(
    username: string,
    proposal_ids: string,
    approve: boolean,
    extensions: string,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestAddAccount(
    username: string,
    keys: AddAccountKeys | object
  ): Promise<KeychainResponse>;
  requestConversion(
    username: string,
    amount: string,
    collaterized: boolean,
    rpc?: Rpc
  ): Promise<TransactionResponse>;
  requestRecurrentTransfer(
    username: string | null,
    to: string,
    amount: string,
    currency: HiveCurrency | string,
    memo: string,
    recurrence: number,
    executions: number,
    rpc?: Rpc,
    pair_id?: number
  ): Promise<TransactionResponse>;
  requestSwap(
    username: string | null,
    startToken: string,
    endToken: string,
    amount: number,
    slippage: number,
    steps: object[],
    rpc?: Rpc,
    partnerUsername?: string,
    partnerFee?: number
  ): Promise<KeychainResponse>;
}

const call = (
  options: KeychainClientOptions,
  method: WrappedMethod,
  args: unknown[],
  id: string
): Promise<KeychainResponse> =>
  new Promise<KeychainResponse>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    const finish = (
      response: KeychainResponse,
      code?: KeychainHelperErrorCode
    ) => {
      if (done) return;
      done = true;
      if (timer !== undefined) clearTimeout(timer);
      if (!code && response && response.success === true) resolve(response);
      else
        reject(
          new KeychainError(
            code ?? "keychain_error",
            response ?? {
              success: false,
              error: "keychain_error",
              result: null,
              message: "Empty response from Hive Keychain.",
            },
            method
          )
        );
    };
    const timeoutMs = options.requestTimeoutMs;
    dispatch({
      method,
      args,
      callbackIndex: METHOD_SPECS[method].callbackIndex,
      id,
      detection: options.detection,
      onResponse: finish,
      onDispatched: () => {
        if (typeof timeoutMs === "number" && isFinite(timeoutMs) && timeoutMs > 0) {
          timer = setTimeout(
            () =>
              finish(
                {
                  success: false,
                  error: "timeout",
                  result: null,
                  message: `Hive Keychain did not answer within ${timeoutMs} ms.`,
                  id,
                },
                "timeout"
              ),
            timeoutMs
          );
        }
      },
    });
  });

/**
 * Crea un cliente con promesas con sus propias opciones de detección y timeout.
 *
 * @example
 * const keychain = createKeychainClient({ requestTimeoutMs: 120_000 });
 * try {
 *   const res = await keychain.requestTransfer("yo", "tu", "1.000", "", "HIVE");
 *   console.log(res.result?.tx_id);
 * } catch (e) {
 *   if (e instanceof KeychainError && e.code === "not_installed") pedirInstalacion();
 * }
 */
export const createKeychainClient = (
  options: KeychainClientOptions = {}
): KeychainHelperAsyncApi => {
  const opts: KeychainClientOptions = { ...options };
  const client = {} as Record<string, (...args: unknown[]) => Promise<unknown>>;

  (Object.keys(METHOD_SPECS) as WrappedMethod[]).forEach((method) => {
    client[method] = (...args: unknown[]) =>
      call(opts, method, args, METHOD_SPECS[method].id);
  });

  client.requestAddAccount = (username, keys) =>
    call(opts, "requestAddAccount", [username, keys], "addAccount");

  client.requestSavingsOperation = (...args: unknown[]) => {
    const a = args.slice();
    if (a[5] === undefined || a[5] === null) a[5] = "";
    return call(opts, "requestSavingsOperation", a, "savingsOperation");
  };

  client.requestLogin = (username, challenge, title) =>
    call(
      opts,
      "requestSignBuffer",
      [username, challenge, "Posting", null, title],
      "login"
    );

  return client as unknown as KeychainHelperAsyncApi;
};

/** Cliente con promesas con las opciones por defecto (sin timeout de petición). */
export const KeychainHelperAsync: KeychainHelperAsyncApi = createKeychainClient();
