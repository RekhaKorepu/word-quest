/**
 * Achievement Evaluator Service (FR-004, FR-005)
 *
 * Defines all achievement rules and evaluates which achievements are
 * newly unlocked given the current PlayerProfile state.
 *
 * Achievements:
 *  - first-steps:      Solved 1st puzzle
 *  - pure-genius:      Completed a level with 0 hints used (must be triggered by caller at level end)
 *  - high-scorer:      Reached 300 points in a single level (caller must provide levelScore)
 *  - streak-master:    Solved 5 puzzles in a row without failing (tracked via consecutiveSolved)
 *  - dedicated-solver: Solved 30 total puzzles
 */

import { PlayerProfile } from '../utils/profileStorage';

// ─── Achievement Definitions ──────────────────────────────────────────────────

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Solved your very first puzzle!',
    icon: '🐣',
  },
  {
    id: 'pure-genius',
    name: 'Pure Genius',
    description: 'Completed a level without using any hints!',
    icon: '🧠',
  },
  {
    id: 'high-scorer',
    name: 'High Scorer',
    description: 'Earned 300+ points in a single level!',
    icon: '🏆',
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Solved 5 puzzles in a row without failing!',
    icon: '🔥',
  },
  {
    id: 'dedicated-solver',
    name: 'Dedicated Solver',
    description: 'Solved 30 total puzzles!',
    icon: '🎯',
  },
];

// ─── Evaluation ───────────────────────────────────────────────────────────────

export interface AchievementContext {
  /** Current count of consecutive puzzles solved without failing */
  consecutiveSolved?: number;
  /** Score earned in the just-completed level (for high-scorer check) */
  levelScore?: number;
  /** True if this level was completed with 0 hints */
  levelCompletedWithNoHints?: boolean;
}

/**
 * Returns a list of AchievementDefinitions that are newly unlocked.
 * Already-unlocked achievements (by ID) are excluded.
 */
export function evaluateAchievements(
  profile: PlayerProfile,
  consecutiveSolved: number = 0,
  context: AchievementContext = {}
): AchievementDefinition[] {
  const alreadyUnlocked = new Set(profile.unlockedAchievementIds);
  const newlyUnlocked: AchievementDefinition[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !alreadyUnlocked.has(id)) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) newlyUnlocked.push(def);
    }
  };

  // First Steps: puzzlesSolved transitions from 0 → 1
  check('first-steps', profile.puzzlesSolved >= 1);

  // Dedicated Solver: 30+ puzzles solved
  check('dedicated-solver', profile.puzzlesSolved >= 30);

  // Streak Master: 5+ consecutive solves
  check('streak-master', consecutiveSolved >= 5);

  // Pure Genius: level completed with no hints (caller must provide context)
  if (context.levelCompletedWithNoHints === true) {
    check('pure-genius', true);
  }

  // High Scorer: 300+ points in a single level (caller must provide context)
  if (context.levelScore !== undefined) {
    check('high-scorer', context.levelScore >= 300);
  }

  return newlyUnlocked;
}
