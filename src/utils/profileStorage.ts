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
