/**
 * Integration Tests: Reveal Answer Flow (US2 — FR-007)
 *
 * Tests the pure state logic that handles the Reveal Answer action.
 * These tests verify: score → 0, status transition, and next-puzzle advance.
 */
import { describe, it, expect } from 'vitest';
import {
  createInitialPlayerState,
  revealAnswer,
  advancePuzzle,
  GameState,
} from '../../src/hooks/useGameState';

// We need a minimal Level for createInitialPlayerState
const MOCK_LEVELS = [{ levelNumber: 1, puzzles: [{}, {}, {}] }] as any;

describe('Reveal Answer — State Logic (FR-007)', () => {
  it('sets status to "revealed" and puzzleScore to 0', () => {
    const state: GameState = createInitialPlayerState(MOCK_LEVELS);
    const updated = revealAnswer(state);
    expect(updated.status).toBe('revealed');
    expect(updated.puzzleScore).toBe(0);
  });

  it('does not change cumulativeScore when answer is revealed', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      cumulativeScore: 150,
    };
    const updated = revealAnswer(state);
    expect(updated.cumulativeScore).toBe(150);
  });

  it('does not allow reveal when already finished', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      status: 'solved',
    };
    const updated = revealAnswer(state);
    // State should remain unchanged — already in terminal status
    expect(updated.status).toBe('solved');
  });

  it('does not allow reveal when already failed', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      status: 'failed',
    };
    const updated = revealAnswer(state);
    expect(updated.status).toBe('failed');
  });

  it('preserves remainingGuesses after reveal', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      remainingGuesses: 3,
    };
    const updated = revealAnswer(state);
    expect(updated.remainingGuesses).toBe(3);
  });

  it('allows advancing to next puzzle after reveal', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      status: 'revealed',
      currentPuzzleIndex: 0,
    };
    // advancePuzzle accepts 'revealed' state same as 'solved'/'failed'
    const advanced = advancePuzzle(state);
    expect(advanced.currentPuzzleIndex).toBe(1);
    expect(advanced.status).toBe('playing');
  });

  it('transitions to levelComplete when last puzzle is revealed', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      status: 'revealed',
      currentPuzzleIndex: 2,
    };
    const advanced = advancePuzzle(state);
    expect(advanced.status).toBe('levelComplete');
  });

  it('resets puzzleScore to 0 on advance after reveal', () => {
    const state: GameState = {
      ...createInitialPlayerState(MOCK_LEVELS),
      status: 'revealed',
      puzzleScore: 0,
      currentPuzzleIndex: 0,
    };
    const advanced = advancePuzzle(state);
    expect(advanced.puzzleScore).toBe(0);
  });
});
