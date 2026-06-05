import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useGameState } from './src/hooks/useGameState';
import { useProfileState } from './src/hooks/useProfileState';
import { LEVELS, TOTAL_LEVELS } from './src/data/puzzles';
import { saveDailyChallenge } from './src/utils/profileStorage';
import { getTodayDateString } from './src/services/profileManager';
import { evaluateAchievements } from './src/services/achievementEvaluator';

import WelcomeScreen from './src/components/WelcomeScreen';
import PuzzleScreen from './src/components/PuzzleScreen';
import CongratulatoryPopup from './src/components/CongratulatoryPopup';
import LevelCompletionScreen from './src/components/LevelCompletionScreen';
import GameCompletionScreen from './src/components/GameCompletionScreen';
import ProfileHeader from './src/components/ProfileHeader';
import AchievementToast from './src/components/AchievementToast';
import StatsDashboard from './src/components/StatsDashboard';
import DailyChallengeModal from './src/components/DailyChallengeModal';

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
    handleRevealAnswer,
    handleAdvancePuzzle,
    handleAdvanceLevel,
    handleStartNewGame,
  } = useGameState(VIRTUAL_LEVELS);

  const {
    profile,
    stats,
    isProfileLoading,
    pendingAchievements,
    recordPuzzleOutcome,
    recordLevelCompletion,
    recordDailyChallenge,
    dismissAchievement,
    unlockAchievement,
  } = useProfileState();

  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);

  // Tracks puzzle outcomes during a level for the level completion screen
  const [currentLevelResults, setCurrentLevelResults] = useState<LevelResult[]>([]);
  // Track hints used in the current level for Pure Genius achievement
  const [levelHintsUsed, setLevelHintsUsed] = useState(0);
  // Track consecutive solves for Streak Master achievement
  const [consecutiveSolves, setConsecutiveSolves] = useState(0);

  // ──────────────────────────────────────────────────────────────────────
  // Navigation handlers
  // ──────────────────────────────────────────────────────────────────────

  const handleStartGame = useCallback(() => {
    setCurrentLevelResults([]);
    setLevelHintsUsed(0);
    setScreen('puzzle');
  }, []);

  const handleNewGame = useCallback(async () => {
    await handleStartNewGame();
    setCurrentLevelResults([]);
    setLevelHintsUsed(0);
    setConsecutiveSolves(0);
    setScreen('puzzle');
  }, [handleStartNewGame]);

  // Called from PuzzleScreen when user submits a guess and transitions to 'solved'
  const onPuzzleSolved = useCallback(() => {
    const newConsecutive = consecutiveSolves + 1;
    setConsecutiveSolves(newConsecutive);

    // Record outcome in profile (XP, score, stats)
    recordPuzzleOutcome({
      score: gameState.puzzleScore,
      hintsUsed: gameState.revealedHintIndices.length,
      solved: true,
      guessesSubmitted: 5 - gameState.remainingGuesses + 1,
    });

    // Track hints used in this level
    setLevelHintsUsed((prev) => prev + gameState.revealedHintIndices.length);

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
  }, [gameState.puzzleScore, gameState.revealedHintIndices.length, consecutiveSolves, recordPuzzleOutcome]);

  // Called when puzzle is revealed (Reveal Answer used)
  const onPuzzleRevealed = useCallback(() => {
    setConsecutiveSolves(0); // Break streak on reveal

    recordPuzzleOutcome({
      score: 0,
      hintsUsed: gameState.revealedHintIndices.length,
      solved: false,
      revealed: true,
    });

    setLevelHintsUsed((prev) => prev + gameState.revealedHintIndices.length);
    setCurrentLevelResults((prev) => [
      ...prev,
      { solved: false, score: 0, hintsUsed: gameState.revealedHintIndices.length },
    ]);
    advanceOrFinishLevel();
  }, [gameState.revealedHintIndices.length, recordPuzzleOutcome]);

  // Called from PuzzleScreen when puzzle failed (guesses exhausted) and user presses Proceed
  const onPuzzleFailed = useCallback(() => {
    setConsecutiveSolves(0); // Break streak on failure

    recordPuzzleOutcome({
      score: 0,
      hintsUsed: gameState.revealedHintIndices.length,
      solved: false,
      guessesSubmitted: 5,
    });

    setLevelHintsUsed((prev) => prev + gameState.revealedHintIndices.length);
    setCurrentLevelResults((prev) => [
      ...prev,
      {
        solved: false,
        score: 0,
        hintsUsed: gameState.revealedHintIndices.length,
      },
    ]);
    advanceOrFinishLevel();
  }, [gameState.revealedHintIndices.length, recordPuzzleOutcome]);

  const advanceOrFinishLevel = useCallback(() => {
    if (gameState.currentPuzzleIndex >= 2) {
      // Last puzzle in level — record level completion
      const levelScore = gameState.cumulativeScore;
      recordLevelCompletion({ levelScore });

      // Check Pure Genius and High Scorer achievements
      const pureGenius = levelHintsUsed === 0;
      const highScorer = levelScore >= 300;
      if (pureGenius) unlockAchievement('pure-genius');
      if (highScorer) unlockAchievement('high-scorer');

      setLevelResults(currentLevelResults);
      setLevelHintsUsed(0); // Reset for next level

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
    gameState.cumulativeScore,
    currentLevelResults,
    levelHintsUsed,
    handleAdvancePuzzle,
    handleAdvanceLevel,
    recordLevelCompletion,
    unlockAchievement,
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
    if (gameState.status === 'revealed') {
      onPuzzleRevealed();
    }
  }, [gameState.status, onPuzzleFailed, onPuzzleRevealed]);

  // Effect: show congrats popup when puzzle is solved
  React.useEffect(() => {
    if (gameState.status === 'solved' && screen === 'puzzle') {
      onPuzzleSolved();
    }
  }, [gameState.status]);

  const handleNextLevel = useCallback(() => {
    handleAdvanceLevel();
    setCurrentLevelResults([]);
    setLevelHintsUsed(0);
    setScreen('puzzle');
  }, [handleAdvanceLevel]);

  const handleRestart = useCallback(async () => {
    await handleStartNewGame();
    setCurrentLevelResults([]);
    setLevelResults([]);
    setLevelHintsUsed(0);
    setConsecutiveSolves(0);
    setScreen('welcome');
  }, [handleStartNewGame]);

  // ── Daily Challenge Completion ──────────────────────────────────────────────
  const handleDailyChallengeComplete = useCallback(async (score: number) => {
    setShowDailyChallenge(false);
    // Record double XP
    const result = await recordDailyChallenge(score);
    if (!result.alreadyCompleted) {
      // Save daily state
      await saveDailyChallenge({
        dateString: getTodayDateString(),
        completed: true,
        puzzleId: 'daily-' + getTodayDateString(),
      });
    }
  }, [recordDailyChallenge]);

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────

  if (isLoading || isProfileLoading) {
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

      {/* Global Achievement Toast Overlay (FR-005) */}
      <AchievementToast
        achievement={pendingAchievements[0] ?? null}
        onDismiss={dismissAchievement}
      />

      {screen === 'welcome' && (
        <WelcomeScreen
          hasSavedProgress={hasSavedProgress}
          onStartGame={handleStartGame}
          onNewGame={handleNewGame}
          onShowStats={() => setShowStats(true)}
          onShowDailyChallenge={() => setShowDailyChallenge(true)}
          streakCount={profile.streakCount}
        />
      )}

      {screen === 'puzzle' && currentPuzzle && (
        <>
          {/* Profile Header above puzzle HUD (T011) */}
          <ProfileHeader xp={profile.xp} level={profile.level} rank={profile.rank} />
          <PuzzleScreen
            gameState={gameState}
            currentPuzzle={currentPuzzle}
            onSubmitGuess={handleSubmitGuess}
            onRevealHint={handleRevealHint}
            onRevealAnswer={handleRevealAnswer}
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

      {/* Statistics Dashboard Modal (FR-006, T024) */}
      <StatsDashboard
        visible={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />

      {/* Daily Challenge Modal (FR-008, T029) */}
      <DailyChallengeModal
        visible={showDailyChallenge}
        onClose={() => setShowDailyChallenge(false)}
        onComplete={handleDailyChallengeComplete}
        streakCount={profile.streakCount}
      />
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
