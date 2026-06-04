import { GeneratedPuzzle, FALLBACK_PUZZLES } from '../data/fallbackPuzzles';
import { generateGeminiPuzzle } from './gemini';

// In-memory prefetch queue state
let puzzleQueue: GeneratedPuzzle[] = [];
let cooldownUntil = 0;
let consecutiveFailures = 0;

// INAPPROPRIATE_TERMS for validation
const INAPPROPRIATE_TERMS = [
  'badword',
  'profanity',
  'offensive',
  'fuck',
  'shit',
  'ass',
  'bitch',
  'crap',
  'damn'
];

/**
 * Validates a puzzle according to requirements:
 * - A non-empty answer consisting of letters only.
 * - Exactly three distinct hints.
 * - A question string length between 15 and 200 characters.
 * - No flagged or inappropriate terms.
 */
export function validatePuzzle(puzzle: any): puzzle is GeneratedPuzzle {
  if (!puzzle || typeof puzzle !== 'object') return false;

  const { question, answer, hints, difficulty } = puzzle;

  // 1. Validate difficulty
  if (difficulty !== 'easy' && difficulty !== 'medium') {
    return false;
  }

  // 2. Validate question length
  if (typeof question !== 'string' || question.length < 15 || question.length > 200) {
    return false;
  }

  // 3. Validate answer format (single word, alphabetic only)
  if (typeof answer !== 'string' || !/^[a-zA-Z]+$/.test(answer)) {
    return false;
  }

  // 4. Validate hints structure
  if (!Array.isArray(hints) || hints.length !== 3) {
    return false;
  }

  // 5. Every hint must be non-empty and unique
  const uniqueHints = new Set<string>();
  for (const hint of hints) {
    if (typeof hint !== 'string' || hint.trim() === '') {
      return false;
    }
    uniqueHints.add(hint.trim());
  }

  if (uniqueHints.size !== 3) {
    return false;
  }

  // 6. Content safety check
  const textToCheck = `${question} ${answer}`.toLowerCase();
  const isSafe = !INAPPROPRIATE_TERMS.some((term) => textToCheck.includes(term));
  if (!isSafe) {
    return false;
  }

  return true;
}

/**
 * Returns the current in-memory queue.
 */
export function getQueue(): GeneratedPuzzle[] {
  return puzzleQueue;
}

/**
 * Clears the queue.
 */
export function clearQueue(): void {
  puzzleQueue = [];
}

/**
 * Enqueues a puzzle.
 */
export function enqueue(puzzle: GeneratedPuzzle): void {
  puzzleQueue.push(puzzle);
}

/**
 * Dequeues a puzzle.
 */
export function dequeue(): GeneratedPuzzle | null {
  return puzzleQueue.shift() || null;
}

/**
 * Returns the timestamp when the current cooldown expires.
 */
export function getCooldownUntil(): number {
  return cooldownUntil;
}

/**
 * Manually sets the cooldown timestamp.
 */
export function setCooldownUntil(time: number): void {
  cooldownUntil = time;
}

/**
 * Returns the calculated difficulty class for a level.
 * - Level 1 & 2: 100% Easy.
 * - Level 3 & 4: 90% Easy / 10% Medium.
 * - Level 5+: 80% Easy / 20% Medium.
 */
export function getDifficultyForLevel(level: number): 'easy' | 'medium' {
  if (level <= 2) return 'easy';
  const rand = Math.random();
  if (level <= 4) {
    return rand < 0.1 ? 'medium' : 'easy';
  }
  return rand < 0.2 ? 'medium' : 'easy';
}

/**
 * Gets a random fallback puzzle matching the requested difficulty.
 */
export function getFallbackPuzzle(difficulty: 'easy' | 'medium'): GeneratedPuzzle {
  const matching = FALLBACK_PUZZLES.filter((p) => p.difficulty === difficulty);
  if (matching.length === 0) {
    // Fallback in case of empty filter (should not happen)
    return FALLBACK_PUZZLES[0];
  }
  const idx = Math.floor(Math.random() * matching.length);
  return matching[idx];
}

/**
 * Helper to fetch with a timeout.
 */
async function fetchPuzzleWithTimeout(difficulty: 'easy' | 'medium', timeoutMs = 15000): Promise<GeneratedPuzzle> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  return Promise.race([
    generateGeminiPuzzle(difficulty),
    timeoutPromise,
  ]);
}

/**
 * Prefetches puzzles to fill the queue to 3 items.
 */
export async function prefetchPuzzles(levelNumber: number): Promise<void> {
  while (puzzleQueue.length < 3) {
    const difficulty = getDifficultyForLevel(levelNumber);

    // 1. If cooldown is active, bypass API and use fallback
    if (Date.now() < cooldownUntil) {
      puzzleQueue.push(getFallbackPuzzle(difficulty));
      continue;
    }

    // 2. Query the API
    try {
      const puzzle = await fetchPuzzleWithTimeout(difficulty, 15000);
      
      if (validatePuzzle(puzzle)) {
        const puzzleWithId: GeneratedPuzzle = {
          id: puzzle.id || `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          question: puzzle.question,
          answer: puzzle.answer,
          hints: puzzle.hints as [string, string, string],
          difficulty: puzzle.difficulty,
        };
        puzzleQueue.push(puzzleWithId);
        consecutiveFailures = 0; // Reset failures on success
      } else {
        // Discard invalid puzzle and increment consecutive failures
        console.warn('[PuzzleManager] Generated puzzle failed validation. Discarding.');
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
          console.warn('[PuzzleManager] 3 consecutive generation failures. Triggering 60s cooldown.');
          cooldownUntil = Date.now() + 60000;
          consecutiveFailures = 0;
          puzzleQueue.push(getFallbackPuzzle(difficulty));
        }
      }
    } catch (err: any) {
      console.warn('[PuzzleManager] API call failed:', err.message);
      consecutiveFailures++;
      
      // Trigger cooldown after a failure
      // (either single network error, or 3 consecutive validation/api failures)
      // "The system MUST implement a request cooldown mechanism of 60 seconds following a Gemini API failure."
      cooldownUntil = Date.now() + 60000;
      consecutiveFailures = 0;
      
      puzzleQueue.push(getFallbackPuzzle(difficulty));
    }
  }
}

/**
 * Initializes the queue with 3 puzzles.
 */
export async function initializeQueue(levelNumber: number): Promise<void> {
  clearQueue();
  await prefetchPuzzles(levelNumber);
}

/**
 * Dequeues the next puzzle and triggers background prefetching to replenish the queue.
 */
export async function getNextPuzzle(levelNumber: number): Promise<GeneratedPuzzle> {
  let puzzle = dequeue();
  
  if (!puzzle) {
    // If queue is empty, grab a fallback immediately to avoid blocking
    const difficulty = getDifficultyForLevel(levelNumber);
    puzzle = getFallbackPuzzle(difficulty);
  }

  // Trigger background prefetch (asynchronous, do not await)
  prefetchPuzzles(levelNumber).catch((err) => {
    console.error('[PuzzleManager] Background prefetch failed:', err);
  });

  return puzzle;
}
