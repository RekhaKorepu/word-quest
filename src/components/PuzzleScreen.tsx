import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GameState } from '../hooks/useGameState';
import { Puzzle } from '../data/puzzles';

interface PuzzleScreenProps {
  gameState: GameState;
  currentPuzzle: Puzzle;
  onSubmitGuess: (guess: string) => void;
  onRevealHint: () => void;
  onAdvancePuzzle: () => void; // called after solved or failed
}

export default function PuzzleScreen({
  gameState,
  currentPuzzle,
  onSubmitGuess,
  onRevealHint,
  onAdvancePuzzle,
}: PuzzleScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const hintSlide = useRef(new Animated.Value(0)).current;

  const isSolved = gameState.status === 'solved';
  const isFailed = gameState.status === 'failed';
  const isFinished = isSolved || isFailed;
  const hintsAvailable = 3 - gameState.revealedHintIndices.length;
  const potentialScore =
    100 - 15 * gameState.revealedHintIndices.length;

  // Shake animation on wrong guess
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Hint slide animation
  useEffect(() => {
    if (gameState.revealedHintIndices.length > 0) {
      hintSlide.setValue(20);
      Animated.spring(hintSlide, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [gameState.revealedHintIndices.length]);

  // Success glow animation
  useEffect(() => {
    if (isSolved) {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [isSolved]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isFinished) return;
    const prevGuesses = gameState.remainingGuesses;
    onSubmitGuess(inputValue);
    setInputValue('');
    // Trigger shake if guess will be wrong (optimistic UI — shake after state update)
    // We check state change via a small delay
    setTimeout(() => {
      if (!isSolved) triggerShake();
    }, 50);
  };

  const handleRevealHint = () => {
    if (gameState.revealedHintIndices.length >= 3 || isFinished) return;
    onRevealHint();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header HUD */}
          <View style={styles.hud}>
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Level</Text>
              <Text style={styles.hudValue}>{gameState.currentLevelNumber}</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Puzzle</Text>
              <Text style={styles.hudValue}>{gameState.currentPuzzleIndex + 1} / 3</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Score</Text>
              <Text style={[styles.hudValue, styles.scoreValue]}>
                {gameState.cumulativeScore}
              </Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Guesses</Text>
              <Text
                style={[
                  styles.hudValue,
                  gameState.remainingGuesses <= 2 ? styles.guessesLow : styles.guessesNormal,
                ]}
              >
                {gameState.remainingGuesses}
              </Text>
            </View>
          </View>

          {/* Puzzle card */}
          <Animated.View
            style={[
              styles.puzzleCard,
              isSolved && styles.puzzleCardSolved,
              isFailed && styles.puzzleCardFailed,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Text style={styles.puzzleLabel}>🔤 Puzzle</Text>
            <Text style={styles.puzzleQuestion}>{currentPuzzle.question}</Text>

            {/* Potential score badge */}
            {!isFinished && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>Worth {potentialScore} pts</Text>
              </View>
            )}

            {/* Result state */}
            {isSolved && (
              <Animated.View
                style={[styles.resultBanner, styles.solvedBanner, { transform: [{ scale: successAnim }] }]}
              >
                <Text style={styles.resultIcon}>✅</Text>
                <Text style={styles.resultText}>
                  +{gameState.puzzleScore} points earned!
                </Text>
              </Animated.View>
            )}
            {isFailed && (
              <View style={[styles.resultBanner, styles.failedBanner]}>
                <Text style={styles.resultIcon}>❌</Text>
                <Text style={styles.resultText}>
                  The answer was:{' '}
                  <Text style={styles.answerReveal}>{currentPuzzle.answer}</Text>
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Hints section */}
          <View style={styles.hintsSection}>
            <View style={styles.hintsSectionHeader}>
              <Text style={styles.hintsSectionTitle}>💡 Hints</Text>
              {!isFinished && (
                <TouchableOpacity
                  testID="reveal-hint-button"
                  style={[
                    styles.revealHintButton,
                    hintsAvailable === 0 && styles.revealHintButtonDisabled,
                  ]}
                  onPress={handleRevealHint}
                  disabled={hintsAvailable === 0 || isFinished}
                >
                  <Text style={styles.revealHintButtonText}>
                    {hintsAvailable > 0
                      ? `Reveal Hint (-15 pts) · ${hintsAvailable} left`
                      : 'No More Hints'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {gameState.revealedHintIndices.length === 0 && (
              <Text style={styles.noHintsText}>
                {isFinished ? 'No hints were used.' : 'No hints revealed yet.'}
              </Text>
            )}

            {gameState.revealedHintIndices.map((idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.hintCard,
                  { transform: [{ translateY: hintSlide }] },
                ]}
              >
                <Text style={styles.hintNumber}>Hint {idx + 1}</Text>
                <Text style={styles.hintText}>{currentPuzzle.hints[idx]}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Answer input area */}
          {!isFinished && (
            <View style={styles.inputSection}>
              <TextInput
                testID="answer-input"
                style={styles.textInput}
                placeholder="Type your answer..."
                placeholderTextColor="#6B7280"
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                testID="submit-button"
                style={[
                  styles.submitButton,
                  !inputValue.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!inputValue.trim()}
              >
                <Text style={styles.submitButtonText}>Submit ▶</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Proceed button after finished */}
          {isFinished && (
            <TouchableOpacity
              testID="proceed-button"
              style={styles.proceedButton}
              onPress={onAdvancePuzzle}
            >
              <Text style={styles.proceedButtonText}>
                {gameState.currentPuzzleIndex < 2
                  ? 'Next Puzzle →'
                  : 'See Level Results →'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0A1E' },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // HUD
  hud: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  hudItem: { flex: 1, alignItems: 'center' },
  hudDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  hudLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  hudValue: { color: '#F9FAFB', fontSize: 18, fontWeight: '800', marginTop: 2 },
  scoreValue: { color: '#FBBF24' },
  guessesNormal: { color: '#34D399' },
  guessesLow: { color: '#F87171' },

  // Puzzle card
  puzzleCard: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  puzzleCardSolved: {
    borderColor: 'rgba(52, 211, 153, 0.5)',
    backgroundColor: 'rgba(6, 78, 59, 0.2)',
  },
  puzzleCardFailed: {
    borderColor: 'rgba(248, 113, 113, 0.5)',
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
  },
  puzzleLabel: { color: '#A78BFA', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  puzzleQuestion: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
  },
  scoreBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  scoreBadgeText: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },
  resultBanner: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  solvedBanner: { backgroundColor: 'rgba(6, 78, 59, 0.4)' },
  failedBanner: { backgroundColor: 'rgba(127, 29, 29, 0.4)' },
  resultIcon: { fontSize: 22 },
  resultText: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', flex: 1 },
  answerReveal: { color: '#FBBF24', fontWeight: '800' },

  // Hints section
  hintsSection: { marginBottom: 20 },
  hintsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hintsSectionTitle: { color: '#DDD6FE', fontSize: 15, fontWeight: '700' },
  revealHintButton: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  revealHintButtonDisabled: { opacity: 0.4 },
  revealHintButtonText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  noHintsText: { color: '#6B7280', fontSize: 13, fontStyle: 'italic' },
  hintCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  hintNumber: { color: '#FBBF24', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  hintText: { color: '#FDE68A', fontSize: 14, lineHeight: 20 },

  // Input section
  inputSection: { gap: 12, marginBottom: 8 },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    color: '#F9FAFB',
    fontSize: 17,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: { backgroundColor: '#4B2D8C', shadowOpacity: 0.1 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },

  // Proceed button
  proceedButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    marginTop: 8,
  },
  proceedButtonText: { color: '#A78BFA', fontSize: 16, fontWeight: '700' },
});
