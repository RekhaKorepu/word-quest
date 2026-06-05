/**
 * Tests: useProfileState hook — profile loading and stats tracking (US4)
 *
 * Since the hook uses React state, we test the underlying pure functions
 * that it delegates to. Hook-level interaction with AsyncStorage is covered
 * by the profileManager and profileStorage unit tests.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultProfile } from '../../src/utils/profileStorage';
import { computeStats, applyPuzzleOutcome, applyLevelCompletion } from '../../src/services/profileManager';

describe('useProfileState — underlying stats computation (FR-006)', () => {
  let profile = createDefaultProfile();

  beforeEach(() => {
    profile = createDefaultProfile();
  });

  it('starts with zeroed stats for a new profile', () => {
    const stats = computeStats(profile);
    expect(stats.puzzlesAttempted).toBe(0);
    expect(stats.puzzlesSolved).toBe(0);
    expect(stats.hintsUsed).toBe(0);
    expect(stats.bestLevelScore).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.successRate).toBe(0);
  });

  it('tracks cumulative solved puzzles correctly', () => {
    let p = profile;
    p = applyPuzzleOutcome(p, { score: 100, hintsUsed: 0, solved: true });
    p = applyPuzzleOutcome(p, { score: 85, hintsUsed: 1, solved: true });
    p = applyPuzzleOutcome(p, { score: 70, hintsUsed: 2, solved: true });
    const stats = computeStats(p);
    expect(stats.puzzlesSolved).toBe(3);
    expect(stats.puzzlesAttempted).toBe(3);
    expect(stats.hintsUsed).toBe(3);
    expect(stats.averageScore).toBeCloseTo(85);
    expect(stats.successRate).toBe(100);
  });

  it('computes partial success rate when some puzzles fail', () => {
    let p = profile;
    p = applyPuzzleOutcome(p, { score: 100, hintsUsed: 0, solved: true });
    p = applyPuzzleOutcome(p, { score: 0, hintsUsed: 0, solved: false });
    const stats = computeStats(p);
    expect(stats.puzzlesSolved).toBe(1);
    expect(stats.puzzlesAttempted).toBe(2);
    expect(stats.successRate).toBe(50);
  });

  it('tracks bestLevelScore correctly', () => {
    let p = profile;
    p = applyLevelCompletion(p, { levelScore: 150 });
    p = applyLevelCompletion(p, { levelScore: 300 });
    p = applyLevelCompletion(p, { levelScore: 200 });
    const stats = computeStats(p);
    expect(stats.bestLevelScore).toBe(300);
    expect(stats.puzzlesSolved).toBe(0); // levelCompletion doesn't increment this
  });

  it('matches the acceptance scenario from spec (FR-006)', () => {
    // Given: 5 puzzles solved, 3 hints used, total score = 425
    let p = profile;
    p = applyPuzzleOutcome(p, { score: 100, hintsUsed: 1, solved: true });
    p = applyPuzzleOutcome(p, { score: 85, hintsUsed: 0, solved: true });
    p = applyPuzzleOutcome(p, { score: 80, hintsUsed: 2, solved: true });
    p = applyPuzzleOutcome(p, { score: 90, hintsUsed: 0, solved: true });
    p = applyPuzzleOutcome(p, { score: 70, hintsUsed: 0, solved: true });
    const stats = computeStats(p);
    expect(stats.puzzlesSolved).toBe(5);
    expect(stats.hintsUsed).toBe(3);
    expect(stats.averageScore).toBe(85);
    expect(stats.successRate).toBe(100);
  });
});
