/**
 * RevealAnswerControl Component (FR-007)
 *
 * Placed adjacent to the "Reveal Hint" button.
 * When clicked: sets puzzle score to 0, displays the correct answer,
 * disables input, and renders a "Next Puzzle" button.
 *
 * Props mirror contracts/ui-props.json.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

interface RevealAnswerControlProps {
  onReveal: () => void;
  revealed: boolean;
  correctAnswer: string;
  onNextPuzzle: () => void;
  /** If true, hides the entire control (e.g., on Daily Challenge puzzles) */
  disabled?: boolean;
}

export default function RevealAnswerControl({
  onReveal,
  revealed,
  correctAnswer,
  onNextPuzzle,
  disabled = false,
}: RevealAnswerControlProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (revealed) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [revealed]);

  if (disabled) return null;

  if (revealed) {
    return (
      <Animated.View
        style={[
          styles.revealedContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
        testID="reveal-answer-revealed"
      >
        <View style={styles.answerDisplay}>
          <Text style={styles.answerLabel}>💡 Answer Revealed</Text>
          <Text style={styles.answerText} testID="revealed-answer-text">
            {correctAnswer}
          </Text>
          <Text style={styles.scoreNote}>+0 points (answer revealed)</Text>
        </View>
        <TouchableOpacity
          testID="next-puzzle-button"
          style={styles.nextButton}
          onPress={onNextPuzzle}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next Puzzle →</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      testID="reveal-answer-button"
      style={styles.revealButton}
      onPress={onReveal}
      activeOpacity={0.75}
    >
      <Text style={styles.revealButtonText}>👁 Reveal Answer (0 pts)</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  revealButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  revealButtonText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  revealedContainer: {
    marginTop: 12,
    gap: 12,
  },
  answerDisplay: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  answerLabel: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  answerText: {
    color: '#FBBF24',
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scoreNote: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  nextButtonText: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '700',
  },
});
