import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/setup.ts'],
    alias: [
      {
        find: '@react-native-async-storage/async-storage',
        replacement: new URL('./tests/__mocks__/async-storage.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native',
        replacement: new URL('./tests/__mocks__/react-native.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native-safe-area-context',
        replacement: new URL('./tests/__mocks__/react-native-safe-area-context.ts', import.meta.url).pathname,
      },
      {
        find: 'expo-av',
        replacement: new URL('./tests/__mocks__/expo-av.ts', import.meta.url).pathname,
      },
      {
        find: /.*\.mp3$/,
        replacement: new URL('./tests/__mocks__/sound-mock.js', import.meta.url).pathname,
      },
      {
        find: /.*\.wav$/,
        replacement: new URL('./tests/__mocks__/sound-mock.js', import.meta.url).pathname,
      },
    ],
  },
});
