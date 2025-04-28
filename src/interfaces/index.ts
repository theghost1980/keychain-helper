// Define Hive Keychain interfaces based in original docs: https://github.com/hive-keychain/hive-keychain-extension/blob/master/documentation/README.md
interface HiveKeychain {
  requestHandshake?: (callback: (response: any) => void) => void;
  requestEncodeMessage?: (
    username: string,
    receiver: string,
    message: string,
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void
  ) => void;
  requestEncodeWithKeys?: (
    username: string,
    publicKeys: string[],
    message: string,
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void
  ) => void;
  requestVerifyKey?: (
    account: string,
    message: string,
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void
  ) => void;
  requestSignBuffer?: (
    account: string | null, // Optional, default null
    message: string,
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null, // Optional, default null
    title?: string | null // Optional, default null
  ) => void;
  requestAddAccountAuthority?: (
    account: string,
    authorizedUsername: string,
    role: "Posting" | "Active" | "Memo",
    weight: number,
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestRemoveAccountAuthority?: (
    account: string,
    authorizedUsername: string,
    role: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestAddKeyAuthority?: (
    account: string,
    authorizedKey: string,
    role: "Posting" | "Active" | "Memo",
    weight: number,
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestRemoveKeyAuthority?: (
    account: string,
    authorizedKey: string,
    role: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestBroadcast?: (
    account: string,
    operations: [string, object][],
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestSignTx?: (
    account: string,
    tx: object, // Unsigned transaction
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  // requestSignedCall is deprecated
  requestSignedCall?: (
    account: string,
    method: string,
    params: string, // Stringified Parameters
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestPost?: (
    account: string,
    title: string,
    body: string,
    parent_perm: string,
    parent_account: string | null,
    json_metadata: string, // Stringified JSON metadata
    permlink: string,
    comment_options: string | null, // Stringified Comment Options JSON
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestVote?: (
    account: string,
    permlink: string,
    author: string,
    weight: number, // -10000 to 10000
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestCustomJson?: (
    account: string | null, // Optional, default null
    id: string, // Type of custom_json
    key: "Posting" | "Active" | "Memo",
    json: string, // Stringified custom json
    display_msg: string, // Message to display to the user
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestTransfer?: (
    account: string,
    to: string,
    amount: string, // Requires 3 decimals
    memo: string,
    currency: "HIVE" | "HBD",
    callback: (response: any) => void,
    enforce?: boolean, // Optional, default false
    rpc?: string | null // Optional, default null
  ) => void;
  requestSendToken?: (
    account: string,
    to: string,
    amount: string, // Requires 3 decimals
    memo: string,
    currency: string, // Token to be sent
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestDelegation?: (
    username: string | null, // Optional, default null
    delegatee: string,
    amount: string, // Requires 3 decimals for HP, 6 for VESTS
    unit: "HP" | "VESTS", // HP or VESTS
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestWitnessVote?: (
    username: string | null, // Optional, default null
    witness: string,
    vote: boolean, // true to vote, false to unvote
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestProxy?: (
    username: string | null, // Optional, default null
    proxy: string, // Account to become the proxy, empty string '' to remove a proxy
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestPowerUp?: (
    username: string,
    recipient: string,
    hive: string, // Amount of HIVE to be powered up
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestPowerDown?: (
    username: string,
    hive_power: string, // Amount of HIVE to be powered down
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestCreateClaimedAccount?: (
    username: string,
    new_account: string,
    owner: object, // owner authority object
    active: object, // active authority object
    posting: object, // posting authority object
    memo: string, // public memo key
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestCreateProposal?: (
    username: string,
    receiver: string, // Account receiving the funding
    subject: string, // Title of the DAO
    permlink: string, // Permlink to the proposal description
    daily_pay: string, // Daily amount
    start: string, // Starting date
    end: string, // Ending date
    extensions: string, // Stringified Array of extensions
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestRemoveProposal?: (
    username: string,
    proposal_ids: string, // Stringified Array of ids
    extensions: string, // Stringified Array of extensions
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestUpdateProposalVote?: (
    username: string,
    proposal_ids: string, // Stringified Array of Ids
    approve: boolean, // true to support, false to remove a vote
    extensions: string, // Stringified Array of extensions
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestAddAccount?: (
    username: string, // username of the account to be added
    keys: { active?: string; posting?: string; memo?: string } | object, // private keys or authorized accounts
    callback: (response: any) => void,
    rpc?: string | null // Optional (not explicitly in docs, but common)
  ) => void;
  requestConversion?: (
    username: string,
    amount: string, // amount to be converted
    collaterized: boolean, // true to convert HIVE to HBD, false for HBD to HIVE
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestRecurrentTransfer?: (
    username: string | null, // Optional, default null
    to: string, // Account receiving the transfers
    amount: string, // amount to be sent on each execution
    currency: "HIVE" | "HBD" | string, // HIVE or HBD on mainnet, or other token
    memo: string, // transfer memo
    recurrence: number, // How often in hours (min 24)
    executions: number, // Times to be executed (min 2)
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
  requestSwap?: (
    username: string | null, // Optional, default null
    startToken: string, // Incoming token
    endToken: string, // Outgoing token
    amount: number, // Amount of tokens to be swapped
    slippage: number, // Max slippage
    steps: object[], // Steps returned by KeychainSDK.swaps.getEstimation(), of type IStep[]
    callback: (response: any) => void,
    rpc?: string | null // Optional, default null
  ) => void;
}

// Interfaz para CommentOptions (asumimos que se construirá un objeto y luego se stringificará)
interface CommentOptions {
  author: string;
  permlink: string;
  max_accepted_payout: string;
  percent_hbd: number;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  extensions: any[];
}

export { CommentOptions, HiveKeychain };
