/**
 * Profile Storage Module
 *
 * Provides typed AsyncStorage read/write helpers for the PlayerProfile,
 * DailyChallengeState, and Achievement data models defined in Phase 3.
 *
 * Storage keys:
 *   - @wordquest_player_profile  → PlayerProfile
 *   - @wordquest_daily_challenge → DailyChallengeState
 */

import { Storage } from './storage';
import { GeneratedPuzzle } from '../data/fallbackPuzzles';

// ─── Data Model Types ─────────────────────────────────────────────────────────

export interface PlayerProfile {
  totalScore: number;
  xp: number;
  level: number;
  rank: string;
  levelsCompleted: number;
  puzzlesSolved: number;
  guessesSubmitted: number;
  hintsUsed: number;
  streakCount: number;
  lastActiveDate: string | null;
  unlockedAchievementIds: string[];
  // GameStats (embedded for simplicity)
  puzzlesAttempted: number;
  bestLevelScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number; // epoch ms
}

export interface DailyChallengeState {
  dateString: string;   // YYYY-MM-DD
  completed: boolean;
  puzzleId: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const PROFILE_KEY = '@wordquest_player_profile';
const DAILY_KEY = '@wordquest_daily_challenge';
const AUDIO_MUTED_KEY = '@wordquest_audio_settings';
const OFFLINE_CACHE_KEY = '@wordquest_offline_cache';

// ─── Default Values ───────────────────────────────────────────────────────────

export function createDefaultProfile(): PlayerProfile {
  return {
    totalScore: 0,
    xp: 0,
    level: 1,
    rank: 'Novice',
    levelsCompleted: 0,
    puzzlesSolved: 0,
    guessesSubmitted: 0,
    hintsUsed: 0,
    streakCount: 0,
    lastActiveDate: null,
    unlockedAchievementIds: [],
    puzzlesAttempted: 0,
    bestLevelScore: 0,
  };
}

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<PlayerProfile> {
  try {
    const raw = await Storage.getItem(PROFILE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    // Merge with defaults to handle missing fields from older saves
    return { ...createDefaultProfile(), ...parsed };
  } catch {
    return createDefaultProfile();
  }
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  try {
    await Storage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[WordQuest] Failed to save profile:', e);
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await Storage.removeItem(PROFILE_KEY);
  } catch (e) {
    console.warn('[WordQuest] Failed to clear profile:', e);
  }
}

// ─── Daily Challenge CRUD ─────────────────────────────────────────────────────

export async function loadDailyChallenge(): Promise<DailyChallengeState | null> {
  try {
    const raw = await Storage.getItem(DAILY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyChallengeState;
  } catch {
    return null;
  }
}

export async function saveDailyChallenge(state: DailyChallengeState): Promise<void> {
  try {
    await Storage.setItem(DAILY_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[WordQuest] Failed to save daily challenge:', e);
  }
}

// ─── Audio Settings CRUD ──────────────────────────────────────────────────────

export async function loadAudioMuted(): Promise<boolean> {
  try {
    const raw = await Storage.getItem(AUDIO_MUTED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function saveAudioMuted(isMuted: boolean): Promise<void> {
  try {
    await Storage.setItem(AUDIO_MUTED_KEY, isMuted ? 'true' : 'false');
  } catch (e) {
    console.warn('[WordQuest] Failed to save audio settings:', e);
  }
}

// ─── Offline Puzzle Cache CRUD ────────────────────────────────────────────────

export async function loadOfflinePuzzleCache(): Promise<GeneratedPuzzle[]> {
  try {
    const raw = await Storage.getItem(OFFLINE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as GeneratedPuzzle[];
    return [];
  } catch {
    return [];
  }
}

export async function saveOfflinePuzzleCache(puzzles: GeneratedPuzzle[]): Promise<void> {
  try {
    // Keep a maximum of 5 puzzles to prevent excessive local storage consumption
    const capped = puzzles.slice(0, 5);
    await Storage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(capped));
  } catch (e) {
    console.warn('[WordQuest] Failed to save offline cache:', e);
  }
}
