/**
 * Tests: Evolved endless mode difficulty scaling (FR-010)
 * Replaces and extends the original difficultyScaling.test.ts
 */
import { describe, it, expect } from 'vitest';
import { getDifficultyForLevel } from '../../src/services/puzzleManager';

const SAMPLE_SIZE = 2000;

describe('getDifficultyForLevel — evolved scaling (FR-010)', () => {
  it('returns "easy" 100% for levels 1–4', () => {
    for (let level = 1; level <= 4; level++) {
      for (let i = 0; i < 100; i++) {
        expect(getDifficultyForLevel(level)).toBe('easy');
      }
    }
  });

  it('returns ~20% medium at level 5', () => {
    const medium = Array.from({ length: SAMPLE_SIZE }, () =>
      getDifficultyForLevel(5)
    ).filter((d) => d === 'medium').length;
    const pct = medium / SAMPLE_SIZE;
    // Allow ±8% statistical variance
    expect(pct).toBeGreaterThan(0.12);
    expect(pct).toBeLessThan(0.28);
  });

  it('returns ~22% medium at level 6', () => {
    const medium = Array.from({ length: SAMPLE_SIZE }, () =>
      getDifficultyForLevel(6)
    ).filter((d) => d === 'medium').length;
    const pct = medium / SAMPLE_SIZE;
    expect(pct).toBeGreaterThan(0.14);
    expect(pct).toBeLessThan(0.30);
  });

  it('returns ~30% medium at level 10', () => {
    const medium = Array.from({ length: SAMPLE_SIZE }, () =>
      getDifficultyForLevel(10)
    ).filter((d) => d === 'medium').length;
    const pct = medium / SAMPLE_SIZE;
    expect(pct).toBeGreaterThan(0.22);
    expect(pct).toBeLessThan(0.38);
  });

  it('caps at 40% medium for level 15', () => {
    const medium = Array.from({ length: SAMPLE_SIZE }, () =>
      getDifficultyForLevel(15)
    ).filter((d) => d === 'medium').length;
    const pct = medium / SAMPLE_SIZE;
    expect(pct).toBeGreaterThan(0.32);
    expect(pct).toBeLessThan(0.48);
  });

  it('caps at 40% medium for level 20 (same as 15)', () => {
    const medium = Array.from({ length: SAMPLE_SIZE }, () =>
      getDifficultyForLevel(20)
    ).filter((d) => d === 'medium').length;
    const pct = medium / SAMPLE_SIZE;
    // Same cap as level 15: ~40%
    expect(pct).toBeGreaterThan(0.32);
    expect(pct).toBeLessThan(0.48);
  });

  it('never exceeds 40% medium at any level beyond 15', () => {
    for (const level of [16, 17, 18, 20, 50, 100]) {
      const medium = Array.from({ length: SAMPLE_SIZE }, () =>
        getDifficultyForLevel(level)
      ).filter((d) => d === 'medium').length;
      const pct = medium / SAMPLE_SIZE;
      // Hard cap: medium must not reliably exceed 48% (accounting for variance)
      expect(pct).toBeLessThan(0.48);
    }
  });

  it('always returns easy or medium (no other values)', () => {
    for (let level = 1; level <= 20; level++) {
      const result = getDifficultyForLevel(level);
      expect(['easy', 'medium']).toContain(result);
    }
  });
});
