import { KeychainHelperUtils } from "../utils/index";

const requestLoginLogic = (
  username: string,
  challenge: string,
  callback: (response: any) => void,
  title?: string
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSignBuffer?.(
        username,
        challenge,
        "Posting", // siempre se usa la Posting Key para login
        (response: any) => {
          callback(response);
        },
        title // título opcional en la ventana popup
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "login",
      });
    }
  });
};

const requestEncodeMessageLogic = (
  username: string,
  receiver: string,
  message: string,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestEncodeMessage?.(
        username,
        receiver,
        message,
        key,
        callback
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "encodeMessage",
      });
    }
  });
};

const requestEncodeWithKeysLogic = (
  username: string,
  publicKeys: string[],
  message: string,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestEncodeWithKeys?.(
        username,
        publicKeys,
        message,
        key,
        callback
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "encodeWithKeys",
      });
    }
  });
};

const requestVerifyKeyLogic = (
  account: string,
  message: string,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestVerifyKey?.(account, message, key, callback);
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "verifyKey",
      });
    }
  });
};

const requestSignBufferLogic = (
  account: string | null,
  message: string,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null,
  title?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSignBuffer?.(
        account,
        message,
        key,
        callback,
        rpc,
        title
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "signBuffer",
      });
    }
  });
};

const requestAddAccountAuthorityLogic = (
  account: string,
  authorizedUsername: string,
  role: "Posting" | "Active" | "Memo",
  weight: number,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestAddAccountAuthority?.(
        account,
        authorizedUsername,
        role,
        weight,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "addAccountAuthority",
      });
    }
  });
};

const requestRemoveAccountAuthorityLogic = (
  account: string,
  authorizedUsername: string,
  role: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestRemoveAccountAuthority?.(
        account,
        authorizedUsername,
        role,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "removeAccountAuthority",
      });
    }
  });
};

const requestAddKeyAuthorityLogic = (
  account: string,
  authorizedKey: string,
  role: "Posting" | "Active" | "Memo",
  weight: number,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestAddKeyAuthority?.(
        account,
        authorizedKey,
        role,
        weight,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "addKeyAuthority",
      });
    }
  });
};

const requestRemoveKeyAuthorityLogic = (
  account: string,
  authorizedKey: string,
  role: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestRemoveKeyAuthority?.(
        account,
        authorizedKey,
        role,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "removeKeyAuthority",
      });
    }
  });
};

const requestBroadcastLogic = (
  account: string,
  operations: [string, object][],
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestBroadcast?.(
        account,
        operations,
        key,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "broadcast",
      });
    }
  });
};

const requestSignTxLogic = (
  account: string,
  tx: object,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSignTx?.(account, tx, key, callback, rpc);
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "signTx",
      });
    }
  });
};

/**
 * Requests a signed call (Deprecated).
 * Use requestBroadcast or requestSignTx instead.
 *
 * @deprecated This method is deprecated and may be removed in the future. Use requestBroadcast or requestSignTx instead.
 * @param account Hive account to perform the request.
 * @param method Method of the call.
 * @param params Stringified Parameters of the call.
 * @param key Type of key ('Posting', 'Active', or 'Memo').
 * @param callback Function that handles Keychain's response.
 * @param [rpc] Override user's RPC settings (optional).
 *
 * @example
 * // Example for Deprecated requestSignedCall (Avoid using in new code)
 * // This example's functionality is better covered by requestBroadcast
 * const account = 'your_account';
 * const apiMethod = 'condenser_api.get_accounts'; // Example API method
 * const apiParams = JSON.stringify([['other_account']]); // Example parameters as stringified array
 * KeychainHelper.requestSignedCall(account, apiMethod, apiParams, 'Posting', (response) => {
 * console.log('Signed Call Response:', response);
 * // Handle response
 * });
 */
const requestSignedCall = (
  account: string,
  method: string,
  params: string,
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  console.warn(
    "Hive Keychain: requestSignedCall is deprecated and may be removed in the future."
  );
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSignedCall?.(
        account,
        method,
        params,
        key,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "signedCall",
      });
    }
  });
};

const requestPostLogic = (
  account: string,
  title: string,
  body: string,
  parent_perm: string,
  parent_account: string | null,
  json_metadata: string,
  permlink: string,
  comment_options_json: string | null,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestPost?.(
        account,
        title,
        body,
        parent_perm,
        parent_account,
        json_metadata,
        permlink,
        comment_options_json,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "post",
      });
    }
  });
};

const requestVoteLogic = (
  account: string,
  permlink: string,
  author: string,
  weight: number,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestVote?.(
        account,
        permlink,
        author,
        weight,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "vote",
      });
    }
  });
};

const requestCustomJsonLogic = (
  account: string | null,
  id: string,
  key: "Posting" | "Active" | "Memo",
  json: string,
  display_msg: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestCustomJson?.(
        account,
        id,
        key,
        json,
        display_msg,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "customJson",
      });
    }
  });
};

const requestTransferLogic = (
  account: string,
  to: string,
  amount: string,
  memo: string,
  currency: "HIVE" | "HBD",
  callback: (response: any) => void,
  enforce?: boolean,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestTransfer?.(
        account,
        to,
        amount,
        memo,
        currency,
        callback,
        enforce,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "transfer",
      });
    }
  });
};

const requestSendTokenLogic = (
  account: string,
  to: string,
  amount: string,
  memo: string,
  currency: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSendToken?.(
        account,
        to,
        amount,
        memo,
        currency,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "sendToken",
      });
    }
  });
};

const requestDelegationLogic = (
  username: string | null,
  delegatee: string,
  amount: string,
  unit: "HP" | "VESTS",
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestDelegation?.(
        username,
        delegatee,
        amount,
        unit,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "delegation",
      });
    }
  });
};

const requestWitnessVoteLogic = (
  username: string | null,
  witness: string,
  vote: boolean,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestWitnessVote?.(
        username,
        witness,
        vote,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "witnessVote",
      });
    }
  });
};

const requestProxyLogic = (
  username: string | null,
  proxy: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestProxy?.(username, proxy, callback, rpc);
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "proxy",
      });
    }
  });
};

const requestPowerUpLogic = (
  username: string,
  recipient: string,
  hive: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestPowerUp?.(
        username,
        recipient,
        hive,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "powerUp",
      });
    }
  });
};

const requestPowerDownLogic = (
  username: string,
  hive_power: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestPowerDown?.(
        username,
        hive_power,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "powerDown",
      });
    }
  });
};

const requestCreateClaimedAccountLogic = (
  username: string,
  new_account: string,
  owner: object,
  active: object,
  posting: object,
  memo: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestCreateClaimedAccount?.(
        username,
        new_account,
        owner,
        active,
        posting,
        memo,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "createClaimedAccount",
      });
    }
  });
};

const requestCreateProposalLogic = (
  username: string,
  receiver: string,
  subject: string,
  permlink: string,
  daily_pay: string,
  start: string,
  end: string,
  extensions: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestCreateProposal?.(
        username,
        receiver,
        subject,
        permlink,
        daily_pay,
        start,
        end,
        extensions,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "createProposal",
      });
    }
  });
};

const requestRemoveProposalLogic = (
  username: string,
  proposal_ids: string,
  extensions: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestRemoveProposal?.(
        username,
        proposal_ids,
        extensions,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "removeProposal",
      });
    }
  });
};

const requestUpdateProposalVoteLogic = (
  username: string,
  proposal_ids: string,
  approve: boolean,
  extensions: string,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestUpdateProposalVote?.(
        username,
        proposal_ids,
        approve,
        extensions,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "updateProposalVote",
      });
    }
  });
};

const requestAddAccountLogic = (
  username: string,
  keys: { active?: string; posting?: string; memo?: string } | object,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestAddAccount?.(username, keys, callback, rpc);
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "addAccount",
      });
    }
  });
};

const requestConversionLogic = (
  username: string,
  amount: string,
  collaterized: boolean,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestConversion?.(
        username,
        amount,
        collaterized,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "conversion",
      });
    }
  });
};

const requestRecurrentTransferLogic = (
  username: string | null,
  to: string,
  amount: string,
  currency: "HIVE" | "HBD" | string,
  memo: string,
  recurrence: number,
  executions: number,
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestRecurrentTransfer?.(
        username,
        to,
        amount,
        currency,
        memo,
        recurrence,
        executions,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "recurrentTransfer",
      });
    }
  });
};

const requestSwapLogic = (
  username: string | null,
  startToken: string,
  endToken: string,
  amount: number,
  slippage: number,
  steps: object[],
  callback: (response: any) => void,
  rpc?: string | null
): void => {
  KeychainHelperUtils.isKeychainInstalled(window, (isDetected: boolean) => {
    if (isDetected) {
      window.hive_keychain?.requestSwap?.(
        username,
        startToken,
        endToken,
        amount,
        slippage,
        steps,
        callback,
        rpc
      );
    } else {
      console.error("Hive Keychain is not installed.");
      callback({
        success: false,
        message: "Hive Keychain is not installed.",
        id: "swap",
      });
    }
  });
};

export const KeychainHelper = {
  /**
   * Requests a login operation via Hive Keychain by signing a challenge message with the user's posting key.
   *
   * This function first checks if Hive Keychain is installed. If available, it sends a sign buffer request
   * to the extension, asking the user to sign a provided challenge. The result (success or failure) is
   * returned through the provided callback function.
   *
   * @param {string} username - The Hive username of the account to authenticate.
   * @param {string} challenge - The challenge string (random text or token) to be signed for authentication.
   * @param {(response: any) => void} callback - A callback function to handle the response from Hive Keychain.
   * @param {string} [title] - (Optional) A custom title to display in the Hive Keychain popup window.
   *
   * @example
   * requestLoginLogic('myusername', 'randomChallengeToken', (response) => {
   *   if (response.success) {
   *     console.log('Login successful:', response.result.signed_buffer);
   *   } else {
   *     console.error('Login failed:', response.message);
   *   }
   * }, 'My App Title');
   */
  requestLogin: requestLoginLogic,

  /**
   * Requests to add a new account to Keychain storage.
   * This function allows importing account keys or adding authorized accounts to Keychain.
   *
   * @param username username of the account to be added.
   * @param keys private keys or authorized accounts object ({active:'...', posting:'...', memo:'...'} or {'@username': weight, ...}).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean`.
   * @param [rpc] Override user's RPC settings (optional - not explicitly in docs, but common).
   *
   * @example
   * // Request to add an account by keys (example - handle keys securely!)
   * // WARNING: Do not hardcode or handle private keys insecurely in real applications.
   * // This is illustrative only.
   * const accountName = 'new_account';
   * const accountKeys = {
   *  active: 'PRIVATE_ACTIVE_KEY', // Replace with actual private keys (handle securely!)
   *  posting: 'PRIVATE_POSTING_KEY',
   *  memo: 'PRIVATE_MEMO_KEY'
   * };
   * // Or by authorized accounts:
   * // const accountKeys = { '@trusted_account': 1 };
   *
   * KeychainHelper.requestAddAccount(accountName, accountKeys, (response) => {
   *  console.log('Add Account Response:', response);
   *  if (response.success) {
   *    console.log('Account added to Keychain successfully!');
   *  } else {
   *    console.warn('Add Account failed:', response.message);
   *  }
   * });
   */
  requestAddAccount: requestAddAccountLogic,

  /**
   * Requests to add account authority over another account (multisig setup).
   * This allows setting up multi-signature permissions.
   *
   * @param account Hive account whose authority is being modified.
   * @param authorizedUsername Account to grant authority to.
   * @param role Type of authority ('Posting', 'Active', or 'Memo').
   * @param weight Weight of the authority (0-10000). Set to 0 to remove authority.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to add account authority
   * const accountToModify = 'your_account';
   * const accountToAuthorize = 'trusted_account';
   * KeychainHelper.requestAddAccountAuthority(accountToModify, accountToAuthorize, 'Active', 1000, (response) => {
   *  console.log('Add Account Authority Response:', response);
   *  if (response.success) {
   *    console.log('Authority added successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Add Account Authority failed:', response.message);
   *  }
   * });
   */
  requestAddAccountAuthority: requestAddAccountAuthorityLogic,

  /**
   * Requests to add a new key authority to an account (multisig setup).
   * This associates a public key with account permissions.
   *
   * @param account Hive account whose authority is being modified.
   * @param authorizedKey New public key to be associated with the account.
   * @param role Type of authority ('Posting', 'Active', or 'Memo').
   * @param weight Weight of the key authority (0-10000).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to add key authority
   * const accountToModify = 'your_account';
   * const newPublicKey = 'STMzzz'; // Replace with actual public key
   * KeychainHelper.requestAddKeyAuthority(accountToModify, newPublicKey, 'Posting', 500, (response) => {
   *  console.log('Add Key Authority Response:', response);
   *  if (response.success) {
   *    console.log('Key authority added successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Add Key Authority failed:', response.message);
   *  }
   * });
   */
  requestAddKeyAuthority: requestAddKeyAuthorityLogic,

  /**
   * Requests a generic broadcast of multiple operations.
   * This is a fundamental function for broadcasting transactions.
   *
   * @param account Hive account to perform the request.
   * @param operations Array of operations to be broadcasted. Each operation is a tuple [operation_name, operation_payload].
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to broadcast a transfer operation
   * const account = 'your_account';
   * const transferOperation = [
   *  'transfer',
   * {
   *  from: account,
   *  to: 'recipient_account', // Replace with recipient
   *  amount: '1.000 HIVE', // Replace with amount and asset
   *  memo: 'Test transfer via Keychain'
   * }];
   * KeychainHelper.requestBroadcast(account, [transferOperation], 'Active', (response) => {
   *  console.log('Broadcast Response:', response);
   *  if (response.success) {
   *    console.log('Broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Broadcast failed:', response.message);
   *  }
   * });
   */
  requestBroadcast: requestBroadcastLogic,

  /**
   * Requests a currency conversion broadcast (HIVE <-> HBD).
   * This function allows users to convert between HIVE and HBD.
   *
   * @param username Hive account performing the conversion.
   * @param amount amount to be converted (as a string).
   * @param collaterized true to convert HIVE to HBD, false for HBD to HIVE.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to convert HIVE to HBD
   * const account = 'your_account';
   * const amountToConvert = '10.000'; // Amount of HIVE
   * const convertHiveToHbd = true; // True for HIVE -> HBD, false for HBD -> HIVE
   * KeychainHelper.requestConversion(account, amountToConvert, convertHiveToHbd, (response) => {
   *  console.log('Conversion Response:', response);
   *  if (response.success) {
   *    console.log('Conversion broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Conversion failed:', response.message);
   *  }
   * });
   */
  requestConversion: requestConversionLogic,

  /**
   * Requests the creation of an account using claimed account creation tokens.
   * This function utilizes existing account creation tokens to create a new account.
   *
   * @param username Hive account performing the request (account that has claimed tokens).
   * @param new_account New account name to be created.
   * @param owner owner authority object.
   * @param active active authority object.
   * @param posting posting authority object.
   * @param memo public memo key string.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to create a claimed account (Requires claimed account creation tokens)
   * const creatorAccount = 'your_account'; // Account with claimed tokens
   * const newAccountName = 'new_account_name'; // Desired new account name
   * // Replace with actual public keys or authority structures
   * const ownerAuth = { weight_threshold: 1, account_auths: [], key_auths: [['STMownerKEY', 1]] };
   * const activeAuth = { weight_threshold: 1, account_auths: [], key_auths: [['STMactiveKEY', 1]] };
   * const postingAuth = { weight_threshold: 1, account_auths: [], key_auths: [['STMpostingKEY', 1]] };
   * const memoKey = 'STMmemoKEY';
   * KeychainHelper.requestCreateClaimedAccount(
   *  creatorAccount, newAccountName, ownerAuth, activeAuth, postingAuth, memoKey,
   *  (response) => {
   *    console.log('Create Claimed Account Response:', response);
   *    if (response.success) {
   *      console.log('Account created successfully! Tx ID:', response.tx_id);
   *    } else {
   *      console.warn('Account creation failed:', response.message);
   *    }
   * });
   */
  requestCreateClaimedAccount: requestCreateClaimedAccountLogic,

  /**
   * Requests the creation of a Decentralized Hive Fund (DHF) proposal.
   * This function allows users to submit proposals for funding from the DHF.
   *
   * @param username Hive account submitting the proposal.
   * @param receiver Account receiving the funding.
   * @param subject Title/subject of the proposal.
   * @param permlink Permlink to the proposal description content.
   * @param daily_pay Daily amount of HBD or HIVE requested (as a string).
   * @param start Starting date string (e.g., 'YYYY-MM-DDTHH:mm:ss').
   * @param end Ending date string (e.g., 'YYYY-MM-DDTHH:mm:ss').
   * @param extensions Stringified Array of extensions (usually empty or specific to proposal type).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to create a DHF proposal
   * const account = 'your_account';
   * const receiver = 'proposal_receiver'; // Account to receive funds
   * const permlink = 'my-awesome-proposal-' + Date.now();
   * KeychainHelper.requestCreateProposal(
   *  account,
   *  receiver,
   *  'Fund my Development Project', // Subject
   *  permlink, // Permlink to description post
   *  '50.000 HBD', // Daily pay
   *  '2025-01-01T00:00:00', // Start date
   *  '2025-12-31T23:59:59', // End date
   *  '[]', // Extensions (stringified empty array common)
   *  (response) => {
   *    console.log('Create Proposal Response:', response);
   *    if (response.success) {
   *      console.log('Proposal created successfully! Tx ID:', response.tx_id);
   *    } else {
   *      console.warn('Proposal creation failed:', response.message);
   *    }
   *  }
   * );
   */
  requestCreateProposal: requestCreateProposalLogic,

  /**
   * Requests a custom JSON broadcast.
   * This is used for interacting with SMTs, DApps, or other custom blockchain operations.
   *
   * @param account Hive account to perform the request. If null, user can choose the account.
   * @param id Type of custom_json operation to be broadcasted (a string identifier).
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param json Stringified JSON payload for the custom operation.
   * @param display_msg Message to display to the user in the confirmation dialog.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to broadcast a custom JSON operation (example for a hypothetical DApp)
   * const account = 'your_account'; // Can be null
   * const customJsonId = 'my_dapp_operation';
   * const customPayload = { action: 'play_game', level: 5 };
   * const customJson = JSON.stringify(customPayload);
   * const displayMessage = 'Confirm playing game level 5.';
   * KeychainHelper.requestCustomJson(account, customJsonId, 'Posting', customJson, displayMessage, (response) => {
   *  console.log('Custom JSON Response:', response);
   *  if (response.success) {
   *    console.log('Custom JSON broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Custom JSON broadcast failed:', response.message);
   *  }
   * });
   */
  requestCustomJson: requestCustomJsonLogic,

  /**
   * Requests a delegation broadcast of Hive Power or VESTS.
   * This function allows users to delegate staking power to another account.
   *
   * @param [username] Hive account performing the delegation. If null, user can choose.
   * @param delegatee Account to receive the delegation.
   * @param amount Amount to be delegated (as a string, requires 3 decimals for HP, 6 for VESTS).
   * @param unit 'HP' or 'VESTS'.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to delegate Hive Power
   * const delegatorAccount = 'your_account'; // Can be null
   * const delegateeAccount = 'delegate_account'; // Replace with delegatee
   * const amount = '100.000'; // Delegate 100 HP
   * const unit = 'HP';
   * KeychainHelper.requestDelegation(delegatorAccount, delegateeAccount, amount, unit, (response) => {
   *  console.log('Delegation Response:', response);
   *  if (response.success) {
   *    console.log('Delegation broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Delegation failed:', response.message);
   *  }
   * });
   */
  requestDelegation: requestDelegationLogic,

  /**
   * Requests to encode a message to verify authority over an account.
   * This function prompts the user to encode a message using their private key.
   *
   * @param username Hive account to perform the request.
   * @param receiver Account that will decode the string.
   * @param message Message to be encrypted.
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `result: string` (the encoded message).
   *
   * @example
   * // Request to encode a message
   * const username = 'your_account';
   * const receiver = 'other_account';
   * const messageToEncode = 'Hello, Keychain!';
   * KeychainHelper.requestEncodeMessage(username, receiver, messageToEncode, 'Memo', (response) => {
   *  console.log('Encode Message Response:', response);
   *  if (response.success) {
   *    const encodedMessage = response.result;
   *    console.log('Encoded Message:', encodedMessage);
   *    // Send the encoded message to a server for verification
   *  } else {
   *    console.warn('Encode Message failed:', response.message);
   *  }
   * });
   */
  requestEncodeMessage: requestEncodeMessageLogic,

  /**
   * Requests to encode a message with multiple receivers (multisig context).
   * This function allows encoding a message readable by multiple public keys.
   *
   * @param username Hive account to perform the request.
   * @param publicKeys Array of public keys that can decode the string.
   * @param message Message to be encrypted.
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `result: string` (the encoded message).
   *
   * @example
   * // Request to encode a message for multiple keys
   * const username = 'your_account';
   * const publicKeys = ['STMxxx', 'STMyyy']; // Replace with actual public keys
   * const messageToEncode = 'Confidential message.';
   * KeychainHelper.requestEncodeWithKeys(username, publicKeys, messageToEncode, 'Memo', (response) => {
   *  console.log('Encode With Keys Response:', response);
   *  if (response.success) {
   *    const encodedMessage = response.result;
   *    console.log('Encoded Message (Multisig):', encodedMessage);
   *  } else {
   *    console.warn('Encode With Keys failed:', response.message);
   *  }
   * });
   */
  requestEncodeWithKeys: requestEncodeWithKeysLogic,

  /**
   * Requests to broadcast a blog post or a comment.
   * This function simplifies the process of posting content to the Hive blockchain.
   *
   * @param account Hive account to perform the request.
   * @param title Title of the blog post (empty string '' for comments).
   * @param body Content of the post/comment (Markdown format).
   * @param parent_perm Permlink of the parent post (for comments) or the first tag/category (for top-level posts).
   * @param parent_account Author of the parent post (for comments) or null (for top-level posts).
   * @param json_metadata Stringified JSON metadata (e.g., tags, format, app used).
   * @param permlink Unique permlink for the post/comment.
   * @param comment_options_json Stringified JSON with comment options (e.g., reward options, beneficiaries). Use null if no options.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to broadcast a new blog post
   * const account = 'your_account';
   * const permlink = 'my-first-post-' + Date.now(); // Ensure unique permlink
   * const jsonMetadata = JSON.stringify({ tags: ['test', 'api', 'hive'], app: 'my-app/1.0' });
   * KeychainHelper.requestPost(
   *  account,
   *  'My First Post via Keychain', // Title
   *  'This is the **body** of my first post!', // Body (Markdown)
   *  'test', // Parent perm / first tag
   *  null, // Parent account (null for top-level post)
   *  jsonMetadata, // JSON Metadata
   *  permlink, // Permlink
   *  null, // Comment options (null for default)
   *  (response) => {
   *    console.log('Post Response:', response);
   *    if (response.success) {
   *      console.log('Post broadcast successful! Tx ID:', response.tx_id);
   *     } else {
   *      console.warn('Post broadcast failed:', response.message);
   *    }
   *  }
   * );
   * @example
   * //Request a new comment in post
   * //For example using a blog post as found in:
   * // https://peakd.com/hive/@theghost1980/impulsemos-hive-cuatro-propuestas-innovadoras-para-transformar-nuestro-ecosistema-engspa
   * //Please notice that the permlink for this post is: 
   * // impulsemos-hive-cuatro-propuestas-innovadoras-para-transformar-nuestro-ecosistema-engspa
   * //Which will be related to the post title.
   * //There is a useful util inside this helper package as KeychainHelperUtils.generateRandomString
   * //I did this to help when generating a unique permlink.
   * const parentAuthor = 'theghost1980';
   * const parentPermlink = 'impulsemos-hive-cuatro-propuestas-innovadoras-para-transformar-nuestro-ecosistema-engspa';
   * const account = 'your_account';
   * const permlink = "re-" + parentAuthor + "-" + PermlinkUtils.generateRandomString(6, true);
   *  const jsonMetadata: Record<string, any> = {
      tags: ["hive-124309", "hsbi", "tag1", "tag2"],
      format: "markdown",
      app: "hsbi-onboarder/v1",
      image: [],
      users: [],
    };
    const commentOptions = {
      author: author,
      permlink: permlink,
      max_accepted_payout: "10000.000 SBD",
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
      percent_hbd: 100,
    };
   * KeychainHelper.requestPost(
   *  account,
   *  '', // Note it must be an empty string when posting a comment.
   *  'This is the **body** of my first comment!', // comment Body (Markdown supported and recommended).
   *  parentPermlink, // Parent permlink for comment in post
   *  parentAuthor,
   *  JSON.stringify(jsonMetadata), // json_metadata
   *  permlink,
   *  JSON.stringify(commentOptions),
   *  (response) => {
   *    console.log('Post Comment Response:', response);
   *    if (response.success) {
   *      console.log('Post Comment broadcast successful! Tx ID:', response.tx_id);
   *      //As a good practice go to the post and check if the comment was published.
   *     } else {
   *      console.warn('Post Comment broadcast failed:', response.message);
   *    }
   *  }
   * );
   */
  requestPost: requestPostLogic,

  /**
   * Requests a power down broadcast.
   * This function allows users to unstake Hive Power back into liquid HIVE.
   *
   * @param username Hive account performing the power down.
   * @param hive_power Amount of Hive Power to be powered down (as a string). Use '0.000' to stop existing power down.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to power down Hive Power
   * const account = 'your_account';
   * const amount = '5.000000'; // Power down 5 VESTS (Hive Power shown in VESTS)
   * KeychainHelper.requestPowerDown(account, amount, (response) => {
   *  console.log('Power Down Response:', response);
   *  if (response.success) {
   *    console.log('Power down broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Power down failed:', response.message);
   *  }
   * });
   */
  requestPowerDown: requestPowerDownLogic,

  /**
   * Requests a power up broadcast.
   * This function allows users to stake HIVE into Hive Power.
   *
   * @param username Hive account performing the power up.
   * @param recipient Account receiving the power up (usually the same as username).
   * @param hive Amount of HIVE to be powered up (as a string).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to power up HIVE
   * const account = 'your_account';
   * const recipient = account; // Powering up to self
   * const amount = '10.000'; // Power up 10 HIVE
   * KeychainHelper.requestPowerUp(account, recipient, amount, (response) => {
   *  console.log('Power Up Response:', response);
   *  if (response.success) {
   *    console.log('Power up broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Power up failed:', response.message);
   *  }
   * });
   */
  requestPowerUp: requestPowerUpLogic,

  /**
   * Requests to set or remove a proxy for voting.
   * This function allows users to assign their voting power to a proxy account.
   *
   * @param [username] Hive account setting the proxy. If null, user can choose.
   * @param proxy Account to become the proxy. Use an empty string ('') to remove an existing proxy.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to set a proxy
   * const account = 'your_account'; // Can be null
   * const proxyAccount = 'proxy_account'; // Replace with proxy account
   * KeychainHelper.requestProxy(account, proxyAccount, (response) => {
   *  console.log('Proxy Response:', response);
   *  if (response.success) {
   *    console.log('Proxy set successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Setting proxy failed:', response.message);
   *  }
   * });
   *
   * @example
   * // Request to remove a proxy
   * const account = 'your_account'; // Can be null
   * KeychainHelper.requestProxy(account, '', (response) => {
   *  console.log('Remove Proxy Response:', response);
   *  if (response.success) {
   *    console.log('Proxy removed successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Removing proxy failed:', response.message);
   *  }
   * });
   */
  requestProxy: requestProxyLogic,

  /**
   * Requests a recurrent transfer broadcast.
   * This function allows setting up automated, recurring transfers.
   *
   * @param [username] Hive account to perform the request (optional). If null, user can choose.
   * @param to Account receiving the transfers.
   * @param amount amount to be sent on each execution (as a string).
   * @param currency 'HIVE', 'HBD', or other token symbol.
   * @param memo transfer memo.
   * @param recurrence How often to send in hours (minimum 24).
   * @param executions The number of times the payment will be executed (minimum 2).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to set up a recurrent HBD transfer
   * const account = 'your_account'; // Can be null
   * const recipient = 'payment_receiver'; // Replace with recipient
   * const amount = '1.000'; // Send 1 HBD
   * const currency = 'HBD';
   * const memo = 'Weekly payment';
   * const recurrence = 24 * 7; // Every 7 days (168 hours)
   * const executions = 10; // 10 total payments
   * KeychainHelper.requestRecurrentTransfer(
   *  account, recipient, amount, currency, memo, recurrence, executions,
   *  (response) => {
   *    console.log('Recurrent Transfer Response:', response);
   *    if (response.success) {
   *      console.log('Recurrent transfer broadcast successful! Tx ID:', response.tx_id);
   *    } else {
   *      console.warn('Recurrent transfer failed:', response.message);
   *    }
   *  }
   * );
   */
  requestRecurrentTransfer: requestRecurrentTransferLogic,

  /**
   * Requests to remove an account authority over another account (multisig setup).
   * This removes previously granted multi-signature permissions.
   *
   * @param account Hive account whose authority is being modified.
   * @param authorizedUsername Account to remove authority from.
   * @param role Type of authority ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to remove account authority
   * const accountToModify = 'your_account';
   * const accountToDeauthorize = 'trusted_account';
   * KeychainHelper.requestRemoveAccountAuthority(accountToModify, accountToDeauthorize, 'Active', (response) => {
   *  console.log('Remove Account Authority Response:', response);
   *  if (response.success) {
   *    console.log('Authority removed successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Remove Account Authority failed:', response.message);
   *  }
   * });
   */
  requestRemoveAccountAuthority: requestRemoveAccountAuthorityLogic,

  /**
   * Requests to remove a key authority from an account (multisig setup).
   * This removes a public key's association with account permissions.
   *
   * @param account Hive account whose authority is being modified.
   * @param authorizedKey Key to be removed (public key).
   * @param role Type of authority ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to remove key authority
   * const accountToModify = 'your_account';
   * const publicKeyToRemove = 'STMzzz'; // Replace with the public key to remove
   * KeychainHelper.requestRemoveKeyAuthority(accountToModify, publicKeyToRemove, 'Posting', (response) => {
   *  console.log('Remove Key Authority Response:', response);
   *  if (response.success) {
   *    console.log('Key authority removed successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Remove Key Authority failed:', response.message);
   *  }
   * });
   */
  requestRemoveKeyAuthority: requestRemoveKeyAuthorityLogic,

  /**
   * Requests the removal of existing DHF proposals.
   * This function allows proposal authors or witnesses to remove proposals.
   *
   * @param username Hive account submitting the request (must have authority).
   * @param proposal_ids Stringified Array of IDs of the proposals to be removed (e.g., '[123, 456]').
   * @param extensions Stringified Array of extensions (usually empty).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to remove a DHF proposal
   * const account = 'your_account'; // Must have authority to remove
   * const proposalIdsToRemove = JSON.stringify([123, 456]); // Replace with actual proposal IDs
   * KeychainHelper.requestRemoveProposal(account, proposalIdsToRemove, '[]', (response) => {
   *  console.log('Remove Proposal Response:', response);
   *  if (response.success) {
   *    console.log('Proposals removed successfully! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Proposal removal failed:', response.message);
   *  }
   * });
   */
  requestRemoveProposal: requestRemoveProposalLogic,

  /**
   * Requests a token transfer broadcast (for Hive Engine tokens).
   * This function allows users to send Hive Engine tokens to another account.
   *
   * @param account Hive account sending the funds.
   * @param to Hive account to receive the transfer.
   * @param amount Amount to be transferred (as a string, number of decimals depends on the token).
   * @param memo Memo attached to the transfer.
   * @param currency Token symbol to be sent (e.g., 'LEO', 'SPS').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to transfer a Hive Engine token (e.g., LEO)
   * const fromAccount = 'your_account';
   * const toAccount = 'recipient_account'; // Replace with recipient
   * const amount = '10.500'; // Transfer 10.5 LEO
   * const memo = 'For the article.';
   * const tokenSymbol = 'LEO';
   * KeychainHelper.requestSendToken(fromAccount, toAccount, amount, memo, tokenSymbol, (response) => {
   *  console.log('Send Token Response:', response);
   *  if (response.success) {
   *    console.log('Token transfer broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Token transfer failed:', response.message);
   *  }
   * });
   */
  requestSendToken: requestSendTokenLogic,

  /**
   * Requests a message buffer to be signed with proper authority.
   * This function prompts the user to sign an arbitrary string (buffer) using a private key.
   *
   * @param account Hive account to perform the request. If null, user can choose the account.
   * @param message Message buffer (string) to be signed by the account.
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `result: string` (the signed message/signature).
   * @param [rpc] Override user's RPC settings (optional).
   * @param [title] Override the default dialog title (optional).
   *
   * @example
   * // Request to sign a message buffer
   * const account = 'your_account'; // Can be null
   * const messageToSign = 'Sign this data: 12345';
   * KeychainHelper.requestSignBuffer(account, messageToSign, 'Posting', (response) => {
   *  console.log('Sign Buffer Response:', response);
   *  if (response.success) {
   *    const signature = response.result;
   *    console.log('Signed Message (Signature):', signature);
   *    // Send the signature and message to a server for verification
   *  } else {
   *    console.warn('Sign Buffer failed:', response.message);
   *  }
   * });
   */
  requestSignBuffer: requestSignBufferLogic,

  /**
   * Requests to sign a transaction object with a given authority.
   * This is used for signing pre-built transactions before broadcasting them manually.
   *
   * @param account Hive account to perform the request.
   * @param tx Unsigned transaction object.
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `result: object` (the signed transaction object).
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to sign a transaction (example structure, actual tx object depends on type)
   * const account = 'your_account';
   * const unsignedTx = {
   *  ref_block_num: 12345,
   *  ref_block_prefix: 67890,
   *  expiration: '2025-12-31T00:00:00', // Example expiration
   *  operations: [['vote', { voter: account, author: 'other_user', permlink: 'post-permlink', weight: 10000 }]],
   *  extensions: [],
   *  signatures: [] // Signatures will be added by Keychain
   * };
   * KeychainHelper.requestSignTx(account, unsignedTx, 'Posting', (response) => {
   *  console.log('Sign Transaction Response:', response);
   *  if (response.success) {
   *    const signedTx = response.result;
   *    console.log('Signed Transaction:', signedTx);
   *    // You can now broadcast this signedTx manually if needed
   *  } else {
   *    console.warn('Sign Transaction failed:', response.message);
   *  }
   * });
   */
  requestSignTx: requestSignTxLogic,

  /**
   * Requests a token swap broadcast using Keychain's swap feature.
   * This function allows users to swap between different tokens via integrated swap providers.
   *
   * @param [username] Hive account to perform the request (optional). If null, user can choose.
   * @param startToken Incoming token symbol.
   * @param endToken Outgoing token symbol.
   * @param amount Amount of tokens to be swapped (as a number).
   * @param slippage Max acceptable slippage percentage (as a number).
   * @param steps Steps returned by KeychainSDK.swaps.getEstimation(), of type IStep[]. Requires fetching estimation first.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request a token swap (requires fetching estimation steps first)
   * // Example assumes 'estimatedSteps' variable holds steps from a previous getEstimation call.
   * const account = 'your_account'; // Can be null
   * const startToken = 'HIVE';
   * const endToken = 'DEC';
   * const amount = 5; // Swap 5 HIVE
   * const slippage = 1; // 1% slippage
   * // Replace 'estimatedSteps' with the actual steps fetched via KeychainSDK.swaps.getEstimation()
   * const estimatedSteps = [{ type: 'example', amount_in: '...', amount_out: '...', token_in: '...', token_out: '...' }];
   *
   * KeychainHelper.requestSwap(
   *  account, startToken, endToken, amount, slippage, estimatedSteps,
   *  (response) => {
   *    console.log('Swap Response:', response);
   *    if (response.success) {
   *      console.log('Swap broadcast successful! Tx ID:', response.tx_id);
   *    } else {
   *      console.warn('Swap failed:', response.message);
   *    }
   *  }
   * );
   */
  requestSwap: requestSwapLogic,

  /**
   * Requests a transfer broadcast of HIVE or HBD.
   * This function allows users to send funds to another account.
   *
   * @param account Hive account sending the funds.
   * @param to Hive account to receive the transfer.
   * @param amount Amount to be transferred (as a string, requires exactly 3 decimals, e.g., '1.000').
   * @param memo Transfer memo. Encrypted if it starts with '#'.
   * @param currency 'HIVE' or 'HBD'.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [enforce=false] If true, the user cannot choose a different account than 'account' in the dialog (optional).
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to transfer HIVE
   * const fromAccount = 'your_account';
   * const toAccount = 'recipient_account'; // Replace with recipient
   * const amount = '5.000'; // Transfer 5 HIVE
   * const memo = 'For services rendered.';
   * KeychainHelper.requestTransfer(fromAccount, toAccount, amount, memo, 'HIVE', (response) => {
   *  console.log('Transfer Response:', response);
   *  if (response.success) {
   *    console.log('Transfer broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Transfer failed:', response.message);
   *  }
   * });
   */
  requestTransfer: requestTransferLogic,

  /**
   * Requests to vote for or against existing DHF proposals.
   * This function allows accounts with voting power (HP) to support or not support proposals.
   *
   * @param username Hive account submitting the vote.
   * @param proposal_ids Stringified Array of IDs of the proposals to be voted on (e.g., '[123, 456]').
   * @param approve Set to true to support the proposals, false to remove a vote.
   * @param extensions Stringified Array of extensions (usually empty).
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to vote for DHF proposals
   * const account = 'your_account'; // Account with voting power
   * const proposalIdsToVoteOn = JSON.stringify([123, 456]); // Replace with actual proposal IDs
   * const support = true; // True to vote YES, false to vote NO (remove vote)
   * KeychainHelper.requestUpdateProposalVote(account, proposalIdsToVoteOn, support, '[]', (response) => {
   *  console.log('Update Proposal Vote Response:', response);
   *  if (response.success) {
   *    console.log('Proposal vote broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Proposal vote failed:', response.message);
   *  }
   * });
   */
  requestUpdateProposalVote: requestUpdateProposalVoteLogic,

  /**
   * Requests to verify authority by decoding a message.
   * This function prompts the user to decode a message using their private key.
   *
   * @param account Hive account to perform the request.
   * @param message Message to be decoded by the account.
   * @param key Type of key to use ('Posting', 'Active', or 'Memo').
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `value: boolean` (true if decoded successfully).
   *
   * @example
   * // Request to verify authority by decoding a message
   * const account = 'your_account';
   * const messageToDecode = 'Encoded message received from server.'; // Replace with actual encoded message
   * KeychainHelper.requestVerifyKey(account, messageToDecode, 'Memo', (response) => {
   *  console.log('Verify Key Response:', response);
   *  if (response.success && response.value) {
   *    console.log('Message decoded successfully! Authority verified.');
   *  } else {
   *    console.warn('Verify Key failed or message not decoded:', response.message);
   *  }
   * });
   */
  requestVerifyKey: requestVerifyKeyLogic,

  /**
   * Requests a vote broadcast on a content.
   * This function allows users to upvote or downvote a post or comment.
   *
   * @param account Hive account casting the vote.
   * @param permlink Permlink of the content being voted on.
   * @param author Author of the content being voted on.
   * @param weight Weight of the vote (-10000 for full downvote to 10000 for full upvote). 0 to remove vote.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to upvote a post
   * const account = 'your_account';
   * const author = 'author_account'; // Author of the content
   * const permlink = 'post-permlink'; // Permlink of the content
   * const weight = 10000; // Full upvote
   * KeychainHelper.requestVote(account, permlink, author, weight, (response) => {
   *  console.log('Vote Response:', response);
   *  if (response.success) {
   *    console.log('Vote broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Vote broadcast failed:', response.message);
   *  }
   * });
   */
  requestVote: requestVoteLogic,

  /**
   * Requests a witness vote broadcast.
   * This function allows users to vote for or against a witness.
   *
   * @param [username] Hive account casting the vote. If null, user can choose.
   * @param witness Account to vote for or against.
   * @param vote Set to true to vote for the witness, false to unvote.
   * @param callback Function that handles Keychain's response.
   * It is called with a response object typically including `success: boolean` and `tx_id: string`.
   * @param [rpc] Override user's RPC settings (optional).
   *
   * @example
   * // Request to vote for a witness
   * const votingAccount = 'your_account'; // Can be null
   * const witnessAccount = 'witness_account'; // Replace with witness
   * const vote = true; // True to vote, false to unvote
   * KeychainHelper.requestWitnessVote(votingAccount, witnessAccount, vote, (response) => {
   *  console.log('Witness Vote Response:', response);
   *  if (response.success) {
   *    console.log('Witness vote broadcast successful! Tx ID:', response.tx_id);
   *  } else {
   *    console.warn('Witness vote failed:', response.message);
   *  }
   * });
   */
  requestWitnessVote: requestWitnessVoteLogic,
};
