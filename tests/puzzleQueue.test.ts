import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQueue,
  clearQueue,
  enqueue,
  dequeue,
  initializeQueue,
  getNextPuzzle,
} from '../src/services/puzzleManager';
import * as geminiService from '../src/services/gemini';
import { FALLBACK_PUZZLES } from '../src/data/fallbackPuzzles';

describe('Puzzle Queue Operations', () => {
  beforeEach(() => {
    clearQueue();
    vi.stubEnv('EXPO_PUBLIC_GEMINI_API_KEY', 'test-api-key');
    vi.spyOn(geminiService, 'generateGeminiPuzzle');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can enqueue and dequeue puzzles', () => {
    const puzzle = FALLBACK_PUZZLES[0]; // easy
    enqueue(puzzle);
    expect(getQueue().length).toBe(1);

    const popped = dequeue();
    expect(popped).toEqual(puzzle);
    expect(getQueue().length).toBe(0);
  });

  it('initializes the queue with 3 validated puzzles', async () => {
    vi.mocked(geminiService.generateGeminiPuzzle).mockResolvedValue({
      id: 'test-id',
      question: 'Valid question here, length is good!',
      answer: 'test',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      difficulty: 'easy',
    });

    await initializeQueue(1);

    expect(getQueue().length).toBe(3);
    expect(geminiService.generateGeminiPuzzle).toHaveBeenCalledTimes(3);
  });

  it('automatically triggers background prefetch to replenish queue size to 3 when a puzzle is retrieved', async () => {
    vi.mocked(geminiService.generateGeminiPuzzle).mockResolvedValue({
      id: 'test-id',
      question: 'Valid question here, length is good!',
      answer: 'test',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      difficulty: 'easy',
    });

    // Populate queue
    await initializeQueue(1);
    expect(getQueue().length).toBe(3);

    // Get next puzzle - should dequeue one and trigger a background prefetch
    const puzzle = await getNextPuzzle(1);
    expect(puzzle).toBeDefined();

    // Since prefetching is asynchronous, wait for it to finish
    // We can yield to the microtask queue or use a short delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getQueue().length).toBe(3);
  });
});
