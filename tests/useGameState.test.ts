import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialPlayerState,
  submitGuess,
  revealHint,
  advancePuzzle,
  advanceLevel,
  resetGame,
  GameState,
  PlayerState,
} from '../src/hooks/useGameState';
import { LEVELS } from '../src/data/puzzles';

// Helper to create a fresh game state
function freshState(): GameState {
  return createInitialPlayerState(LEVELS);
}

// ─── PHASE 4 TESTS (US2): Core Puzzle Solving & Validation ──────────────────

describe('createInitialPlayerState', () => {
  it('starts at level 1, puzzle 0, score 0, with 5 guesses remaining', () => {
    const state = freshState();
    expect(state.currentLevelNumber).toBe(1);
    expect(state.currentPuzzleIndex).toBe(0);
    expect(state.cumulativeScore).toBe(0);
    expect(state.remainingGuesses).toBe(5);
    expect(state.revealedHintIndices).toEqual([]);
    expect(state.status).toBe('playing');
  });
});

describe('submitGuess — correct answer', () => {
  it('marks status as solved and awards 100 points when no hints were used', () => {
    const state = freshState();
    const puzzle = LEVELS[0].puzzles[0]; // answer: 'clock'
    const next = submitGuess(state, 'clock', puzzle.answer);
    expect(next.status).toBe('solved');
    expect(next.puzzleScore).toBe(100);
  });

  it('is case-insensitive', () => {
    const state = freshState();
    const puzzle = LEVELS[0].puzzles[0];
    const next = submitGuess(state, 'CLOCK', puzzle.answer);
    expect(next.status).toBe('solved');
  });

  it('trims whitespace around the guess', () => {
    const state = freshState();
    const puzzle = LEVELS[0].puzzles[0];
    const next = submitGuess(state, '  clock  ', puzzle.answer);
    expect(next.status).toBe('solved');
  });
});

describe('submitGuess — incorrect answer', () => {
  it('decrements remaining guesses on an incorrect guess', () => {
    const state = freshState();
    const puzzle = LEVELS[0].puzzles[0];
    const next = submitGuess(state, 'wrong', puzzle.answer);
    expect(next.remainingGuesses).toBe(4);
    expect(next.status).toBe('playing');
  });

  it('transitions to failed after 5 consecutive wrong guesses', () => {
    let state = freshState();
    const answer = LEVELS[0].puzzles[0].answer;
    for (let i = 0; i < 5; i++) {
      state = submitGuess(state, 'wrong', answer);
    }
    expect(state.remainingGuesses).toBe(0);
    expect(state.status).toBe('failed');
  });

  it('does not decrement guesses below 0', () => {
    let state = freshState();
    const answer = LEVELS[0].puzzles[0].answer;
    for (let i = 0; i < 6; i++) {
      state = submitGuess(state, 'wrong', answer);
    }
    expect(state.remainingGuesses).toBe(0);
  });
});

describe('submitGuess — empty or whitespace-only', () => {
  it('ignores empty submissions without reducing guess count', () => {
    const state = freshState();
    const next = submitGuess(state, '', LEVELS[0].puzzles[0].answer);
    expect(next.remainingGuesses).toBe(5); // unchanged
    expect(next.status).toBe('playing');
  });

  it('ignores whitespace-only submissions without reducing guess count', () => {
    const state = freshState();
    const next = submitGuess(state, '   ', LEVELS[0].puzzles[0].answer);
    expect(next.remainingGuesses).toBe(5);
  });
});

// ─── PHASE 5 TESTS (US3): Hints & Scoring ───────────────────────────────────

describe('revealHint', () => {
  it('reveals hints sequentially by index', () => {
    let state = freshState();
    state = revealHint(state);
    expect(state.revealedHintIndices).toEqual([0]);
    state = revealHint(state);
    expect(state.revealedHintIndices).toEqual([0, 1]);
    state = revealHint(state);
    expect(state.revealedHintIndices).toEqual([0, 1, 2]);
  });

  it('does not reveal more than 3 hints', () => {
    let state = freshState();
    for (let i = 0; i < 5; i++) state = revealHint(state);
    expect(state.revealedHintIndices.length).toBe(3);
  });
});

describe('scoring with hints', () => {
  it('awards 100 points with no hints used', () => {
    const state = freshState();
    const next = submitGuess(state, 'clock', LEVELS[0].puzzles[0].answer);
    expect(next.puzzleScore).toBe(100);
  });

  it('deducts 15 points per hint used — 1 hint → 85 points', () => {
    let state = freshState();
    state = revealHint(state);
    const next = submitGuess(state, 'clock', LEVELS[0].puzzles[0].answer);
    expect(next.puzzleScore).toBe(85);
  });

  it('deducts 15 points per hint used — 2 hints → 70 points', () => {
    let state = freshState();
    state = revealHint(state);
    state = revealHint(state);
    const next = submitGuess(state, 'clock', LEVELS[0].puzzles[0].answer);
    expect(next.puzzleScore).toBe(70);
  });

  it('deducts 15 points per hint used — 3 hints → 55 points', () => {
    let state = freshState();
    state = revealHint(state);
    state = revealHint(state);
    state = revealHint(state);
    const next = submitGuess(state, 'clock', LEVELS[0].puzzles[0].answer);
    expect(next.puzzleScore).toBe(55);
  });

  it('awards 0 points for a failed puzzle regardless of hints', () => {
    let state = freshState();
    state = revealHint(state);
    const answer = LEVELS[0].puzzles[0].answer;
    for (let i = 0; i < 5; i++) {
      state = submitGuess(state, 'wrong', answer);
    }
    expect(state.status).toBe('failed');
    expect(state.puzzleScore).toBe(0);
  });
});

// ─── PHASE 6 TESTS (US4): Puzzle & Level Progression ────────────────────────

describe('advancePuzzle', () => {
  it('advances to next puzzle index within a level', () => {
    // advancePuzzle requires a terminal status (solved/failed/revealed) to proceed
    const state = { ...freshState(), status: 'solved' as const };
    const next = advancePuzzle(state);
    expect(next.currentPuzzleIndex).toBe(1);
    expect(next.remainingGuesses).toBe(5);
    expect(next.revealedHintIndices).toEqual([]);
    expect(next.status).toBe('playing');
  });

  it('transitions to levelComplete when advancing past the last puzzle', () => {
    let state = { ...freshState(), status: 'solved' as const };
    state = { ...state, currentPuzzleIndex: 2 };
    const next = advancePuzzle(state);
    expect(next.status).toBe('levelComplete');
  });
});

describe('advanceLevel', () => {
  it('increments level and resets puzzle state', () => {
    const state = freshState();
    const next = advanceLevel(state, LEVELS);
    expect(next.currentLevelNumber).toBe(2);
    expect(next.currentPuzzleIndex).toBe(0);
    expect(next.remainingGuesses).toBe(5);
    expect(next.revealedHintIndices).toEqual([]);
    expect(next.status).toBe('playing');
  });

  it('transitions to gameComplete when advancing past the final level', () => {
    let state = freshState();
    state = { ...state, currentLevelNumber: LEVELS.length };
    const next = advanceLevel(state, LEVELS);
    expect(next.status).toBe('gameComplete');
  });
});

describe('resetGame', () => {
  it('resets all state back to initial values', () => {
    let state = freshState();
    state = submitGuess(state, 'wrong', 'clock');
    state = revealHint(state);
    state = { ...state, cumulativeScore: 150 };
    const reset = resetGame(LEVELS);
    expect(reset.currentLevelNumber).toBe(1);
    expect(reset.currentPuzzleIndex).toBe(0);
    expect(reset.cumulativeScore).toBe(0);
    expect(reset.remainingGuesses).toBe(5);
    expect(reset.revealedHintIndices).toEqual([]);
    expect(reset.status).toBe('playing');
  });
});
