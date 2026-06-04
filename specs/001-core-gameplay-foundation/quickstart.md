# Quickstart Guide: Core Gameplay Foundation

This guide explains how to run the application, perform manual verification, and run the automated tests for this feature.

## Prerequisites

Make sure you have Node.js installed (v18+ recommended) and the dependencies installed:
```bash
npm install
```

## Running the Application Locally

To start the Expo development server:
```bash
npx expo start
```
From here, you can:
- Press `a` to run on an Android emulator.
- Press `i` to run on an iOS simulator.
- Use the Expo Go app on your physical device to scan the QR code displayed in the terminal.

## Running Tests

To run the unit tests for scoring, hint usage, state transitions, and progression logic:
```bash
npm run test
```
The test runner is Vitest.

## Manual Verification Flow

To verify the gameplay loop manually:
1. **App Launch**: Launch the app. If it is the first launch, verify you see the **Welcome Screen** with the "Start Game" button.
2. **Start Game**: Click "Start Game". Verify transition to **Puzzle Screen** displaying Level 1, Puzzle 1 of 3, score 0, remaining attempts 5.
3. **Correct Answer**: Type the correct answer (case-insensitive, optional whitespace) and submit. Verify the congratulations popup displays, showing the points earned (100).
4. **Hint Deductions**: On the next puzzle, request all three hints. Submit the correct answer. Verify you receive exactly 55 points (100 - 3 * 15) and your total score updates.
5. **Failure Attempt**: On the third puzzle, enter incorrect guesses 5 times. Verify that the correct answer is revealed, no points are awarded, and you are prompted to proceed.
6. **Level Completion**: Proceed after the third puzzle. Verify the **Level Completion Screen** displays the level's stats (solved puzzles, score) and a button to proceed to the next level.
7. **Relaunch Session**: Close and reopen the app (or reload the bundle). Verify progress resumes exactly where it was.
8. **Game Completion**: Complete the final available level. Verify the **Game Completion Screen** displays overall stats, final score, the "Puzzle Master" message, and a button to restart.
9. **Reset Progress**: Go back to the Welcome Screen, trigger "Start New Game", and verify progress is reset to Level 1, Puzzle 1, score 0.
