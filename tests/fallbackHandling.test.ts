import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQueue,
  clearQueue,
  getNextPuzzle,
  getCooldownUntil,
  setCooldownUntil,
  prefetchPuzzles,
} from '../src/services/puzzleManager';
import * as geminiService from '../src/services/gemini';
import { FALLBACK_PUZZLES } from '../src/data/fallbackPuzzles';

describe('Fallback Handling & Cooldown', () => {
  beforeEach(() => {
    clearQueue();
    setCooldownUntil(0);
    vi.useFakeTimers();
    vi.stubEnv('EXPO_PUBLIC_GEMINI_API_KEY', 'test-api-key');
    vi.spyOn(geminiService, 'generateGeminiPuzzle');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('triggers 60-second cooldown on API failure and pulls from fallback database', async () => {
    // API throws an error
    vi.mocked(geminiService.generateGeminiPuzzle).mockRejectedValue(new Error('Network error'));

    // Try to prefetch
    await prefetchPuzzles(1);

    // Cooldown should be active (60s in the future)
    expect(getCooldownUntil()).toBeGreaterThan(Date.now());

    // Queue should have been populated using local fallbacks
    expect(getQueue().length).toBe(3);
    const item = getQueue()[0];
    expect(item.difficulty).toBe('easy');
    verifyFallbackPuzzle(item);
  });

  it('bypasses the API completely while cooldown is active', async () => {
    // Set active cooldown
    setCooldownUntil(Date.now() + 30000);

    await prefetchPuzzles(1);

    // API should not be called
    expect(geminiService.generateGeminiPuzzle).not.toHaveBeenCalled();
    expect(getQueue().length).toBe(3);
  });

  it('retries the API after the 60-second cooldown expires', async () => {
    // 1. Simulate API failure to activate cooldown
    vi.mocked(geminiService.generateGeminiPuzzle).mockRejectedValue(new Error('Network error'));
    await prefetchPuzzles(1);
    expect(getCooldownUntil()).toBeGreaterThan(Date.now());
    
    // Clear queue so we can prefetch again
    clearQueue();
    vi.mocked(geminiService.generateGeminiPuzzle).mockClear();

    // 2. Fast-forward time by 61 seconds (cooldown expires)
    vi.advanceTimersByTime(61000);

    // 3. API should be called again on next prefetch
    vi.mocked(geminiService.generateGeminiPuzzle).mockResolvedValue({
      id: 'test-id',
      question: 'Valid question here, length is good!',
      answer: 'test',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      difficulty: 'easy',
    });

    await prefetchPuzzles(1);

    expect(geminiService.generateGeminiPuzzle).toHaveBeenCalled();
  });

  it('selects a fallback puzzle matching the currently requested difficulty', async () => {
    // Force fallback mode by triggering cooldown
    setCooldownUntil(Date.now() + 30000);

    // Prefetch for level 5 (requires medium/easy blend)
    // To be clean, let's explicitly request a fallback of medium difficulty
    // We can prefetch puzzles for level 5 (where medium puzzles can appear)
    // Let's test the dynamic selection of fallbacks.
    // If we request a fallback for level 5, let's make sure it chooses easy/medium based on the odds.
    await prefetchPuzzles(5);
    const queue = getQueue();
    expect(queue.length).toBe(3);
    
    for (const puzzle of queue) {
      expect(['easy', 'medium']).toContain(puzzle.difficulty);
      verifyFallbackPuzzle(puzzle);
    }
  });
});

function verifyFallbackPuzzle(puzzle: any) {
  const matchingRaw = FALLBACK_PUZZLES.find((p) => p.id === puzzle.id);
  expect(matchingRaw).toBeDefined();
  expect(matchingRaw?.question).toBe(puzzle.question);
  expect(matchingRaw?.answer).toBe(puzzle.answer);
  expect(matchingRaw?.difficulty).toBe(puzzle.difficulty);
}
