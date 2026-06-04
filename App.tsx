import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useGameState } from './src/hooks/useGameState';
import { LEVELS, TOTAL_LEVELS } from './src/data/puzzles';

import WelcomeScreen from './src/components/WelcomeScreen';
import PuzzleScreen from './src/components/PuzzleScreen';
import CongratulatoryPopup from './src/components/CongratulatoryPopup';
import LevelCompletionScreen from './src/components/LevelCompletionScreen';
import GameCompletionScreen from './src/components/GameCompletionScreen';

type AppScreen = 'welcome' | 'puzzle' | 'levelComplete' | 'gameComplete';

interface LevelResult {
  solved: boolean;
  score: number;
  hintsUsed: number;
}

// Define VIRTUAL_LEVELS to allow infinite level scaling beyond static levels
const VIRTUAL_LEVELS = [
  ...LEVELS,
  ...Array.from({ length: 9999 }, (_, i) => ({
    levelNumber: i + LEVELS.length + 1,
    puzzles: [] as any,
  })),
];
const MAX_ENDLESS_LEVELS = 9999;

export default function App() {
  const {
    gameState,
    hasSavedProgress,
    isLoading,
    currentPuzzle,
    handleSubmitGuess,
    handleRevealHint,
    handleAdvancePuzzle,
    handleAdvanceLevel,
    handleStartNewGame,
  } = useGameState(VIRTUAL_LEVELS);

  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);

  // Tracks puzzle outcomes during a level for the level completion screen
  const [currentLevelResults, setCurrentLevelResults] = useState<LevelResult[]>([]);

  // ──────────────────────────────────────────────────────────────────────
  // Navigation handlers
  // ──────────────────────────────────────────────────────────────────────

  const handleStartGame = useCallback(() => {
    setCurrentLevelResults([]);
    setScreen('puzzle');
  }, []);

  const handleNewGame = useCallback(async () => {
    await handleStartNewGame();
    setCurrentLevelResults([]);
    setScreen('puzzle');
  }, [handleStartNewGame]);

  // Called from PuzzleScreen when user submits a guess and transitions to 'solved'
  const onPuzzleSolved = useCallback(() => {
    // Show congratulatory popup
    setShowCongratsPopup(true);
    // Record result
    setCurrentLevelResults((prev) => [
      ...prev,
      {
        solved: true,
        score: gameState.puzzleScore,
        hintsUsed: gameState.revealedHintIndices.length,
      },
    ]);
  }, [gameState.puzzleScore, gameState.revealedHintIndices.length]);

  // Called from PuzzleScreen when puzzle failed (guesses exhausted) and user presses Proceed
  const onPuzzleFailed = useCallback(() => {
    setCurrentLevelResults((prev) => [
      ...prev,
      {
        solved: false,
        score: 0,
        hintsUsed: gameState.revealedHintIndices.length,
      },
    ]);
    advanceOrFinishLevel();
  }, [gameState.revealedHintIndices.length]);

  const advanceOrFinishLevel = useCallback(() => {
    if (gameState.currentPuzzleIndex >= 2) {
      // Last puzzle in level
      setLevelResults(currentLevelResults);
      if (gameState.currentLevelNumber >= MAX_ENDLESS_LEVELS) {
        handleAdvanceLevel();
        setScreen('gameComplete');
      } else {
        setScreen('levelComplete');
      }
    } else {
      handleAdvancePuzzle();
    }
  }, [
    gameState.currentPuzzleIndex,
    gameState.currentLevelNumber,
    currentLevelResults,
    handleAdvancePuzzle,
    handleAdvanceLevel,
  ]);

  // Called from CongratulatoryPopup when user presses Next Puzzle
  const onCongratsProceeed = useCallback(() => {
    setShowCongratsPopup(false);
    advanceOrFinishLevel();
  }, [advanceOrFinishLevel]);

  // PuzzleScreen calls this when user taps Proceed (works for both solved and failed)
  const handlePuzzleAdvance = useCallback(() => {
    if (gameState.status === 'solved') {
      // Handled by popup
      return;
    }
    if (gameState.status === 'failed') {
      onPuzzleFailed();
    }
  }, [gameState.status, onPuzzleFailed]);

  // Effect: show congrats popup when puzzle is solved
  React.useEffect(() => {
    if (gameState.status === 'solved' && screen === 'puzzle') {
      onPuzzleSolved();
    }
  }, [gameState.status]);

  const handleNextLevel = useCallback(() => {
    handleAdvanceLevel();
    setCurrentLevelResults([]);
    setScreen('puzzle');
  }, [handleAdvanceLevel]);

  const handleRestart = useCallback(async () => {
    await handleStartNewGame();
    setCurrentLevelResults([]);
    setLevelResults([]);
    setScreen('welcome');
  }, [handleStartNewGame]);

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />

      {screen === 'welcome' && (
        <WelcomeScreen
          hasSavedProgress={hasSavedProgress}
          onStartGame={handleStartGame}
          onNewGame={handleNewGame}
        />
      )}

      {screen === 'puzzle' && currentPuzzle && (
        <>
          <PuzzleScreen
            gameState={gameState}
            currentPuzzle={currentPuzzle}
            onSubmitGuess={handleSubmitGuess}
            onRevealHint={handleRevealHint}
            onAdvancePuzzle={handlePuzzleAdvance}
          />
          <CongratulatoryPopup
            visible={showCongratsPopup}
            puzzleScore={gameState.puzzleScore}
            hintsUsed={gameState.revealedHintIndices.length}
            onProceed={onCongratsProceeed}
          />
        </>
      )}

      {screen === 'levelComplete' && (
        <LevelCompletionScreen
          levelNumber={gameState.currentLevelNumber}
          totalScore={gameState.cumulativeScore}
          puzzleResults={levelResults.length ? levelResults : currentLevelResults}
          onNextLevel={handleNextLevel}
        />
      )}

      {screen === 'gameComplete' && (
        <GameCompletionScreen
          finalScore={gameState.cumulativeScore}
          totalLevels={gameState.currentLevelNumber}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
