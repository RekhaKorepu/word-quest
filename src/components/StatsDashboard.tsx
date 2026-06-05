/**
 * StatsDashboard Component (FR-006)
 *
 * Modal overlay displaying:
 *  - Total Puzzles Solved
 *  - Total Hints Used
 *  - Average Score per puzzle
 *  - Best Level Score
 *  - Success Rate (%)
 *
 * Props from contracts/ui-props.json.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameStatsSnapshot } from '../services/profileManager';

interface StatsDashboardProps {
  visible: boolean;
  onClose: () => void;
  stats: GameStatsSnapshot;
}

interface StatRowProps {
  icon: string;
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatRow({ icon, label, value, accent = false }: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
    </View>
  );
}

export default function StatsDashboard({ visible, onClose, stats }: StatsDashboardProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID="stats-dashboard-modal"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View
          style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📊 Statistics</Text>
              <TouchableOpacity
                testID="stats-close-button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.statsBlock}>
                <StatRow
                  icon="🎯"
                  label="Puzzles Solved"
                  value={stats.puzzlesSolved}
                  accent
                />
                <StatRow icon="📝" label="Puzzles Attempted" value={stats.puzzlesAttempted} />
                <StatRow icon="✅" label="Success Rate" value={`${stats.successRate}%`} accent />
                <StatRow icon="⭐" label="Average Score" value={stats.averageScore} />
                <StatRow icon="🏆" label="Best Level Score" value={stats.bestLevelScore} accent />
                <StatRow icon="💡" label="Hints Used" value={stats.hintsUsed} />
              </View>

              {stats.puzzlesAttempted === 0 && (
                <View style={styles.emptyHint}>
                  <Text style={styles.emptyHintText}>
                    Play your first puzzle to start tracking stats!
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    width: '100%',
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    maxWidth: 420,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 6,
  },
  closeIcon: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '700',
  },
  statsBlock: {
    gap: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  statIcon: {
    fontSize: 18,
    width: 28,
  },
  statLabel: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  statValueAccent: {
    color: '#A78BFA',
  },
  emptyHint: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyHintText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
