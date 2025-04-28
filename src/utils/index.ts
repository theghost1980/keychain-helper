const isKeychainInstalledLogic = (
  windowObj: Window,
  callback: (installed: boolean) => void,
  delayMs: number = 120
): void => {
  setTimeout(() => {
    const installed = typeof windowObj?.hive_keychain !== "undefined";
    callback(installed);
  }, delayMs);
};

function generateRandomStringLogic(
  length: number,
  includeTimestamp: boolean
): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return (
    result.toLowerCase() + (includeTimestamp ? "-" + Date.now().toString() : "")
  );
}

export const KeychainHelperUtils = {
  /**
   * Checks if Hive Keychain browser extension is installed, with an optional delay.
   * Note: This function is ASYNCHRONOUS and delivers the result via a callback *after* the delay.
   *
   * @param windowObj The window object (usually the global window).
   * @param callback The function to call with the result (true if installed, false otherwise) after the delay.
   * @param [delayMs=120] The time to wait in milliseconds before checking. Optional, defaults to 120ms.
   *
   * @example
   * // Check with default delay (120ms)
   * KeychainHelperUtil.isKeychainInstalled(window, (isInstalled) => {
   *  if (isInstalled) {
   *    console.log('Hive Keychain was detected after the delay!');
   *    // Proceed with Keychain operations
   *  } else {
   *    console.warn('Hive Keychain was NOT detected after the delay.');
   *    // Prompt user to install Keychain
   *  }
   * });
   *
   * @example
   * // Check with a custom delay (e.g., 500ms)
   * KeychainHelperUtil.isKeychainInstalled(window, (isInstalled) => {
   *  if (isInstalled) {
   *    console.log('Hive Keychain was detected after 500ms!');
   *  } else {
   *    console.warn('Hive Keychain was NOT detected after 500ms.');
   *  }
   * }, 500);
   */
  isKeychainInstalled: isKeychainInstalledLogic,

  /**
   * Generates a random alphanumeric string of a specified length.
   * Optionally appends a timestamp prefixed with a hyphen.
   * Note: This is recommended when posting a comment to avoid posible permlink repetition.
   *
   * @param length The desired length of the random string part (excluding the timestamp).
   * @param includeTimestamp If true, a hyphen followed by the current timestamp will be appended to the string.
   * @returns A lowercase string containing random alphanumeric characters, optionally followed by "-timestamp".
   *
   * @example
   * // Generate a random string of length 6 without a timestamp
   * const randomId = generateRandomString(6, false);
   * console.log(randomId); // Example output: "a1b2c3"
   *
   * @example
   * // Generate a random string of length 15 with a timestamp
   * const sessionId = generateRandomString(15, true);
   * console.log(sessionId); // Example output: "x9y8z7w6v5u4t-1678886400000" (timestamp will vary)
   */
  generateRandomString: generateRandomStringLogic,
};
