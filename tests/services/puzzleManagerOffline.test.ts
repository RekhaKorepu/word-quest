import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQueue,
  clearQueue,
  prefetchPuzzles,
  getNextPuzzle,
  initializeQueue,
} from '../../src/services/puzzleManager';
import * as geminiService from '../../src/services/gemini';
import { saveOfflinePuzzleCache, loadOfflinePuzzleCache } from '../../src/utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('PuzzleManager Offline Cache & Fallbacks', () => {
  beforeEach(async () => {
    clearQueue();
    // Reset internal cacheLoaded flag by dynamically resetting puzzleManager's cache state if needed,
    // or we can rely on clearQueue resetting the queue, and mock/stub profiles.
    await AsyncStorage.clear();
    vi.stubEnv('EXPO_PUBLIC_GEMINI_API_KEY', 'test-api-key');
    vi.spyOn(geminiService, 'generateGeminiPuzzle');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads cached puzzles from storage on startup / first prefetch', async () => {
    const cachedPuzzles = [
      {
        id: 'cached-1',
        question: 'This is a cached puzzle question of good length!',
        answer: 'cachedone',
        hints: ['Hint 1', 'Hint 2', 'Hint 3'] as [string, string, string],
        difficulty: 'easy' as const,
      },
      {
        id: 'cached-2',
        question: 'This is another cached puzzle question of good length!',
        answer: 'cachedtwo',
        hints: ['Hint A', 'Hint B', 'Hint C'] as [string, string, string],
        difficulty: 'easy' as const,
      }
    ];

    // Save to cache storage directly
    await saveOfflinePuzzleCache(cachedPuzzles);

    // Call prefetchPuzzles which should trigger ensureCacheLoaded
    await prefetchPuzzles(1);

    // The queue should now contain the cached puzzles
    const queue = getQueue();
    expect(queue.length).toBeGreaterThanOrEqual(2);
    expect(queue[0].id).toBe('cached-1');
    expect(queue[1].id).toBe('cached-2');
  });

  it('saves the prefetch queue back to storage on successful API fetch', async () => {
    // API returns a valid puzzle
    vi.mocked(geminiService.generateGeminiPuzzle).mockResolvedValue({
      id: 'gemini-1',
      question: 'This is a valid Gemini puzzle question of good length!',
      answer: 'gemini',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      difficulty: 'easy',
    });

    await prefetchPuzzles(1);

    // Should have saved the queue to storage
    const stored = await loadOfflinePuzzleCache();
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0].id).toBe('gemini-1');
  });

  it('retrieves puzzles from the offline cache when the API fails and cache has items', async () => {
    const cachedPuzzles = [
      {
        id: 'cached-offline-1',
        question: 'This is a cached puzzle question of good length!',
        answer: 'cachedone',
        hints: ['Hint 1', 'Hint 2', 'Hint 3'] as [string, string, string],
        difficulty: 'easy' as const,
      }
    ];
    await saveOfflinePuzzleCache(cachedPuzzles);

    // Make API fail
    vi.mocked(geminiService.generateGeminiPuzzle).mockRejectedValue(new Error('Network error'));

    // Call prefetch
    await prefetchPuzzles(1);

    // The queue should contain the cached puzzle
    const queue = getQueue();
    expect(queue.map(p => p.id)).toContain('cached-offline-1');
  });

  it('falls back to static puzzles when API fails and cache is empty', async () => {
    // Make API fail and cache is empty
    vi.mocked(geminiService.generateGeminiPuzzle).mockRejectedValue(new Error('Network error'));

    await prefetchPuzzles(1);

    // Should fall back to static levels
    const queue = getQueue();
    expect(queue.length).toBe(3);
    expect(queue[0].id).not.toContain('gemini');
    expect(queue[0].id).not.toContain('cached');
  });
});
