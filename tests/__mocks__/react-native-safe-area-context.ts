// Minimal react-native-safe-area-context mock for Vitest unit tests
export const SafeAreaView = ({ children }: { children: any }) => children;
export const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
export const SafeAreaProvider = ({ children }: { children: any }) => children;
