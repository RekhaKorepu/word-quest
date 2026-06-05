import { CONFIG } from '../utils/config';
import { GeneratedPuzzle } from '../data/fallbackPuzzles';

const THEMES = [
  'Animals & Wildlife',
  'Food & Culinary',
  'Science & Technology',
  'Geography & Landmarks',
  'Nature & Seasons',
  'Everyday Household Objects',
  'Sports & Activities',
  'Music & Art',
  'Space & Planets',
  'Historical events or figures',
  'Transportation & Vehicles',
  'Occupations & Jobs',
  'Hobbies & Entertainment',
  'Literature & Fairy Tales',
  'Weather & Natural phenomena',
  'Clothing & Fashion',
  'School & Office supplies',
  'Tools & Construction',
  'Gardening & Plants',
  'Ocean & Sea life'
];

export async function generateGeminiPuzzle(
  difficulty: 'easy' | 'medium',
  avoidAnswers: string[] = [],
  avoidQuestions: string[] = [],
): Promise<GeneratedPuzzle> {
  const apiKey = CONFIG.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const avoidClause = avoidAnswers.length > 0
    ? `\nThe answer MUST NOT be any of the following words: ${avoidAnswers.join(', ')}.`
    : '';
  const avoidQuestionClause = avoidQuestions.length > 0
    ? `\nThe question MUST NOT be any of the following: ${avoidQuestions.join(', ')}.`
    : '';

  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  const prompt = `Generate a single unique, creative, and casual word puzzle for a mobile game.
The puzzle's theme or subject MUST be related to: "${randomTheme}".
Avoid common, cliché riddles (e.g. do not make a riddle about a "clock", "towel", "fire", "echo", or "coin"). Be extremely creative and think of a novel riddle.

CRITICAL INSTRUCTIONS:
- The question MUST be written as a fun, engaging, and classic riddle (e.g., using "I have...", "I am...", "What am I?").
- The riddle MUST be very EASY, simple, and straightforward to guess for a casual player. Do not make it obscure, convoluted, or too difficult.
- The answer MUST be a very common, simple, and standard English word (e.g., "dog", "apple", "sun", "book", "rain", etc.) representing a familiar object, animal, or concept related to the theme.
- The difficulty of the puzzle should be: ${difficulty}. (For 'easy', make it extremely simple, e.g. for children or quick plays. For 'medium', it can be a slightly cleverer riddle but still highly obvious once read).

The puzzle MUST consist of:
1. A question (the riddle or brain teaser).${avoidQuestionClause}
2. An answer (a single, simple word, in English, containing only alphabetic characters).${avoidClause}
3. Exactly three helpful progressive hints (starting broad and ending very specific).
4. A difficulty level: either 'easy' or 'medium' (based on the requested difficulty: ${difficulty}).

You must respond in valid JSON matching this schema:
{
  "question": "string",
  "answer": "string",
  "hints": ["string", "string", "string"],
  "difficulty": "easy" | "medium"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 1.2,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API request failed: ${response.status} ${response.statusText || ''}`.trim());
  }

  const data = await response.json();

  try {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Invalid response structure from Gemini API: missing parts text');
    }

    const parsed = JSON.parse(text) as GeneratedPuzzle;

    // Perform simple validation here so it matches the test expectations for throwing when the JSON schema is invalid
    if (!parsed.question || !parsed.answer || !Array.isArray(parsed.hints) || parsed.hints.length !== 3) {
      throw new Error('Invalid puzzle schema returned from Gemini');
    }

    return parsed;
  } catch (err: any) {
    throw new Error(`Failed to parse Gemini puzzle response: ${err.message}`);
  }
}
