import { describe, it, expect } from 'vitest';
import { getDifficultyForLevel } from '../src/services/puzzleManager';

describe('Difficulty Scaling Odds', () => {
  it('returns easy 100% of the time for Levels 1 and 2', () => {
    for (let i = 0; i < 100; i++) {
      expect(getDifficultyForLevel(1)).toBe('easy');
      expect(getDifficultyForLevel(2)).toBe('easy');
    }
  });

  it('introduces medium puzzles for Levels 3 and 4', () => {
    const results: Record<string, number> = { easy: 0, medium: 0 };
    for (let i = 0; i < 1000; i++) {
      const diff = getDifficultyForLevel(3);
      results[diff]++;
    }
    // Expected around 10% medium (100 out of 1000). Check boundaries (e.g. between 5% and 15%)
    const mediumPercentage = results.medium / 1000;
    expect(mediumPercentage).toBeGreaterThan(0.04);
    expect(mediumPercentage).toBeLessThan(0.16);
    expect(results.easy).toBeGreaterThan(0);
  });

  it('increases medium puzzles for Level 5+', () => {
    const results: Record<string, number> = { easy: 0, medium: 0 };
    for (let i = 0; i < 1000; i++) {
      const diff = getDifficultyForLevel(5);
      results[diff]++;
    }
    // Expected around 20% medium (200 out of 1000). Check boundaries (e.g. between 12% and 28%)
    const mediumPercentage = results.medium / 1000;
    expect(mediumPercentage).toBeGreaterThan(0.12);
    expect(mediumPercentage).toBeLessThan(0.28);
    expect(results.easy).toBeGreaterThan(0);
  });
});
