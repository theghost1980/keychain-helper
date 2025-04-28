import { HiveKeychain } from "./interfaces/index";

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
}
