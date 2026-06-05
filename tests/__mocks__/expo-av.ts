import { vi } from 'vitest';

export const Audio = {
  setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
  Sound: {
    createAsync: vi.fn().mockImplementation(() =>
      Promise.resolve({
        sound: {
          replayAsync: vi.fn().mockResolvedValue(undefined),
          stopAsync: vi.fn().mockResolvedValue(undefined),
        },
      })
    ),
  },
};
