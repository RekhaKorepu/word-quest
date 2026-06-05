/**
 * AchievementToast Component (FR-005)
 *
 * Non-intrusive in-game toast notification that slides in from the top
 * when an achievement is unlocked. Displays sequentially via the
 * pending achievement queue managed by useProfileState.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { AchievementDefinition } from '../services/achievementEvaluator';
import { playSound } from '../services/audioManager';

interface AchievementToastProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 3500;

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const slideY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievement) return;

    playSound('achievement');

    // Slide in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after delay
    const timer = setTimeout(() => {
      dismissWithAnimation();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [achievement]);

  const dismissWithAnimation = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: -100, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!achievement) return null;

  return (
    <Animated.View
      testID="achievement-toast"
      style={[
        styles.container,
        { opacity, transform: [{ translateY: slideY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.toastCard}
        onPress={dismissWithAnimation}
        activeOpacity={0.9}
        testID="achievement-toast-card"
      >
        <Text style={styles.icon}>{achievement.icon}</Text>
        <View style={styles.textBlock}>
          <Text style={styles.label}>Achievement Unlocked!</Text>
          <Text style={styles.name}>{achievement.name}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A0A33',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    fontSize: 32,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
});
