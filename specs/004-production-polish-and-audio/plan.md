# Implementation Plan: Production Polish and Audio

**Branch**: `feat/phase-04` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-production-polish-and-audio/spec.md`

## Summary
The goal of Phase 4 is to elevate the WordQuest application into a polished, public-release-ready mobile game. This will be achieved by:
1. **Audio Sound System**: Integrating a modular sound manager using `expo-av` to play brief, low-latency audio effects on button press, correct solve, incorrect guess, hint reveal, achievement toast, and level completion, with a settings toggle to mute/unmute.
2. **Offline AI Puzzle Cache**: Storing the prefetched Gemini AI puzzles locally in `AsyncStorage` so they remain available to play in offline mode, bypassing network errors and only falling back to predefined levels when the cache is completely empty.
3. **Performance & Optimization**: Implementing API call minimization, rendering optimization, and configuring proper splash screens and app icons in `app.json`.

## User Review Required

> [!IMPORTANT]
> - **New Dependency**: We will introduce the `expo-av` package to handle low-latency sound effects on mobile.
> - **Sound Assets**: We will bundle six lightweight sound assets (MP3 format) within the app bundle:
>   - `button_click.mp3` (General UI feedback)
>   - `puzzle_solve.mp3` (Correct answer celebration)
>   - `puzzle_fail.mp3` (Wrong answer feedback)
>   - `hint_reveal.mp3` (Hint revealed)
>   - `achievement.mp3` (Achievement unlocked toast)
>   - `level_complete.mp3` (Level cleared screen)
> - **Settings UI**: We will add a small speaker icon toggle on the Welcome Screen/Profile header to allow players to easily mute or unmute the audio effects.

## Technical Context

**Language/Version**: TypeScript / ES2022

**Primary Dependencies**: React Native, Expo, `expo-av`, React

**Storage**: Local storage via Expo `AsyncStorage`

**Testing**: Vitest (`npm test`)

**Target Platform**: Mobile (React Native / iOS & Android)

**Project Type**: Mobile Application (Expo)

**Performance Goals**:
- Audio latency: < 80ms from user trigger to sound start.
- App startup to interactive Welcome Screen transition: < 2 seconds.
- Rendering performance: Maintain >= 55 FPS during animations and toast transitions.

**Constraints**:
- Must be fully offline-capable, supporting up to 5 cached AI-generated puzzles stored locally.
- Must fail and fall back gracefully without blocking the UI if an audio asset fails to load or play.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle V (Reliable Offline Experience)**: **PASSED**. Storing prefetched AI puzzles in the local cache allows players to continue playing dynamic content even when offline.
- **Principle IX (Performance & Responsiveness)**: **PASSED**. Pre-loading audio assets asynchronously and catching network errors in the background ensures no UI stuttering or freezes.
- **Principle X (Delight Through Polish)**: **PASSED**. Sound effects and polished splash transitions satisfy the visual/auditory feedback guidelines.

## Project Structure

### Documentation (this feature)

```text
specs/004-production-polish-and-audio/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code

```text
src/
├── components/
│   ├── ProfileHeader.tsx
│   ├── PuzzleScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── StatsDashboard.tsx
│   ├── AchievementToast.tsx
│   └── LevelCompletionScreen.tsx
├── hooks/
│   ├── useGameState.ts
│   └── useProfileState.ts
├── services/
│   ├── audioManager.ts             # NEW: Playback controls, preloading, and mute states
│   └── puzzleManager.ts            # MODIFIED: Cache prefetched AI puzzles locally
└── utils/
    └── profileStorage.ts           # MODIFIED: Storage helpers for sound configuration & cached puzzles
```

**Structure Decision**: Standard React Native single project structure. Audio helper methods and cache management will be isolated in services to preserve Principle VII (Business logic separated from UI).

## Verification Plan

### Automated Tests
- Run `npm test` to verify no existing tests are broken.
- Add unit tests for `puzzleManager` offline loading logic and `audioManager` settings state.

### Manual Verification
- Launch the app and verify the splash screen shows cleanly.
- Verify sound effects play on each designated event (solved, button tap, hint, achievement toast, failure).
- Toggle the mute settings on/off and verify sound playback is enabled/disabled immediately.
- Turn off internet access on the device/simulator, launch the game, and verify cached AI puzzles can still be played successfully.
