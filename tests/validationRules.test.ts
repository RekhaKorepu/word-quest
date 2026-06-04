import { describe, it, expect } from 'vitest';
import { validatePuzzle } from '../src/services/puzzleManager';
import { GeneratedPuzzle } from '../src/data/fallbackPuzzles';

describe('validatePuzzle', () => {
  const validPuzzle: GeneratedPuzzle = {
    question: 'I have a face but no eyes, hands but no arms. What am I?',
    answer: 'clock',
    hints: [
      'It tells the time.',
      'It has numbers 1-12.',
      'You wear it or hang it.',
    ],
    difficulty: 'easy',
  };

  it('passes a fully valid puzzle', () => {
    expect(validatePuzzle(validPuzzle)).toBe(true);
  });

  it('rejects a question that is too short (< 15 characters)', () => {
    const puzzle = { ...validPuzzle, question: 'Short question' };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects a question that is too long (> 200 characters)', () => {
    const puzzle = { ...validPuzzle, question: 'A'.repeat(201) };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects answers containing non-alphabetic characters', () => {
    const puzzle = { ...validPuzzle, answer: 'clock123' };
    expect(validatePuzzle(puzzle)).toBe(false);

    const puzzle2 = { ...validPuzzle, answer: 'clock-face' };
    expect(validatePuzzle(puzzle2)).toBe(false);

    const puzzle3 = { ...validPuzzle, answer: 'clock face' };
    expect(validatePuzzle(puzzle3)).toBe(false);
  });

  it('rejects answers that are empty', () => {
    const puzzle = { ...validPuzzle, answer: '' };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects if hints array does not contain exactly 3 items', () => {
    const puzzle = { ...validPuzzle, hints: ['Only one hint'] as any };
    expect(validatePuzzle(puzzle)).toBe(false);

    const puzzle2 = { ...validPuzzle, hints: ['H1', 'H2', 'H3', 'H4'] as any };
    expect(validatePuzzle(puzzle2)).toBe(false);
  });

  it('rejects if hints are not distinct', () => {
    const puzzle = { ...validPuzzle, hints: ['Same hint', 'Same hint', 'Diff hint'] as any };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects if any hint is empty or whitespace-only', () => {
    const puzzle = { ...validPuzzle, hints: ['H1', '', 'H3'] as any };
    expect(validatePuzzle(puzzle)).toBe(false);

    const puzzle2 = { ...validPuzzle, hints: ['H1', '   ', 'H3'] as any };
    expect(validatePuzzle(puzzle2)).toBe(false);
  });

  it('rejects invalid difficulty values', () => {
    const puzzle = { ...validPuzzle, difficulty: 'hard' as any };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects puzzles with inappropriate terms in question or answer', () => {
    const puzzle = { ...validPuzzle, answer: 'badword' }; // we'll define a basic list of terms
    expect(validatePuzzle(puzzle)).toBe(false);

    const puzzle2 = { ...validPuzzle, question: 'This question has a badword in it.' };
    expect(validatePuzzle(puzzle2)).toBe(false);
  });
});
