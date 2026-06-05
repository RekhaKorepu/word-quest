export const CONFIG = {
  get GEMINI_API_KEY(): string {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  },
};
