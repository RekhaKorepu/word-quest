/**
 * Audio Manager Service
 *
 * Preloads sound effects at app startup for low-latency playback (SC-001).
 * Integrates global mute settings stored persistently (FR-002).
 * Correctly handles the edge case of muting mid-playback.
 */
import { Platform, NativeModules } from 'react-native';
import { loadAudioMuted, saveAudioMuted } from '../utils/profileStorage';

const SOUNDS = {
  button_click: require('../../assets/sounds/button_click.wav'),
  puzzle_solve: require('../../assets/sounds/puzzle_solve.wav'),
  puzzle_fail: require('../../assets/sounds/puzzle_fail.wav'),
  hint_reveal: require('../../assets/sounds/hint_reveal.wav'),
  achievement: require('../../assets/sounds/achievement.wav'),
  level_complete: require('../../assets/sounds/level_complete.wav'),
};

export type SoundEvent = keyof typeof SOUNDS;

const soundObjects: Record<string, any> = {};
let mutedState = false;
let isInitialized = false;
let _Audio: any = null;

const isAudioSupported = (): boolean => {
  if (Platform.OS === 'web') return false;
  if (process.env.NODE_ENV === 'test') return true;
  return !!NativeModules?.ExponentAV || !!NativeModules?.ExpoAV;
};

async function getAudioModule(): Promise<any> {
  if (!_Audio) {
    const mod = await import('expo-av');
    _Audio = mod.Audio || mod.default?.Audio || mod.default;
  }
  return _Audio;
}

export async function initializeAudio(): Promise<void> {
  if (isInitialized) return;
  if (!isAudioSupported()) return;
  try {
    mutedState = await loadAudioMuted();
    
    const audio = await getAudioModule();
    
    // Configure expo audio mode
    await audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });

    // Preload sounds
    for (const [key, asset] of Object.entries(SOUNDS)) {
      const { sound } = await audio.Sound.createAsync(asset, { shouldPlay: false });
      soundObjects[key] = sound;
    }
    isInitialized = true;
  } catch (e) {
    console.warn('[AudioManager] Failed to initialize audio:', e);
  }
}

export async function playSound(event: SoundEvent): Promise<void> {
  if (mutedState) return;
  if (!isAudioSupported()) return;
  
  try {
    if (!isInitialized) {
      await initializeAudio();
    }
    const sound = soundObjects[event];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (e) {
    console.warn(`[AudioManager] Failed to play sound for event ${event}:`, e);
  }
}

export async function setMuted(muted: boolean): Promise<void> {
  mutedState = muted;
  await saveAudioMuted(muted);
  if (!isAudioSupported()) return;
  
  try {
    // Edge case: if muted, stop all active playing sounds immediately
    if (muted) {
      for (const sound of Object.values(soundObjects)) {
        if (sound) {
          await sound.stopAsync();
        }
      }
    }
  } catch (e) {
    console.warn('[AudioManager] Failed to stop active playing sounds on mute:', e);
  }
}

export function isMuted(): boolean {
  return mutedState;
}

// For unit testing reset support
export function resetAudioState(): void {
  isInitialized = false;
  mutedState = false;
  _Audio = null;
  for (const key of Object.keys(soundObjects)) {
    delete soundObjects[key];
  }
}
