import * as SecureStore from "expo-secure-store";

/**
 * Convex Auth needs a persistent, cross-restart token store. On web that's
 * localStorage; on native there's no such global, so we wrap expo-secure-store
 * (Keychain on iOS, Keystore-backed EncryptedSharedPreferences on Android) to
 * satisfy the same {getItem, setItem, removeItem} shape Convex Auth expects.
 */
export const secureTokenStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
