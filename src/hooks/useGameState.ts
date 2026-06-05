import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';
import { Level } from '../data/puzzles';
import { isAnswerCorrect, isEmptyGuess } from '../utils/validation';
import { GeneratedPuzzle } from '../data/fallbackPuzzles';
import { getNextPuzzle, prefetchPuzzles } from '../services/puzzleManager';

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

interface SavedState extends PlayerState {
  levelPuzzles?: GeneratedPuzzle[];
}

async function saveState(state: PlayerState, levelPuzzles: GeneratedPuzzle[]): Promise<void> {
  try {
    const toSave: SavedState = {
      currentLevelNumber: state.currentLevelNumber,
      currentPuzzleIndex: state.currentPuzzleIndex,
      cumulativeScore: state.cumulativeScore,
      remainingGuesses: state.remainingGuesses,
      revealedHintIndices: state.revealedHintIndices,
      levelPuzzles,
    };
    await Storage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[WordQuest] Failed to save state:', e);
  }
}

async function loadSavedState(): Promise<SavedState | null> {
  try {
    const raw = await Storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
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
  currentPuzzle: GeneratedPuzzle | null;
  handleSubmitGuess: (guess: string) => void;
  handleRevealHint: () => void;
  handleAdvancePuzzle: () => void;
  handleAdvanceLevel: () => void;
  handleStartNewGame: () => Promise<void>;
}

function getStaticLevel1Puzzles(levels: Level[]): GeneratedPuzzle[] {
  // Collect all static puzzles from predefined levels (first 5 levels of the array)
  const staticPuzzles = levels
    .slice(0, 5)
    .flatMap(level => level.puzzles || []);

  // Shuffle the static puzzles to ensure variety on Level 1
  const shuffled = [...staticPuzzles].sort(() => Math.random() - 0.5);

  // Serve the first 3 puzzles for Level 1
  return shuffled.slice(0, 3).map(p => ({
    id: p.id,
    question: `[Static] ${p.question}`,
    answer: p.answer,
    hints: p.hints,
    difficulty: 'easy',
  }));
}

export function useGameState(levels: Level[]): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialPlayerState(levels));
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [levelPuzzles, setLevelPuzzles] = useState<GeneratedPuzzle[]>(() => getStaticLevel1Puzzles(levels));

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
        if (saved.levelPuzzles && saved.levelPuzzles.length > 0) {
          setLevelPuzzles(saved.levelPuzzles);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  // Sync level puzzles whenever level changes
  useEffect(() => {
    if (isLoading) return;

    let active = true;
    const loadLevelPuzzles = async () => {
      const levelNum = gameState.currentLevelNumber;
      if (levelNum === 1) {
        // Level 1: use static default levels
        if (active) {
          setLevelPuzzles(getStaticLevel1Puzzles(levels));
        }
        // Prefetch level 2 in the background
        prefetchPuzzles(2).catch(console.error);
      } else {
        if (levelPuzzles.length === 0 || gameState.currentPuzzleIndex === 0) {
          const p1 = await getNextPuzzle(levelNum);
          const p2 = await getNextPuzzle(levelNum);
          const p3 = await getNextPuzzle(levelNum);
          if (active) {
            setLevelPuzzles([p1, p2, p3]);
          }
        }
        // Prefetch next level in background
        prefetchPuzzles(levelNum + 1).catch(console.error);
      }
    };

    loadLevelPuzzles();

    return () => {
      active = false;
    };
  }, [gameState.currentLevelNumber, isLoading]);

  // Auto-save whenever playable state or puzzles change
  useEffect(() => {
    if (isLoading) return;
    saveState(gameState, levelPuzzles);
  }, [
    gameState.currentLevelNumber,
    gameState.currentPuzzleIndex,
    gameState.cumulativeScore,
    gameState.remainingGuesses,
    gameState.revealedHintIndices,
    levelPuzzles,
    isLoading,
  ]);

  const currentPuzzle = levelPuzzles[gameState.currentPuzzleIndex] ?? null;

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
    setLevelPuzzles(getStaticLevel1Puzzles(levels));
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
