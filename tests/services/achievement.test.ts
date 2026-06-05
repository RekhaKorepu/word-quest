/**
 * Tests: Achievement Evaluator Service (FR-004)
 */
import { describe, it, expect } from 'vitest';
import { evaluateAchievements, ACHIEVEMENTS } from '../../src/services/achievementEvaluator';
import { createDefaultProfile } from '../../src/utils/profileStorage';

describe('evaluateAchievements', () => {
  it('returns empty array when no achievements are unlocked', () => {
    const profile = createDefaultProfile();
    const result = evaluateAchievements(profile, 0);
    expect(result).toEqual([]);
  });

  describe('first-steps', () => {
    it('unlocks when puzzlesSolved becomes 1', () => {
      const profile = { ...createDefaultProfile(), puzzlesSolved: 1 };
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).toContain('first-steps');
    });

    it('does NOT re-unlock if already in unlockedAchievementIds', () => {
      const profile = {
        ...createDefaultProfile(),
        puzzlesSolved: 1,
        unlockedAchievementIds: ['first-steps'],
      };
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).not.toContain('first-steps');
    });

    it('does NOT unlock when puzzlesSolved is 0', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).not.toContain('first-steps');
    });
  });

  describe('dedicated-solver', () => {
    it('unlocks when puzzlesSolved reaches 30', () => {
      const profile = { ...createDefaultProfile(), puzzlesSolved: 30 };
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).toContain('dedicated-solver');
    });

    it('does NOT unlock when puzzlesSolved is 29', () => {
      const profile = { ...createDefaultProfile(), puzzlesSolved: 29 };
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).not.toContain('dedicated-solver');
    });
  });

  describe('streak-master', () => {
    it('unlocks when consecutiveSolved >= 5', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 5);
      expect(result.map((a) => a.id)).toContain('streak-master');
    });

    it('does NOT unlock when consecutiveSolved is 4', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 4);
      expect(result.map((a) => a.id)).not.toContain('streak-master');
    });
  });

  describe('pure-genius', () => {
    it('unlocks when context.levelCompletedWithNoHints is true', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0, { levelCompletedWithNoHints: true });
      expect(result.map((a) => a.id)).toContain('pure-genius');
    });

    it('does NOT unlock when context.levelCompletedWithNoHints is false', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0, { levelCompletedWithNoHints: false });
      expect(result.map((a) => a.id)).not.toContain('pure-genius');
    });

    it('does NOT unlock when context is not provided', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0);
      expect(result.map((a) => a.id)).not.toContain('pure-genius');
    });
  });

  describe('high-scorer', () => {
    it('unlocks when context.levelScore >= 300', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0, { levelScore: 300 });
      expect(result.map((a) => a.id)).toContain('high-scorer');
    });

    it('unlocks for score above 300', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0, { levelScore: 300 });
      expect(result.map((a) => a.id)).toContain('high-scorer');
    });

    it('does NOT unlock when context.levelScore is 299', () => {
      const profile = createDefaultProfile();
      const result = evaluateAchievements(profile, 0, { levelScore: 299 });
      expect(result.map((a) => a.id)).not.toContain('high-scorer');
    });
  });

  describe('multiple simultaneous unlocks', () => {
    it('can return multiple new achievements at once', () => {
      const profile = {
        ...createDefaultProfile(),
        puzzlesSolved: 30, // dedicated-solver + first-steps
      };
      const result = evaluateAchievements(profile, 5, {
        levelScore: 300,
        levelCompletedWithNoHints: true,
      });
      const ids = result.map((a) => a.id);
      expect(ids).toContain('first-steps');
      expect(ids).toContain('dedicated-solver');
      expect(ids).toContain('streak-master');
      expect(ids).toContain('high-scorer');
      expect(ids).toContain('pure-genius');
    });

    it('excludes already-unlocked achievements from result', () => {
      const profile = {
        ...createDefaultProfile(),
        puzzlesSolved: 30,
        unlockedAchievementIds: ['first-steps', 'dedicated-solver'],
      };
      const result = evaluateAchievements(profile, 0);
      const ids = result.map((a) => a.id);
      expect(ids).not.toContain('first-steps');
      expect(ids).not.toContain('dedicated-solver');
    });
  });

  describe('ACHIEVEMENTS list', () => {
    it('contains exactly 5 achievement definitions', () => {
      expect(ACHIEVEMENTS).toHaveLength(5);
    });

    it('all achievements have required fields', () => {
      for (const a of ACHIEVEMENTS) {
        expect(a.id).toBeTruthy();
        expect(a.name).toBeTruthy();
        expect(a.description).toBeTruthy();
        expect(a.icon).toBeTruthy();
      }
    });
  });
});
