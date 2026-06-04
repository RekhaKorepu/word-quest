# Quickstart Guide: AI Puzzle Generation Engine

This guide details how to configure the environment, run the app, verify the AI generation service locally, and run the new integration/unit tests.

## Prerequisites & Configuration

1. **Gemini API Key**: Obtain a valid Google Gemini API key.
2. **Environment Variable**: Set up your environment variable in a `.env` file at the root of the project:
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: Expo automatically loads environment variables prefixed with `EXPO_PUBLIC_`.*

## Running the Application Locally
Start the Expo packager:
```bash
npx expo start
```
Use `i` for iOS simulator, `a` for Android simulator, or `w` to run on web.

## Verification & Error Handling Testing

### 1. Happy Path AI Generation
1. Launch the app and click "Start Game".
2. Play through Level 1.
3. Verify that the puzzles loaded for Level 2 are fresh and generated from the Gemini API (different from the default static set in Level 1).
4. Inspect terminal/metro logs to verify that background prefetching triggers immediately when the level starts.

### 2. Validation Failures
1. Observe metro logs to confirm that if a generated puzzle has formatting/content errors (e.g. invalid hints array or wrong question length), it is discarded and replaced.

### 3. Cooldown & Local Fallback Mode
1. Simulate a network disconnect or invalid API Key configuration (e.g. delete the key from the `.env` file).
2. Complete a level and proceed to the next.
3. Verify that the app transitions smoothly to fallback puzzles from the local repository (without crashing or freezing).
4. Verify that logs indicate the 60-second cooldown is active and bypassing Gemini API calls.

## Running Tests
Run the entire Vitest test suite (including validation, prefetching queue, and fallback tests):
```bash
npm run test
```
