import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    alias: {
      // Mock AsyncStorage for unit tests — avoids React Native native module errors
      '@react-native-async-storage/async-storage': new URL(
        './tests/__mocks__/async-storage.ts',
        import.meta.url
      ).pathname,
      // Mock react-native for unit tests — avoids Flow parse errors
      'react-native': new URL(
        './tests/__mocks__/react-native.ts',
        import.meta.url
      ).pathname,
    },
  },
});
