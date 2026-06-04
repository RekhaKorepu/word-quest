// Minimal react-native mock for Vitest unit tests
export const Platform = {
  OS: 'ios' as const,
  select: (obj: Record<string, unknown>) => obj['ios'] ?? obj['default'],
};
