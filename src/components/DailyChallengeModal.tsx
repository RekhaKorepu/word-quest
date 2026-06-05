/**
 * DailyChallengeModal Component (FR-008, FR-009)
 *
 * Presents a unique daily puzzle with double XP reward.
 * Reveal Answer is NOT available on daily challenges (spec assumption §3).
 * Streak counter increments on successful completion.
 *
 * Props from contracts/ui-props.json.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyChallengePuzzle } from '../services/puzzleManager';
import { isAnswerCorrect, isEmptyGuess } from '../utils/validation';
import { GeneratedPuzzle } from '../data/fallbackPuzzles';

interface DailyChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
  streakCount: number;
}

const MAX_SCORE = 100;
const HINT_PENALTY = 15;
const MAX_GUESSES = 5;

export default function DailyChallengeModal({
  visible,
  onClose,
  onComplete,
  streakCount,
}: DailyChallengeModalProps) {
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState('');
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(MAX_GUESSES);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [puzzleScore, setPuzzleScore] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
      loadPuzzle();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      // Reset state on close
      setGuess('');
      setRevealedHints([]);
      setRemainingGuesses(MAX_GUESSES);
      setStatus('playing');
      setPuzzleScore(0);
    }
  }, [visible]);

  const loadPuzzle = async () => {
    setLoading(true);
    try {
      const { puzzle: loaded, alreadyCompleted: done } = await getDailyChallengePuzzle();
      setPuzzle(loaded);
      setAlreadyCompleted(done);
    } catch {
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!puzzle || isEmptyGuess(guess) || status !== 'playing') return;

    if (isAnswerCorrect(guess, puzzle.answer)) {
      const score = Math.max(0, MAX_SCORE - HINT_PENALTY * revealedHints.length);
      setPuzzleScore(score);
      setStatus('solved');
    } else {
      const newGuesses = Math.max(0, remainingGuesses - 1);
      setRemainingGuesses(newGuesses);
      if (newGuesses === 0) {
        setStatus('failed');
      }
    }
    setGuess('');
  };

  const handleRevealHint = () => {
    if (revealedHints.length >= 3 || status !== 'playing') return;
    setRevealedHints((prev) => [...prev, prev.length]);
  };

  const handleClaim = () => {
    onComplete(puzzleScore);
  };

  const potentialScore = MAX_SCORE - HINT_PENALTY * revealedHints.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID="daily-challenge-modal"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View
          style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <SafeAreaView edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>⚡ Daily Challenge</Text>
                <Text style={styles.streakText}>🔥 Current Streak: {streakCount} day{streakCount !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity
                testID="daily-close-button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bonusTag}>🎁 Double XP Reward</Text>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#7C3AED" />
                <Text style={styles.loadingText}>Loading today's puzzle…</Text>
              </View>
            )}

            {!loading && alreadyCompleted && (
              <View style={styles.completedContainer}>
                <Text style={styles.completedIcon}>✅</Text>
                <Text style={styles.completedTitle}>Already Completed!</Text>
                <Text style={styles.completedSubtitle}>
                  Come back tomorrow for a new challenge.
                </Text>
                <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                  <Text style={styles.doneButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !alreadyCompleted && puzzle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Puzzle */}
                <View style={[styles.puzzleCard, status === 'solved' && styles.puzzleCardSolved, status === 'failed' && styles.puzzleCardFailed]}>
                  <Text style={styles.puzzleLabel}>🔤 Today's Word</Text>
                  <Text style={styles.puzzleQuestion}>{puzzle.question}</Text>
                  {status === 'playing' && (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreBadgeText}>Worth {potentialScore} pts (×2 XP!)</Text>
                    </View>
                  )}
                  {status === 'solved' && (
                    <View style={styles.resultBanner}>
                      <Text style={styles.resultIcon}>✅</Text>
                      <Text style={styles.resultText}>+{puzzleScore} pts · +{puzzleScore * 2} XP earned!</Text>
                    </View>
                  )}
                  {status === 'failed' && (
                    <View style={[styles.resultBanner, styles.failedBanner]}>
                      <Text style={styles.resultIcon}>❌</Text>
                      <Text style={styles.resultText}>
                        Answer: <Text style={styles.answerReveal}>{puzzle.answer}</Text>
                      </Text>
                    </View>
                  )}
                </View>

                {/* Hints */}
                <View style={styles.hintsSection}>
                  <View style={styles.hintHeader}>
                    <Text style={styles.hintTitle}>💡 Hints</Text>
                    {status === 'playing' && (
                      <TouchableOpacity
                        testID="daily-reveal-hint-button"
                        style={[styles.hintButton, revealedHints.length >= 3 && styles.hintButtonDisabled]}
                        onPress={handleRevealHint}
                        disabled={revealedHints.length >= 3}
                      >
                        <Text style={styles.hintButtonText}>
                          {revealedHints.length < 3
                            ? `Reveal Hint (-15 pts) · ${3 - revealedHints.length} left`
                            : 'No More Hints'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {revealedHints.length === 0 && (
                    <Text style={styles.noHints}>No hints revealed yet.</Text>
                  )}
                  {revealedHints.map((idx) => (
                    <View key={idx} style={styles.hintCard}>
                      <Text style={styles.hintNum}>Hint {idx + 1}</Text>
                      <Text style={styles.hintText}>{puzzle.hints[idx]}</Text>
                    </View>
                  ))}
                </View>

                {/* Input */}
                {status === 'playing' && (
                  <View style={styles.inputSection}>
                    <Text style={styles.guessesLeft}>Guesses left: {remainingGuesses}</Text>
                    <TextInput
                      testID="daily-answer-input"
                      style={styles.textInput}
                      placeholder="Type your answer…"
                      placeholderTextColor="#6B7280"
                      value={guess}
                      onChangeText={setGuess}
                      onSubmitEditing={handleSubmit}
                      returnKeyType="send"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      testID="daily-submit-button"
                      style={[styles.submitButton, !guess.trim() && styles.submitButtonDisabled]}
                      onPress={handleSubmit}
                      disabled={!guess.trim()}
                    >
                      <Text style={styles.submitButtonText}>Submit ▶</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Claim or Close */}
                {status !== 'playing' && (
                  <TouchableOpacity
                    testID="daily-claim-button"
                    style={styles.claimButton}
                    onPress={handleClaim}
                  >
                    <Text style={styles.claimButtonText}>
                      {status === 'solved' ? '🎁 Claim Reward & Close' : 'Close'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0A0014',
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.5)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    maxHeight: '90%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  streakText: { color: '#F59E0B', fontSize: 12, fontWeight: '600', marginTop: 2 },
  closeButton: { padding: 6 },
  closeIcon: { color: '#6B7280', fontSize: 18, fontWeight: '700' },
  bonusTag: { color: '#34D399', fontSize: 12, fontWeight: '700', marginBottom: 14 },
  loadingContainer: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  loadingText: { color: '#9CA3AF', fontSize: 13 },
  completedContainer: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  completedIcon: { fontSize: 48 },
  completedTitle: { color: '#34D399', fontSize: 18, fontWeight: '800' },
  completedSubtitle: { color: '#9CA3AF', fontSize: 13, textAlign: 'center' },
  doneButton: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32, marginTop: 8 },
  doneButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  puzzleCard: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  puzzleCardSolved: { borderColor: 'rgba(52, 211, 153, 0.5)', backgroundColor: 'rgba(6,78,59,0.2)' },
  puzzleCardFailed: { borderColor: 'rgba(248,113,113,0.5)', backgroundColor: 'rgba(127,29,29,0.2)' },
  puzzleLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  puzzleQuestion: { color: '#F9FAFB', fontSize: 18, fontWeight: '700', lineHeight: 28 },
  scoreBadge: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  scoreBadgeText: { color: '#FBBF24', fontSize: 11, fontWeight: '700' },
  resultBanner: { marginTop: 12, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(6,78,59,0.4)' },
  failedBanner: { backgroundColor: 'rgba(127,29,29,0.4)' },
  resultIcon: { fontSize: 18 },
  resultText: { color: '#F9FAFB', fontSize: 13, fontWeight: '600', flex: 1 },
  answerReveal: { color: '#FBBF24', fontWeight: '800' },
  hintsSection: { marginBottom: 16 },
  hintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hintTitle: { color: '#DDD6FE', fontSize: 14, fontWeight: '700' },
  hintButton: { backgroundColor: 'rgba(124,58,237,0.25)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)' },
  hintButtonDisabled: { opacity: 0.4 },
  hintButtonText: { color: '#A78BFA', fontSize: 11, fontWeight: '700' },
  noHints: { color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
  hintCard: { backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', borderRadius: 10, padding: 12, marginBottom: 8 },
  hintNum: { color: '#FBBF24', fontSize: 11, fontWeight: '700', marginBottom: 3 },
  hintText: { color: '#FDE68A', fontSize: 13 },
  inputSection: { gap: 10, marginBottom: 12 },
  guessesLeft: { color: '#6B7280', fontSize: 12, textAlign: 'right' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', color: '#F9FAFB', fontSize: 16, paddingHorizontal: 16, paddingVertical: 13 },
  submitButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#4B2D8C' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  claimButton: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', marginTop: 4 },
  claimButtonText: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
});
