import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as audioManager from '../../src/services/audioManager';
import * as profileStorage from '../../src/utils/profileStorage';

const mockReplayAsync = vi.fn();
const mockStopAsync = vi.fn();
const mockCreateAsync = vi.fn().mockImplementation(() =>
  Promise.resolve({
    sound: {
      replayAsync: mockReplayAsync,
      stopAsync: mockStopAsync,
    },
  })
);

vi.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: vi.fn(),
    Sound: {
      createAsync: (...args: any[]) => mockCreateAsync(...args),
    },
  },
}));

describe('AudioManager (FR-001, FR-002)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    audioManager.resetAudioState();
    // Clear storage mocks by using profileStorage clear/default save
    await profileStorage.saveAudioMuted(false);
  });

  it('preloads sound assets during initialization', async () => {
    await audioManager.initializeAudio();
    expect(mockCreateAsync).toHaveBeenCalledTimes(6);
  });

  it('plays sound if not muted', async () => {
    await audioManager.initializeAudio();
    await audioManager.playSound('button_click');
    expect(mockReplayAsync).toHaveBeenCalled();
  });

  it('does not play sound if muted', async () => {
    await audioManager.initializeAudio();
    await audioManager.setMuted(true);
    mockReplayAsync.mockClear();

    await audioManager.playSound('button_click');
    expect(mockReplayAsync).not.toHaveBeenCalled();
  });

  it('stops all active playing sounds when muted mid-playback', async () => {
    await audioManager.initializeAudio();
    await audioManager.playSound('puzzle_solve');
    await audioManager.setMuted(true);

    expect(mockStopAsync).toHaveBeenCalled();
  });

  it('correctly loads persisted mute configuration from storage', async () => {
    await profileStorage.saveAudioMuted(true);
    await audioManager.initializeAudio();

    expect(audioManager.isMuted()).toBe(true);
  });
});
