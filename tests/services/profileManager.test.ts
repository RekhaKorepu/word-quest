/**
 * Tests: Profile Manager Service (FR-001, FR-002, FR-003, FR-006, FR-009, FR-010)
 */
import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  getRankForLevel,
  applyPuzzleOutcome,
  applyLevelCompletion,
  applyDailyChallenge,
  evaluateStreak,
  computeStats,
  getMediumRatioForLevel,
  getTodayDateString,
  daysBetween,
} from '../../src/services/profileManager';
import { createDefaultProfile } from '../../src/utils/profileStorage';

// ─── XP & Level Tests ─────────────────────────────────────────────────────────

describe('calculateLevel (FR-002)', () => {
  it('starts at level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('stays at level 1 for XP < 500', () => {
    expect(calculateLevel(499)).toBe(1);
  });

  it('advances to level 2 at exactly 500 XP', () => {
    expect(calculateLevel(500)).toBe(2);
  });

  it('correctly computes level 3 at 1000 XP', () => {
    expect(calculateLevel(1000)).toBe(3);
  });

  it('handles non-boundary XP correctly', () => {
    expect(calculateLevel(750)).toBe(2);
    expect(calculateLevel(1499)).toBe(3);
    expect(calculateLevel(1500)).toBe(4);
  });

  it('computes high levels correctly', () => {
    expect(calculateLevel(9500)).toBe(20); // 9500/500 = 19, +1 = 20
    expect(calculateLevel(10000)).toBe(21);
  });
});

// ─── Rank Title Tests ─────────────────────────────────────────────────────────

describe('getRankForLevel (FR-003)', () => {
  it('returns Novice for levels 1–4', () => {
    for (let l = 1; l <= 4; l++) {
      expect(getRankForLevel(l)).toBe('Novice');
    }
  });

  it('returns Apprentice for levels 5–9', () => {
    for (let l = 5; l <= 9; l++) {
      expect(getRankForLevel(l)).toBe('Apprentice');
    }
  });

  it('returns Journeyman for levels 10–14', () => {
    for (let l = 10; l <= 14; l++) {
      expect(getRankForLevel(l)).toBe('Journeyman');
    }
  });

  it('returns Expert for levels 15–19', () => {
    for (let l = 15; l <= 19; l++) {
      expect(getRankForLevel(l)).toBe('Expert');
    }
  });

  it('returns Grandmaster for level 20+', () => {
    expect(getRankForLevel(20)).toBe('Grandmaster');
    expect(getRankForLevel(50)).toBe('Grandmaster');
  });
});

// ─── Puzzle Outcome Tests ─────────────────────────────────────────────────────

describe('applyPuzzleOutcome (FR-001, FR-002)', () => {
  it('increments XP and totalScore by the puzzle score', () => {
    const profile = createDefaultProfile();
    const updated = applyPuzzleOutcome(profile, { score: 100, hintsUsed: 0, solved: true });
    expect(updated.xp).toBe(100);
    expect(updated.totalScore).toBe(100);
  });

  it('does not increment puzzlesSolved on failure', () => {
    const profile = createDefaultProfile();
    const updated = applyPuzzleOutcome(profile, { score: 0, hintsUsed: 0, solved: false });
    expect(updated.puzzlesSolved).toBe(0);
    expect(updated.puzzlesAttempted).toBe(1);
  });

  it('increments puzzlesSolved only on success', () => {
    const profile = createDefaultProfile();
    const updated = applyPuzzleOutcome(profile, { score: 85, hintsUsed: 1, solved: true });
    expect(updated.puzzlesSolved).toBe(1);
  });

  it('increments hintsUsed correctly', () => {
    const profile = createDefaultProfile();
    const updated = applyPuzzleOutcome(profile, { score: 70, hintsUsed: 2, solved: true });
    expect(updated.hintsUsed).toBe(2);
  });

  it('triggers level up correctly when XP crosses 500', () => {
    const profile = { ...createDefaultProfile(), xp: 450 };
    const updated = applyPuzzleOutcome(profile, { score: 60, hintsUsed: 0, solved: true });
    expect(updated.xp).toBe(510);
    expect(updated.level).toBe(2);
    expect(updated.rank).toBe('Novice');
  });

  it('updates rank correctly when crossing level 5', () => {
    const profile = { ...createDefaultProfile(), xp: 2490, level: 5, rank: 'Apprentice' };
    // Score of 10 gives 2500 XP → level 6, still Apprentice
    const updated = applyPuzzleOutcome(profile, { score: 10, hintsUsed: 0, solved: true });
    expect(updated.level).toBe(6);
    expect(updated.rank).toBe('Apprentice');
  });
});

// ─── Level Completion Tests ───────────────────────────────────────────────────

describe('applyLevelCompletion', () => {
  it('increments levelsCompleted', () => {
    const profile = createDefaultProfile();
    const updated = applyLevelCompletion(profile, { levelScore: 250 });
    expect(updated.levelsCompleted).toBe(1);
  });

  it('updates bestLevelScore if higher', () => {
    const profile = { ...createDefaultProfile(), bestLevelScore: 200 };
    const updated = applyLevelCompletion(profile, { levelScore: 300 });
    expect(updated.bestLevelScore).toBe(300);
  });

  it('does not overwrite bestLevelScore if lower', () => {
    const profile = { ...createDefaultProfile(), bestLevelScore: 400 };
    const updated = applyLevelCompletion(profile, { levelScore: 200 });
    expect(updated.bestLevelScore).toBe(400);
  });
});

// ─── Daily Streak Tests ───────────────────────────────────────────────────────

describe('evaluateStreak (FR-009)', () => {
  it('returns streak 1 for first-time completion (null lastActiveDate)', () => {
    const result = evaluateStreak(null, '2026-01-10');
    expect(result.streakCount).toBe(1);
    expect(result.lastActiveDate).toBe('2026-01-10');
    expect(result.alreadyCompleted).toBe(false);
  });

  it('returns alreadyCompleted=true when date matches today', () => {
    const result = evaluateStreak('2026-01-10', '2026-01-10');
    expect(result.alreadyCompleted).toBe(true);
  });

  it('signals streak continuation when lastActive was yesterday', () => {
    const result = evaluateStreak('2026-01-09', '2026-01-10');
    expect(result.streakCount).toBe(-1); // -1 = "increment caller's existing streak"
    expect(result.alreadyCompleted).toBe(false);
  });

  it('resets streak when a day is missed', () => {
    const result = evaluateStreak('2026-01-07', '2026-01-10');
    expect(result.streakCount).toBe(1);
    expect(result.alreadyCompleted).toBe(false);
  });

  it('resets streak for future lastActiveDate (backwards clock)', () => {
    const result = evaluateStreak('2026-01-15', '2026-01-10');
    expect(result.streakCount).toBe(1);
    expect(result.alreadyCompleted).toBe(false);
  });
});

describe('daysBetween', () => {
  it('returns 1 for consecutive days', () => {
    expect(daysBetween('2026-01-10', '2026-01-09')).toBe(1);
  });

  it('returns 0 for same day', () => {
    expect(daysBetween('2026-01-10', '2026-01-10')).toBe(0);
  });

  it('returns negative for past date first arg', () => {
    expect(daysBetween('2026-01-09', '2026-01-10')).toBe(-1);
  });
});

describe('applyDailyChallenge', () => {
  it('awards the provided bonusXp and increments streak', () => {
    const profile = createDefaultProfile();
    const today = getTodayDateString();
    // bonusXp is passed in already doubled by the caller (score * 2)
    const { profile: updated, alreadyCompleted } = applyDailyChallenge(profile, 200);
    expect(alreadyCompleted).toBe(false);
    expect(updated.xp).toBe(200);
    expect(updated.streakCount).toBe(1);
    expect(updated.lastActiveDate).toBe(today);
  });

  it('returns alreadyCompleted=true if called twice on same day', () => {
    const profile = { ...createDefaultProfile(), lastActiveDate: getTodayDateString() };
    const { alreadyCompleted } = applyDailyChallenge(profile, 200);
    expect(alreadyCompleted).toBe(true);
  });
});

// ─── Stats Computation Tests ──────────────────────────────────────────────────

describe('computeStats (FR-006)', () => {
  it('returns zeros for default profile', () => {
    const stats = computeStats(createDefaultProfile());
    expect(stats.averageScore).toBe(0);
    expect(stats.successRate).toBe(0);
    expect(stats.puzzlesSolved).toBe(0);
  });

  it('computes correct average and success rate', () => {
    const profile = {
      ...createDefaultProfile(),
      totalScore: 425,
      puzzlesAttempted: 5,
      puzzlesSolved: 5,
      hintsUsed: 3,
      bestLevelScore: 150,
    };
    const stats = computeStats(profile);
    expect(stats.averageScore).toBe(85);
    expect(stats.successRate).toBe(100);
    expect(stats.hintsUsed).toBe(3);
  });

  it('handles partial success rate', () => {
    const profile = {
      ...createDefaultProfile(),
      totalScore: 200,
      puzzlesAttempted: 4,
      puzzlesSolved: 2,
    };
    const stats = computeStats(profile);
    expect(stats.successRate).toBe(50);
  });
});

// ─── Medium Ratio Tests ───────────────────────────────────────────────────────

describe('getMediumRatioForLevel (FR-010)', () => {
  it('returns 0 for levels 1–4', () => {
    for (let l = 1; l <= 4; l++) {
      expect(getMediumRatioForLevel(l)).toBe(0);
    }
  });

  it('returns 0.20 at level 5', () => {
    expect(getMediumRatioForLevel(5)).toBeCloseTo(0.20);
  });

  it('returns 0.22 at level 6', () => {
    expect(getMediumRatioForLevel(6)).toBeCloseTo(0.22);
  });

  it('returns 0.30 at level 10', () => {
    expect(getMediumRatioForLevel(10)).toBeCloseTo(0.30);
  });

  it('caps at 0.40 for level 15', () => {
    expect(getMediumRatioForLevel(15)).toBeCloseTo(0.40);
  });

  it('caps at 0.40 beyond level 15', () => {
    expect(getMediumRatioForLevel(20)).toBeCloseTo(0.40);
    expect(getMediumRatioForLevel(100)).toBeCloseTo(0.40);
  });
});
