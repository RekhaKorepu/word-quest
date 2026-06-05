/**
 * useProfileState Hook
 *
 * Wraps the PlayerProfile in React state and exposes helpers for:
 *  - Loading/saving profile from/to AsyncStorage (via profileStorage)
 *  - Applying puzzle outcomes (XP, score, stats)
 *  - Evaluating and unlocking achievements
 *  - Recording daily challenge completions
 *
 * Principle VII: all business logic lives in profileManager / achievementEvaluator.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  PlayerProfile,
  loadProfile,
  saveProfile,
  createDefaultProfile,
} from '../utils/profileStorage';
import {
  applyPuzzleOutcome,
  applyLevelCompletion,
  applyDailyChallenge,
  computeStats,
  GameStatsSnapshot,
  PuzzleOutcome,
  LevelOutcome,
} from '../services/profileManager';
import {
  evaluateAchievements,
  ACHIEVEMENTS,
  AchievementDefinition,
} from '../services/achievementEvaluator';

// ─── Hook return type ─────────────────────────────────────────────────────────

export interface UseProfileStateReturn {
  profile: PlayerProfile;
  stats: GameStatsSnapshot;
  isProfileLoading: boolean;
  /** Pending achievement toasts to display (consumed by the toast renderer) */
  pendingAchievements: AchievementDefinition[];
  /** Call after a puzzle finishes to update XP, score, stats, and check achievements */
  recordPuzzleOutcome: (outcome: PuzzleOutcome) => void;
  /** Call after a level is fully completed (all 3 puzzles) */
  recordLevelCompletion: (outcome: LevelOutcome) => void;
  /** Call when the daily challenge is completed; returns double XP */
  recordDailyChallenge: (baseScore: number) => Promise<{ alreadyCompleted: boolean }>;
  /** Dismiss the oldest pending achievement toast */
  dismissAchievement: () => void;
  /** Unlock an achievement by ID explicitly (idempotent) */
  unlockAchievement: (id: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfileState(): UseProfileStateReturn {
  const [profile, setProfile] = useState<PlayerProfile>(createDefaultProfile());
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [pendingAchievements, setPendingAchievements] = useState<AchievementDefinition[]>([]);

  // Load persisted profile on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadProfile();
      setProfile(loaded);
      setIsProfileLoading(false);
    })();
  }, []);

  // Auto-save profile whenever it changes (after initial load)
  useEffect(() => {
    if (isProfileLoading) return;
    saveProfile(profile);
  }, [profile, isProfileLoading]);

  /**
   * Checks for newly unlocked achievements and queues them as toasts.
   */
  const checkAndQueueAchievements = useCallback(
    (updatedProfile: PlayerProfile, consecutiveSolvedCount: number = 0) => {
      const newlyUnlocked = evaluateAchievements(updatedProfile, consecutiveSolvedCount);
      if (newlyUnlocked.length > 0) {
        // Mark the achievements as unlocked in the profile
        setProfile((prev) => {
          const ids = new Set(prev.unlockedAchievementIds);
          newlyUnlocked.forEach((a) => ids.add(a.id));
          const updated = { ...prev, unlockedAchievementIds: Array.from(ids) };
          saveProfile(updated);
          return updated;
        });
        // Queue toasts
        setPendingAchievements((prev) => [...prev, ...newlyUnlocked]);
      }
    },
    []
  );

  const recordPuzzleOutcome = useCallback(
    (outcome: PuzzleOutcome) => {
      setProfile((prev) => {
        const updated = applyPuzzleOutcome(prev, outcome);
        checkAndQueueAchievements(updated);
        return updated;
      });
    },
    [checkAndQueueAchievements]
  );

  const recordLevelCompletion = useCallback(
    (outcome: LevelOutcome) => {
      setProfile((prev) => {
        const updated = applyLevelCompletion(prev, outcome);
        return updated;
      });
    },
    []
  );

  const recordDailyChallenge = useCallback(
    async (baseScore: number): Promise<{ alreadyCompleted: boolean }> => {
      const bonusXp = baseScore * 2; // double XP (FR-008)
      return new Promise((resolve) => {
        setProfile((prev) => {
          const { profile: updated, alreadyCompleted } = applyDailyChallenge(prev, bonusXp);
          if (!alreadyCompleted) {
            checkAndQueueAchievements(updated);
          }
          resolve({ alreadyCompleted });
          return alreadyCompleted ? prev : updated;
        });
      });
    },
    [checkAndQueueAchievements]
  );

  const dismissAchievement = useCallback(() => {
    setPendingAchievements((prev) => prev.slice(1));
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setProfile((prev) => {
      if (prev.unlockedAchievementIds.includes(id)) return prev;
      const definition = ACHIEVEMENTS.find((a) => a.id === id);
      if (definition) {
        setPendingAchievements((pend) => [...pend, definition]);
      }
      const updated = {
        ...prev,
        unlockedAchievementIds: [...prev.unlockedAchievementIds, id],
      };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const stats = computeStats(profile);

  return {
    profile,
    stats,
    isProfileLoading,
    pendingAchievements,
    recordPuzzleOutcome,
    recordLevelCompletion,
    recordDailyChallenge,
    dismissAchievement,
    unlockAchievement,
  };
}
