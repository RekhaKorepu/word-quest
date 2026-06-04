import { CONFIG } from '../utils/config';
import { GeneratedPuzzle } from '../data/fallbackPuzzles';

export async function generateGeminiPuzzle(difficulty: 'easy' | 'medium'): Promise<GeneratedPuzzle> {
  const apiKey = CONFIG.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `Generate a single casual word puzzle for a mobile game. The puzzle MUST consist of:
1. A question (a fun, easy-to-understand riddle or brain teaser).
2. An answer (a single, simple word, in English, containing only alphabetic characters).
3. Exactly three helpful progressive hints.
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
        },
      }),
    }
  );
  console.log("response", response);

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
