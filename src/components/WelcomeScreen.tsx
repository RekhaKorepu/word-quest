import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
  hasSavedProgress: boolean;
  onStartGame: () => void;
  onNewGame: () => void;
}

export default function WelcomeScreen({
  hasSavedProgress,
  onStartGame,
  onNewGame,
}: WelcomeScreenProps) {
  // Animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const decorOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations sequence
    Animated.sequence([
      // Title fades in and slides down
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // Decorative elements and subtitle fade in
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(decorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Button bounces in
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Start button pulsing after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top section: Title + subtitle */}
        <View style={styles.topSection}>
          {/* Puzzle icon decoration */}
          <Animated.View style={[styles.iconRow, { opacity: decorOpacity }]}>
            <Text style={styles.puzzleIcon}>🧩</Text>
            <Text style={styles.puzzleIcon}>💡</Text>
            <Text style={styles.puzzleIcon}>🔤</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            WordQuest
          </Animated.Text>

          <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
            Challenge Your Mind. Master Every Word.
          </Animated.Text>

          <Animated.View style={[styles.descriptionBox, { opacity: subtitleOpacity }]}>
            <Text style={styles.descriptionText}>
              Solve clever word puzzles, unlock hints, earn points, and become the ultimate{' '}
              <Text style={styles.highlightText}>Puzzle Master</Text>!
            </Text>
          </Animated.View>

          {/* Decorative puzzle-themed stats row */}
          <Animated.View style={[styles.statsRow, { opacity: decorOpacity }]}>
            <View style={styles.statBadge}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBadge}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statLabel}>Hints</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBadge}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statLabel}>Levels</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom section: CTA buttons ~25% from bottom */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonOpacity,
              transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }],
            },
          ]}
        >
          <TouchableOpacity
            testID="primary-action-button"
            style={styles.primaryButton}
            onPress={onStartGame}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {hasSavedProgress ? '▶  Resume Game' : '▶  Start Game'}
            </Text>
          </TouchableOpacity>

          {hasSavedProgress && (
            <TouchableOpacity
              testID="new-game-button"
              style={styles.secondaryButton}
              onPress={onNewGame}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>↺  Start New Game</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
    paddingTop: 24,
    overflow: 'hidden',
  },

  // Top section
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  puzzleIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
    textShadowColor: '#A855F7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 15,
    color: '#A78BFA',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  descriptionBox: {
    backgroundColor: 'rgba(88, 28, 135, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginBottom: 28,
  },
  descriptionText: {
    color: '#DDD6FE',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  highlightText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 0,
  },
  statBadge: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statIcon: {
    fontSize: 22,
  },
  statLabel: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Bottom CTA section — positioned ~25% from bottom via paddingBottom in container
  buttonSection: {
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  secondaryButtonText: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '600',
  },
});
