import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';

interface LevelCompletionScreenProps {
  levelNumber: number;
  totalScore: number;
  puzzleResults: Array<{ solved: boolean; score: number; hintsUsed: number }>;
  onNextLevel: () => void;
}

export default function LevelCompletionScreen({
  levelNumber,
  totalScore,
  puzzleResults,
  onNextLevel,
}: LevelCompletionScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const solvedCount = puzzleResults.filter((r) => r.solved).length;
  const levelPoints = puzzleResults.reduce((sum, r) => sum + r.score, 0);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const perfEmoji =
    solvedCount === 3 ? '🏆' : solvedCount >= 2 ? '⭐' : '📖';
  const perfLabel =
    solvedCount === 3
      ? 'Perfect Level!'
      : solvedCount >= 2
      ? 'Great Job!'
      : 'Keep Practising!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.perfEmoji}>{perfEmoji}</Text>
          <Text style={styles.title}>Level {levelNumber} Complete!</Text>
          <Text style={styles.perfLabel}>{perfLabel}</Text>
        </View>

        {/* Puzzle breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Puzzle Breakdown</Text>
          {puzzleResults.map((result, i) => (
            <View key={i} style={styles.puzzleRow}>
              <Text style={styles.puzzleRowIcon}>{result.solved ? '✅' : '❌'}</Text>
              <Text style={styles.puzzleRowLabel}>Puzzle {i + 1}</Text>
              {result.hintsUsed > 0 && (
                <Text style={styles.hintsUsedBadge}>
                  {result.hintsUsed} hint{result.hintsUsed > 1 ? 's' : ''}
                </Text>
              )}
              <Text style={styles.puzzleRowScore}>
                {result.solved ? `+${result.score}` : '+0'} pts
              </Text>
            </View>
          ))}
        </View>

        {/* Level total */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{solvedCount} / 3</Text>
            <Text style={styles.statLabel}>Solved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statValue}>{levelPoints}</Text>
            <Text style={styles.statLabel}>Level pts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏅</Text>
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statLabel}>Total pts</Text>
          </View>
        </View>

        {/* Next Level button */}
        <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            testID="next-level-button"
            style={styles.nextButton}
            onPress={onNextLevel}
            activeOpacity={0.85}
          >
            <Text style={styles.nextButtonText}>Next Level →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0A1E' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },

  // Header
  header: { alignItems: 'center', marginBottom: 24 },
  perfEmoji: { fontSize: 64, marginBottom: 8 },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  perfLabel: { color: '#A78BFA', fontSize: 16, fontStyle: 'italic' },

  // Breakdown card
  breakdownCard: {
    backgroundColor: 'rgba(88,28,135,0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    marginBottom: 20,
  },
  breakdownTitle: {
    color: '#DDD6FE',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  puzzleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  puzzleRowIcon: { fontSize: 18 },
  puzzleRowLabel: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', flex: 1 },
  hintsUsedBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  puzzleRowScore: { color: '#34D399', fontSize: 15, fontWeight: '700' },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { color: '#F9FAFB', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 2, fontWeight: '600' },

  // Button
  nextButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
