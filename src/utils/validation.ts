/**
 * Normalizes and validates a player's answer against the correct answer.
 *
 * Validation is case-insensitive and trims leading/trailing whitespace
 * and collapses internal duplicate whitespace.
 *
 * @param guess - The player's submitted answer
 * @param correctAnswer - The correct answer for the puzzle
 * @returns true if the guess matches the correct answer, false otherwise
 */
export function isAnswerCorrect(guess: string, correctAnswer: string): boolean {
  return normalizeAnswer(guess) === normalizeAnswer(correctAnswer);
}

/**
 * Normalizes an answer string for comparison:
 * - Trims leading/trailing whitespace
 * - Collapses internal multiple spaces into a single space
 * - Converts to lowercase
 *
 * @param answer - The answer string to normalize
 * @returns normalized answer string
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Checks if a guess is empty or contains only whitespace.
 *
 * @param guess - The player's submitted answer
 * @returns true if the guess is empty or whitespace-only
 */
export function isEmptyGuess(guess: string): boolean {
  return guess.trim().length === 0;
}
