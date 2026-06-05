/**
 * ProfileHeader Component
 *
 * Displays the player's current Level, Rank, and XP progress bar.
 * Renders in the puzzle screen header (FR-001, FR-002, FR-003).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { XP_PER_LEVEL } from '../services/profileManager';

interface ProfileHeaderProps {
  xp: number;
  level: number;
  rank: string;
}

export default function ProfileHeader({ xp, level, rank }: ProfileHeaderProps) {
  const xpWithinLevel = xp % XP_PER_LEVEL;
  const xpProgress = xpWithinLevel / XP_PER_LEVEL;

  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: xpProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [xpProgress]);

  return (
    <View style={styles.container} testID="profile-header">
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>
        <View style={styles.infoColumn}>
          <View style={styles.rankRow}>
            <Text style={styles.rankText}>{rank}</Text>
            <Text style={styles.xpText}>
              {xpWithinLevel} / {XP_PER_LEVEL} XP
            </Text>
          </View>
          {/* XP Progress Bar */}
          <View style={styles.barTrack}>
            <Animated.View
              testID="xp-progress-bar"
              style={[
                styles.barFill,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 44,
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  levelValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  infoColumn: {
    flex: 1,
    gap: 6,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankText: {
    color: '#DDD6FE',
    fontSize: 13,
    fontWeight: '700',
  },
  xpText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 3,
  },
});
