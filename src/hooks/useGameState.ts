import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';
import { Level } from '../data/puzzles';
import { isAnswerCorrect, isEmptyGuess } from '../utils/validation';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameStatus =
  | 'playing'
  | 'solved'
  | 'failed'
  | 'levelComplete'
  | 'gameComplete';

export interface PlayerState {
  currentLevelNumber: number;
  currentPuzzleIndex: number;
  cumulativeScore: number;
  remainingGuesses: number;
  revealedHintIndices: number[];
}

export interface GameState extends PlayerState {
  status: GameStatus;
  puzzleScore: number; // score earned for the current puzzle (0 if failed)
}

const STORAGE_KEY = '@wordquest_player_state';
const MAX_GUESSES = 5;
const MAX_SCORE = 100;
const HINT_PENALTY = 15;

// ─── Pure state functions (exported for unit testing) ─────────────────────────

export function createInitialPlayerState(levels: Level[]): GameState {
  return {
    currentLevelNumber: 1,
    currentPuzzleIndex: 0,
    cumulativeScore: 0,
    remainingGuesses: MAX_GUESSES,
    revealedHintIndices: [],
    status: 'playing',
    puzzleScore: 0,
  };
}

export function submitGuess(
  state: GameState,
  guess: string,
  correctAnswer: string
): GameState {
  // Ignore empty/whitespace-only submissions
  if (isEmptyGuess(guess)) return state;
  // Do nothing if not currently in playing state
  if (state.status !== 'playing') return state;

  if (isAnswerCorrect(guess, correctAnswer)) {
    const puzzleScore = MAX_SCORE - HINT_PENALTY * state.revealedHintIndices.length;
    return {
      ...state,
      status: 'solved',
      puzzleScore,
      cumulativeScore: state.cumulativeScore + puzzleScore,
    };
  }

  const newGuesses = Math.max(0, state.remainingGuesses - 1);
  if (newGuesses === 0) {
    return {
      ...state,
      remainingGuesses: 0,
      status: 'failed',
      puzzleScore: 0,
    };
  }

  return {
    ...state,
    remainingGuesses: newGuesses,
  };
}

export function revealHint(state: GameState): GameState {
  if (state.revealedHintIndices.length >= 3) return state;
  const nextIndex = state.revealedHintIndices.length;
  return {
    ...state,
    revealedHintIndices: [...state.revealedHintIndices, nextIndex],
  };
}

export function advancePuzzle(state: GameState): GameState {
  const isLastPuzzle = state.currentPuzzleIndex >= 2;
  if (isLastPuzzle) {
    return {
      ...state,
      status: 'levelComplete',
    };
  }
  return {
    ...state,
    currentPuzzleIndex: state.currentPuzzleIndex + 1,
    remainingGuesses: MAX_GUESSES,
    revealedHintIndices: [],
    puzzleScore: 0,
    status: 'playing',
  };
}

export function advanceLevel(state: GameState, levels: Level[]): GameState {
  const isLastLevel = state.currentLevelNumber >= levels.length;
  if (isLastLevel) {
    return {
      ...state,
      status: 'gameComplete',
    };
  }
  return {
    ...state,
    currentLevelNumber: state.currentLevelNumber + 1,
    currentPuzzleIndex: 0,
    remainingGuesses: MAX_GUESSES,
    revealedHintIndices: [],
    puzzleScore: 0,
    status: 'playing',
  };
}

export function resetGame(levels: Level[]): GameState {
  return createInitialPlayerState(levels);
}

// ─── Persistence helpers ─────────────────────────────────────────────────────

async function saveState(state: PlayerState): Promise<void> {
  try {
    const toSave: PlayerState = {
      currentLevelNumber: state.currentLevelNumber,
      currentPuzzleIndex: state.currentPuzzleIndex,
      cumulativeScore: state.cumulativeScore,
      remainingGuesses: state.remainingGuesses,
      revealedHintIndices: state.revealedHintIndices,
    };
    await Storage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[WordQuest] Failed to save state:', e);
  }
}

async function loadSavedState(): Promise<PlayerState | null> {
  try {
    const raw = await Storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerState;
  } catch (e) {
    console.warn('[WordQuest] Failed to load state:', e);
    return null;
  }
}

async function clearSavedState(): Promise<void> {
  try {
    await Storage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[WordQuest] Failed to clear state:', e);
  }
}

// ─── React Hook ───────────────────────────────────────────────────────────────

export interface UseGameStateReturn {
  gameState: GameState;
  hasSavedProgress: boolean;
  isLoading: boolean;
  currentPuzzle: Level['puzzles'][number] | null;
  handleSubmitGuess: (guess: string) => void;
  handleRevealHint: () => void;
  handleAdvancePuzzle: () => void;
  handleAdvanceLevel: () => void;
  handleStartNewGame: () => Promise<void>;
}

export function useGameState(levels: Level[]): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialPlayerState(levels));
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    (async () => {
      const saved = await loadSavedState();
      if (saved) {
        setHasSavedProgress(true);
        setGameState((prev) => ({
          ...prev,
          ...saved,
          status: 'playing',
          puzzleScore: 0,
        }));
      }
      setIsLoading(false);
    })();
  }, []);

  // Auto-save whenever playable state changes
  useEffect(() => {
    if (isLoading) return;
    saveState(gameState);
  }, [
    gameState.currentLevelNumber,
    gameState.currentPuzzleIndex,
    gameState.cumulativeScore,
    gameState.remainingGuesses,
    gameState.revealedHintIndices,
    isLoading,
  ]);

  const currentLevel = levels.find((l) => l.levelNumber === gameState.currentLevelNumber);
  const currentPuzzle = currentLevel?.puzzles[gameState.currentPuzzleIndex] ?? null;

  const handleSubmitGuess = useCallback(
    (guess: string) => {
      if (!currentPuzzle) return;
      setGameState((prev) => submitGuess(prev, guess, currentPuzzle.answer));
    },
    [currentPuzzle]
  );

  const handleRevealHint = useCallback(() => {
    setGameState((prev) => revealHint(prev));
  }, []);

  const handleAdvancePuzzle = useCallback(() => {
    setGameState((prev) => advancePuzzle(prev));
  }, []);

  const handleAdvanceLevel = useCallback(() => {
    setGameState((prev) => advanceLevel(prev, levels));
  }, [levels]);

  const handleStartNewGame = useCallback(async () => {
    await clearSavedState();
    setHasSavedProgress(false);
    setGameState(createInitialPlayerState(levels));
  }, [levels]);

  return {
    gameState,
    hasSavedProgress,
    isLoading,
    currentPuzzle,
    handleSubmitGuess,
    handleRevealHint,
    handleAdvancePuzzle,
    handleAdvanceLevel,
    handleStartNewGame,
  };
}
