import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';

interface CongratulatoryPopupProps {
  visible: boolean;
  puzzleScore: number;
  hintsUsed: number;
  onProceed: () => void;
}

export default function CongratulatoryPopup({
  visible,
  puzzleScore,
  hintsUsed,
  onProceed,
}: CongratulatoryPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      starAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Stars decoration */}
          <Animated.Text style={[styles.starsRow, { opacity: starAnim }]}>
            ⭐ ⭐ ⭐
          </Animated.Text>

          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Well Done!</Text>
          <Text style={styles.subtitle}>You solved the puzzle!</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Points Earned</Text>
            <Text style={styles.scoreValue}>+{puzzleScore}</Text>
            {hintsUsed > 0 && (
              <Text style={styles.hintNote}>
                ({hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used · -{hintsUsed * 15} pts)
              </Text>
            )}
          </View>

          <TouchableOpacity
            testID="congrats-proceed-button"
            style={styles.proceedButton}
            onPress={onProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedButtonText}>Next Puzzle →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#1A0F35',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  starsRow: {
    fontSize: 22,
    letterSpacing: 8,
    marginBottom: 8,
  },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A78BFA',
    fontSize: 16,
    marginBottom: 20,
  },
  scoreBox: {
    width: '100%',
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    marginBottom: 24,
  },
  scoreLabel: { color: '#FDE68A', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  scoreValue: { color: '#FBBF24', fontSize: 40, fontWeight: '900' },
  hintNote: { color: '#F59E0B', fontSize: 12, marginTop: 4 },
  proceedButton: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  proceedButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
