import type { WrappedMethod } from "./dispatch";

export interface MethodSpec {
  /** Posición del callback en la firma de la extensión (base 0). */
  callbackIndex: number;
  /** Identificador de la v1 usado en las respuestas sintéticas. */
  id: string;
}

/**
 * Tabla única de métodos envueltos. Las posiciones del callback salen de
 * `public/hive_keychain.js` de la extensión.
 */
export const METHOD_SPECS: Record<WrappedMethod, MethodSpec> = {
  requestEncodeMessage: { callbackIndex: 4, id: "encodeMessage" },
  requestEncodeWithKeys: { callbackIndex: 4, id: "encodeWithKeys" },
  requestVerifyKey: { callbackIndex: 3, id: "verifyKey" },
  requestSignBuffer: { callbackIndex: 3, id: "signBuffer" },
  requestAddAccountAuthority: { callbackIndex: 4, id: "addAccountAuthority" },
  requestRemoveAccountAuthority: {
    callbackIndex: 3,
    id: "removeAccountAuthority",
  },
  requestAddKeyAuthority: { callbackIndex: 4, id: "addKeyAuthority" },
  requestRemoveKeyAuthority: { callbackIndex: 3, id: "removeKeyAuthority" },
  requestBroadcast: { callbackIndex: 3, id: "broadcast" },
  requestSignTx: { callbackIndex: 3, id: "signTx" },
  requestPost: { callbackIndex: 8, id: "post" },
  requestVote: { callbackIndex: 4, id: "vote" },
  requestCustomJson: { callbackIndex: 5, id: "customJson" },
  requestTransfer: { callbackIndex: 5, id: "transfer" },
  requestSavingsOperation: { callbackIndex: 6, id: "savingsOperation" },
  requestSendToken: { callbackIndex: 5, id: "sendToken" },
  requestDelegation: { callbackIndex: 4, id: "delegation" },
  requestWitnessVote: { callbackIndex: 3, id: "witnessVote" },
  requestProxy: { callbackIndex: 2, id: "proxy" },
  requestPowerUp: { callbackIndex: 3, id: "powerUp" },
  requestPowerDown: { callbackIndex: 2, id: "powerDown" },
  requestCreateClaimedAccount: {
    callbackIndex: 6,
    id: "createClaimedAccount",
  },
  requestCreateProposal: { callbackIndex: 8, id: "createProposal" },
  requestRemoveProposal: { callbackIndex: 3, id: "removeProposal" },
  requestUpdateProposalVote: { callbackIndex: 4, id: "updateProposalVote" },
  requestAddAccount: { callbackIndex: 2, id: "addAccount" },
  requestConversion: { callbackIndex: 3, id: "conversion" },
  requestRecurrentTransfer: { callbackIndex: 7, id: "recurrentTransfer" },
  requestSwap: { callbackIndex: 6, id: "swap" },
};
