import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateGeminiPuzzle } from '../src/services/gemini';

describe('generateGeminiPuzzle', () => {
  beforeEach(() => {
    vi.stubEnv('EXPO_PUBLIC_GEMINI_API_KEY', 'test-api-key');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('successfully fetches and returns a parsed puzzle', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  question: 'What has a face but no eyes, hands but no arms?',
                  answer: 'clock',
                  hints: [
                    'It tells time.',
                    'It has numbers.',
                    'It has hands.',
                  ],
                  difficulty: 'easy',
                }),
              },
            ],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const puzzle = await generateGeminiPuzzle('easy');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=test-api-key'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('easy'),
      })
    );

    expect(puzzle).toEqual({
      question: 'What has a face but no eyes, hands but no arms?',
      answer: 'clock',
      hints: ['It tells time.', 'It has numbers.', 'It has hands.'],
      difficulty: 'easy',
    });
  });

  it('throws an error if API response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as Response);

    await expect(generateGeminiPuzzle('easy')).rejects.toThrow('Gemini API request failed: 429 Too Many Requests');
  });

  it('throws an error if response JSON does not match expected structure', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  // missing question, invalid schema
                  answer: 'clock',
                }),
              },
            ],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await expect(generateGeminiPuzzle('easy')).rejects.toThrow();
  });
});
