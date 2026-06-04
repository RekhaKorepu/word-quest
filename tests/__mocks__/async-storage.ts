// In-memory mock for @react-native-async-storage/async-storage
// Used by Vitest during unit testing to avoid React Native native module dependencies

const store: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => store[key] ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    store[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete store[key];
  },
  clear: async (): Promise<void> => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
  getAllKeys: async (): Promise<string[]> => Object.keys(store),
};

export default AsyncStorage;
