import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';

interface GameCompletionScreenProps {
  finalScore: number;
  totalLevels: number;
  onRestart: () => void;
}

export default function GameCompletionScreen({
  finalScore,
  totalLevels,
  onRestart,
}: GameCompletionScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.6)).current;
  const contentSlide = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 70,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pulsing glow on the trophy
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Background decorative orb */}
        <Animated.View style={[styles.glowOrb, { opacity: fadeAnim }]} />

        {/* Trophy + title */}
        <Animated.View
          style={[
            styles.headerSection,
            { opacity: fadeAnim, transform: [{ scale: titleScale }] },
          ]}
        >
          <Animated.Text style={[styles.trophyEmoji, { transform: [{ scale: glowAnim }] }]}>
            🏆
          </Animated.Text>
          <Text style={styles.masterTitle}>Puzzle Master!</Text>
          <Text style={styles.congratsText}>
            You've conquered every WordQuest level!
          </Text>
        </Animated.View>

        {/* Stats card */}
        <Animated.View
          style={[
            styles.statsCard,
            { opacity: fadeAnim, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <Text style={styles.statsTitle}>🎖 Final Statistics</Text>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Levels Completed</Text>
            <Text style={styles.statRowValue}>{totalLevels} / {totalLevels}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Final Score</Text>
            <Text style={[styles.statRowValue, styles.finalScoreValue]}>{finalScore}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Max Possible Score</Text>
            <Text style={styles.statRowValue}>{totalLevels * 3 * 100}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Efficiency</Text>
            <Text style={[styles.statRowValue, styles.efficiencyValue]}>
              {Math.round((finalScore / (totalLevels * 3 * 100)) * 100)}%
            </Text>
          </View>
        </Animated.View>

        {/* Congratulatory message */}
        <Animated.View
          style={[
            styles.messageBox,
            { opacity: fadeAnim, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <Text style={styles.messageText}>
            🌟 You've mastered the art of word puzzles! Your brain is sharp, your vocabulary
            is brilliant, and you've earned the title of{' '}
            <Text style={styles.messageHighlight}>WordQuest Puzzle Master</Text>. 🌟
          </Text>
        </Animated.View>

        {/* Restart button */}
        <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            testID="restart-button"
            style={styles.restartButton}
            onPress={onRestart}
            activeOpacity={0.85}
          >
            <Text style={styles.restartButtonText}>↺  Play Again from Level 1</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0A1E' },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    flexGrow: 1,
  },

  glowOrb: {
    position: 'absolute',
    top: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#5E17EB',
    opacity: 0.12,
  },

  // Header
  headerSection: { alignItems: 'center', marginBottom: 32 },
  trophyEmoji: { fontSize: 80, marginBottom: 12 },
  masterTitle: {
    color: '#FBBF24',
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: '#F59E0B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  congratsText: {
    color: '#DDD6FE',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },

  // Stats card
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(88,28,135,0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    marginBottom: 20,
  },
  statsTitle: {
    color: '#DDD6FE',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  statRowLabel: { color: '#9CA3AF', fontSize: 14 },
  statRowValue: { color: '#F9FAFB', fontSize: 16, fontWeight: '700' },
  finalScoreValue: { color: '#FBBF24', fontSize: 22 },
  efficiencyValue: { color: '#34D399' },

  // Message box
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    marginBottom: 28,
  },
  messageText: {
    color: '#FDE68A',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  messageHighlight: { color: '#FBBF24', fontWeight: '800' },

  // Restart button
  restartButton: {
    width: '100%',
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
  restartButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
