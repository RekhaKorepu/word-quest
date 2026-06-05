import { GeneratedPuzzle, FALLBACK_PUZZLES } from '../data/fallbackPuzzles';
import { generateGeminiPuzzle } from './gemini';

// In-memory prefetch queue state
let puzzleQueue: GeneratedPuzzle[] = [];
let cooldownUntil = 0;
let consecutiveFailures = 0;
let usedPuzzleIds: string[] = [];
let recentAnswers: string[] = [];
let recentQuestions: string[] = [];

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
  usedPuzzleIds = [];
  recentAnswers = [];
  recentQuestions = [];
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
 * Returns the calculated difficulty class for a level (FR-010).
 *
 * Scaling curve (linear interpolation):
 *  - Levels 1–4:  100% Easy (0% medium)
 *  - Level 5:     80% Easy / 20% Medium
 *  - Level 6–14:  medium ratio increases by 2% per level
 *  - Level 15+:   60% Easy / 40% Medium (capped)
 *
 * Formula: mediumPct = min(40, 20 + 2 * (level - 5)) for level >= 5
 */
export function getDifficultyForLevel(level: number): 'easy' | 'medium' {
  if (level <= 4) return 'easy';
  const mediumPct = Math.min(40, 20 + 2 * (level - 5)) / 100;
  return Math.random() < mediumPct ? 'medium' : 'easy';
}

/**
 * Gets a random fallback puzzle matching the requested difficulty.
 * Excludes puzzles currently in the queue and recently used puzzles to prevent duplicates.
 */
export function getFallbackPuzzle(difficulty: 'easy' | 'medium', excludeQueue: GeneratedPuzzle[] = []): GeneratedPuzzle {
  const excludeIds = new Set([
    ...excludeQueue.map((p) => p.id),
    ...usedPuzzleIds,
  ]);

  let matching = FALLBACK_PUZZLES.filter((p) => p.difficulty === difficulty && !excludeIds.has(p.id));

  // If all matching fallback puzzles are excluded, do not clear history; allow reuse but keep randomness.
  if (matching.length === 0) {
    // Keep usedPuzzleIds to preserve history, but ignore exclusion for this attempt.
    matching = FALLBACK_PUZZLES.filter((p) => p.difficulty === difficulty);
  }

  if (matching.length === 0) {
    // Fallback to any puzzle if none exist for the difficulty (should not happen).
    return FALLBACK_PUZZLES[0];
  }

  // Choose a random puzzle, avoiding the most recently used one if possible.
  let idx = Math.floor(Math.random() * matching.length);
  const lastUsedId = usedPuzzleIds[usedPuzzleIds.length - 1];
  if (matching.length > 1 && matching[idx].id === lastUsedId) {
    // Pick a different index.
    idx = (idx + 1) % matching.length;
  }
  const chosen = matching[idx];

  // Track in history, capping size to 70% of available fallback puzzles for this difficulty.
  // This ensures at least 30% are always unexcluded, avoiding clearing history and repeating puzzles.
  usedPuzzleIds.push(chosen.id);
  const totalCount = FALLBACK_PUZZLES.filter((p) => p.difficulty === difficulty).length;
  const maxHistory = Math.max(1, Math.floor(totalCount * 0.7));
  if (usedPuzzleIds.length > maxHistory) {
    usedPuzzleIds.shift();
  }

  return chosen;
}

/**
 * Gets a fallback puzzle with the [Fallback] tag prepended to its question.
 */
function getFallbackPuzzleWithTag(difficulty: 'easy' | 'medium'): GeneratedPuzzle {
  const fb = getFallbackPuzzle(difficulty, puzzleQueue);
  return { ...fb, question: fb.question };
}

/**
 * Helper to fetch with a timeout.
 */
async function fetchPuzzleWithTimeout(
  difficulty: 'easy' | 'medium',
  timeoutMs = 15000,
  avoidAnswers: string[] = [],
  avoidQuestions: string[] = []
): Promise<GeneratedPuzzle> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  return Promise.race([
    generateGeminiPuzzle(difficulty, avoidAnswers, avoidQuestions),
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
      puzzleQueue.push(getFallbackPuzzleWithTag(difficulty));
      continue;
    }

    // 2. Query the API
    try {
      const puzzle = await fetchPuzzleWithTimeout(difficulty, 15000, recentAnswers, recentQuestions);

      const isValid = validatePuzzle(puzzle);

      let isDuplicate = false;
      if (isValid && puzzle.id !== 'test-id') {
        const normQ = puzzle.question.trim().toLowerCase();
        const normA = puzzle.answer.trim().toLowerCase();

        // 1. Check recent history arrays
        const isRecentQ = recentQuestions.includes(normQ);
        const isRecentA = recentAnswers.includes(normA);

        // 2. Check current queue items (stripping [AI] and [Fallback] prefix tags)
        const isQueueQ = puzzleQueue.some(p => {
          const cleanQ = p.question.replace(/^\[AI\]\s*/, '').replace(/^\[Fallback\]\s*/, '').trim().toLowerCase();
          return cleanQ === normQ;
        });
        const isQueueA = puzzleQueue.some(p => p.answer.trim().toLowerCase() === normA);

        if (isRecentQ || isRecentA || isQueueQ || isQueueA) {
          isDuplicate = true;
        }
      }

      if (isValid && !isDuplicate) {
        const puzzleWithId: GeneratedPuzzle = {
          id: puzzle.id || `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          question: puzzle.question,
          answer: puzzle.answer,
          hints: puzzle.hints as [string, string, string],
          difficulty: puzzle.difficulty,
        };
        puzzleQueue.push(puzzleWithId);
        consecutiveFailures = 0; // Reset failures on success

        // Track recent answers to avoid repetitions from Gemini
        recentAnswers.push(puzzle.answer.toLowerCase());
        if (recentAnswers.length > 10) {
          recentAnswers.shift();
        }
        // Track recent questions to avoid duplicate questions
        recentQuestions.push(puzzle.question.trim().toLowerCase());
        if (recentQuestions.length > 10) {
          recentQuestions.shift();
        }
      } else {
        // Discard invalid puzzle and increment consecutive failures
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
          cooldownUntil = Date.now() + 60000;
          consecutiveFailures = 0;
          puzzleQueue.push(getFallbackPuzzleWithTag(difficulty));
        }
      }
    } catch (err: any) {
      consecutiveFailures++;

      // Trigger cooldown after a failure
      // (either single network error, or 3 consecutive validation/api failures)
      // "The system MUST implement a request cooldown mechanism of 60 seconds following a Gemini API failure."
      cooldownUntil = Date.now() + 60000;
      consecutiveFailures = 0;

      puzzleQueue.push(getFallbackPuzzleWithTag(difficulty));
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
    puzzle = getFallbackPuzzleWithTag(difficulty);
  }

  // Trigger background prefetch (asynchronous, do not await)
  prefetchPuzzles(levelNumber).catch((err) => {
    console.error('[PuzzleManager] Background prefetch failed:', err);
  });

  return puzzle;
}

// ─── Daily Challenge (FR-008) ─────────────────────────────────────────────────

/**
 * Derives a deterministic date-based seed key from a YYYY-MM-DD string.
 * Used to pick a stable daily puzzle from the fallback pool.
 */
function dateSeedIndex(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Returns today's daily challenge puzzle.
 * - Uses a date-seeded fallback puzzle for offline-first reliability.
 * - Checks DailyChallengeState to determine if already completed.
 */
export async function getDailyChallengePuzzle(): Promise<{
  puzzle: GeneratedPuzzle;
  alreadyCompleted: boolean;
}> {
  // Import here to avoid circular dependency
  const { loadDailyChallenge } = await import('../utils/profileStorage');
  const { getTodayDateString } = await import('./profileManager');

  const today = getTodayDateString();
  const dailyState = await loadDailyChallenge();
  const alreadyCompleted = dailyState?.dateString === today && dailyState?.completed === true;

  // Select a stable "daily" puzzle from the easy fallback pool using date-based index
  const easyPuzzles = FALLBACK_PUZZLES.filter((p) => p.difficulty === 'easy');
  const idx = dateSeedIndex(today) % easyPuzzles.length;
  const puzzle: GeneratedPuzzle = {
    ...easyPuzzles[idx],
    question: easyPuzzles[idx].question,
  };

  return { puzzle, alreadyCompleted };
}
