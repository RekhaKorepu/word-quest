/**
 * Platform-aware key-value storage utility.
 *
 * On native (iOS / Android) it delegates to @react-native-async-storage/async-storage.
 * On web (Expo web) it delegates to window.localStorage so we never hit the
 * "Native module is null" error from AsyncStorage on web.
 */

import { Platform } from 'react-native';

// Lazily import AsyncStorage only on native to avoid triggering the native
// module resolution on web.
let _asyncStorage: {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
} | null = null;

async function getNativeStorage() {
  if (!_asyncStorage) {
    const mod = await import('@react-native-async-storage/async-storage');
    _asyncStorage = mod.default;
  }
  return _asyncStorage;
}

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    try {
      const store = await getNativeStorage();
      return store.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore (e.g. private browsing quota errors)
      }
      return;
    }
    try {
      const store = await getNativeStorage();
      await store.setItem(key, value);
    } catch {
      // Ignore
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore
      }
      return;
    }
    try {
      const store = await getNativeStorage();
      await store.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
