/**
 * Profile Manager Service
 *
 * Pure business logic for:
 *  - XP → Level calculation (FR-002)
 *  - Rank titles from level (FR-003)
 *  - Profile update helpers (FR-001)
 *  - Daily streak logic (FR-009)
 *  - GameStats aggregation (FR-006)
 *  - Endless difficulty scaling (FR-010)
 */

import { PlayerProfile, createDefaultProfile } from '../utils/profileStorage';

// ─── XP & Level ───────────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 500;

/**
 * Computes the player level from total XP.
 * Level = Math.floor(xp / 500) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Returns the rank title string for a given level.
 *
 * Level 1-4:   "Novice"
 * Level 5-9:   "Apprentice"
 * Level 10-14: "Journeyman"
 * Level 15-19: "Expert"
 * Level 20+:   "Grandmaster"
 */
export function getRankForLevel(level: number): string {
  if (level >= 20) return 'Grandmaster';
  if (level >= 15) return 'Expert';
  if (level >= 10) return 'Journeyman';
  if (level >= 5) return 'Apprentice';
  return 'Novice';
}

// ─── Profile Update ───────────────────────────────────────────────────────────

export interface PuzzleOutcome {
  /** Points earned this puzzle (0 if failed or revealed) */
  score: number;
  /** Number of hints used for this puzzle */
  hintsUsed: number;
  /** Whether the puzzle was solved (not failed, not revealed) */
  solved: boolean;
  /** Whether the answer was revealed (skipped) */
  revealed?: boolean;
  /** Number of guesses submitted (including the final correct one) */
  guessesSubmitted?: number;
}

export interface LevelOutcome {
  levelScore: number;
}

/**
 * Returns an updated PlayerProfile after a puzzle completes.
 * XP = score (1:1 mapping per FR-002).
 */
export function applyPuzzleOutcome(
  profile: PlayerProfile,
  outcome: PuzzleOutcome
): PlayerProfile {
  const newXp = profile.xp + outcome.score;
  const newLevel = calculateLevel(newXp);
  const newRank = getRankForLevel(newLevel);

  return {
    ...profile,
    totalScore: profile.totalScore + outcome.score,
    xp: newXp,
    level: newLevel,
    rank: newRank,
    puzzlesSolved: outcome.solved ? profile.puzzlesSolved + 1 : profile.puzzlesSolved,
    puzzlesAttempted: profile.puzzlesAttempted + 1,
    hintsUsed: profile.hintsUsed + outcome.hintsUsed,
    guessesSubmitted: profile.guessesSubmitted + (outcome.guessesSubmitted ?? 0),
  };
}

/**
 * Records the completion of a level.
 * Updates levelsCompleted and bestLevelScore.
 */
export function applyLevelCompletion(
  profile: PlayerProfile,
  levelOutcome: LevelOutcome
): PlayerProfile {
  return {
    ...profile,
    levelsCompleted: profile.levelsCompleted + 1,
    bestLevelScore: Math.max(profile.bestLevelScore, levelOutcome.levelScore),
  };
}

// ─── Daily Streak ─────────────────────────────────────────────────────────────

/**
 * Returns the current date as a YYYY-MM-DD string (local device time).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Computes date diff in calendar days: dateA - dateB.
 * Returns a positive integer if dateA is after dateB.
 */
export function daysBetween(dateA: string, dateB: string): number {
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.round((msA - msB) / 86_400_000);
}

export interface StreakResult {
  /** Updated streak count */
  streakCount: number;
  /** New lastActiveDate */
  lastActiveDate: string;
}

/**
 * Evaluates daily streak update given the player's last active date.
 *
 * Rules (FR-009):
 *  - If lastActiveDate is null (first time), streak becomes 1.
 *  - If lastActiveDate === today: no-op (already completed today).
 *  - If lastActiveDate is yesterday (diff === 1): streak increments.
 *  - If lastActiveDate is in the future (diff < 0): treat as broken, reset to 1.
 *  - If lastActiveDate is older than yesterday (diff > 1): reset to 1.
 */
export function evaluateStreak(
  lastActiveDate: string | null,
  today: string = getTodayDateString()
): StreakResult & { alreadyCompleted: boolean } {
  if (!lastActiveDate) {
    return { streakCount: 1, lastActiveDate: today, alreadyCompleted: false };
  }

  const diff = daysBetween(today, lastActiveDate);

  if (diff === 0) {
    // Already completed today — no change
    return {
      streakCount: -1, // signal: unchanged (caller must use existing value)
      lastActiveDate: lastActiveDate,
      alreadyCompleted: true,
    };
  }

  if (diff === 1) {
    // Yesterday → streak continues (caller adds +1)
    return { streakCount: -1, lastActiveDate: today, alreadyCompleted: false };
  }

  // Missed day(s) or future date: reset
  return { streakCount: 1, lastActiveDate: today, alreadyCompleted: false };
}

/**
 * Applies a daily challenge completion to the profile.
 * Returns updated profile with streak and lastActiveDate set.
 */
export function applyDailyChallenge(
  profile: PlayerProfile,
  bonusXp: number
): { profile: PlayerProfile; alreadyCompleted: boolean } {
  const today = getTodayDateString();
  const result = evaluateStreak(profile.lastActiveDate, today);

  if (result.alreadyCompleted) {
    return { profile, alreadyCompleted: true };
  }

  let newStreak: number;
  if (result.streakCount === -1) {
    // Streak continues from yesterday
    newStreak = profile.streakCount + 1;
  } else {
    // Reset or first time
    newStreak = result.streakCount;
  }

  const newXp = profile.xp + bonusXp;
  const newLevel = calculateLevel(newXp);
  const newRank = getRankForLevel(newLevel);

  return {
    profile: {
      ...profile,
      xp: newXp,
      totalScore: profile.totalScore + bonusXp,
      level: newLevel,
      rank: newRank,
      streakCount: newStreak,
      lastActiveDate: result.lastActiveDate,
    },
    alreadyCompleted: false,
  };
}

// ─── GameStats Helpers ────────────────────────────────────────────────────────

export interface GameStatsSnapshot {
  puzzlesAttempted: number;
  puzzlesSolved: number;
  hintsUsed: number;
  bestLevelScore: number;
  /** Average score per puzzle attempted (rounded to 1 dp) */
  averageScore: number;
  /** Success rate: solved / attempted, as 0–100 percentage */
  successRate: number;
}

/**
 * Derives a displayable stats snapshot from the stored profile.
 */
export function computeStats(profile: PlayerProfile): GameStatsSnapshot {
  const attempted = profile.puzzlesAttempted;
  const averageScore =
    attempted > 0 ? Math.round((profile.totalScore / attempted) * 10) / 10 : 0;
  const successRate =
    attempted > 0
      ? Math.round((profile.puzzlesSolved / attempted) * 100)
      : 0;

  return {
    puzzlesAttempted: profile.puzzlesAttempted,
    puzzlesSolved: profile.puzzlesSolved,
    hintsUsed: profile.hintsUsed,
    bestLevelScore: profile.bestLevelScore,
    averageScore,
    successRate,
  };
}

// ─── Endless Difficulty Scaling ───────────────────────────────────────────────

/**
 * Returns the medium puzzle ratio for a given level (FR-010).
 *
 * Scaling curve (linear interpolation):
 *  - Levels 1–4:  0% medium
 *  - Level 5:    20% medium
 *  - Levels 6–14: linearly increases from 20% to ~40%
 *  - Level 15+:  40% medium (capped)
 *
 * Formula for level 5–14: mediumPct = 20 + 2 * (level - 5)
 */
export function getMediumRatioForLevel(level: number): number {
  if (level <= 4) return 0;
  if (level >= 15) return 0.4;
  return (20 + 2 * (level - 5)) / 100;
}
