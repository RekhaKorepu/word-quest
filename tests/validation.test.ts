import { describe, it, expect } from 'vitest';
import { isAnswerCorrect, normalizeAnswer, isEmptyGuess } from '../src/utils/validation';

describe('normalizeAnswer', () => {
  it('converts to lowercase', () => {
    expect(normalizeAnswer('CLOCK')).toBe('clock');
    expect(normalizeAnswer('Clock')).toBe('clock');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeAnswer('  clock  ')).toBe('clock');
    expect(normalizeAnswer('\tclock\t')).toBe('clock');
  });

  it('collapses internal multiple spaces into a single space', () => {
    expect(normalizeAnswer('foot  steps')).toBe('foot steps');
    expect(normalizeAnswer('foot   steps')).toBe('foot steps');
  });

  it('handles mixed casing and whitespace together', () => {
    expect(normalizeAnswer('  FOOT  STEPS  ')).toBe('foot steps');
  });
});

describe('isAnswerCorrect', () => {
  it('returns true for exact match', () => {
    expect(isAnswerCorrect('clock', 'clock')).toBe(true);
  });

  it('returns true when guess differs in casing', () => {
    expect(isAnswerCorrect('CLOCK', 'clock')).toBe(true);
    expect(isAnswerCorrect('Clock', 'clock')).toBe(true);
  });

  it('returns true when guess has leading/trailing spaces', () => {
    expect(isAnswerCorrect('  clock  ', 'clock')).toBe(true);
  });

  it('returns true when guess has extra internal spaces', () => {
    expect(isAnswerCorrect('foot  steps', 'footsteps')).toBe(false); // different word
    expect(isAnswerCorrect('foot  steps', 'foot steps')).toBe(true);
  });

  it('returns false for incorrect answers', () => {
    expect(isAnswerCorrect('hammer', 'clock')).toBe(false);
    expect(isAnswerCorrect('', 'clock')).toBe(false);
  });

  it('handles combined casing and whitespace variations', () => {
    expect(isAnswerCorrect('  CLOCK  ', 'clock')).toBe(true);
    expect(isAnswerCorrect('  Clock  ', 'clock')).toBe(true);
  });
});

describe('isEmptyGuess', () => {
  it('returns true for empty string', () => {
    expect(isEmptyGuess('')).toBe(true);
  });

  it('returns true for whitespace-only string', () => {
    expect(isEmptyGuess('   ')).toBe(true);
    expect(isEmptyGuess('\t\n')).toBe(true);
  });

  it('returns false for non-empty guess', () => {
    expect(isEmptyGuess('clock')).toBe(false);
    expect(isEmptyGuess('  clock  ')).toBe(false);
  });
});
