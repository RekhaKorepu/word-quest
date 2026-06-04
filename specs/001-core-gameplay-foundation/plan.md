# Implementation Plan: Core Gameplay Foundation

**Branch**: `feat/phase-01` | **Date**: 2026-06-04 | **Spec**: [spec.md](spec.md)

## Summary

The objective is to implement a complete and offline-playable word puzzle game using React Native (Expo) and TypeScript. The application features a Welcome Screen, an interactive Puzzle Screen with attempt limits and scoring, progressive hints, a Level Completion Screen, and a final Game Completion Screen. All state transitions, score calculations, and progression tracking will be handled deterministically by a custom `useGameState` React hook and persisted locally via AsyncStorage.

## Technical Context

**Language/Version**: TypeScript / Node.js v18+

**Primary Dependencies**: React Native, Expo, React, `@react-native-async-storage/async-storage`

**Storage**: AsyncStorage (for persisting session/player state)

**Testing**: Vitest (for scoring, hint, and progression logic unit tests)

**Target Platform**: iOS and Android (via Expo Go / portrait layout)

**Project Type**: Mobile Application (React Native / Expo)

**Performance Goals**: Screen transition and state update latency < 300ms

**Constraints**: Fully offline-playable, portrait orientation only, strict 3 hints per puzzle limit, 5 guesses max per puzzle

**Scale/Scope**: 3 levels, each containing exactly 3 puzzles (9 puzzles total in static local dataset)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Accessibility Gate (Principle I & III)**: Puzzles must remain easy/medium and accessible. No expert difficulty spikes are allowed.
   - *Status*: PASS (Predefined puzzles are hardcoded and verified beforehand).
2. **Quality Gate (Principle II)**: Every puzzle must contain exactly one answer and exactly three progressive hints.
   - *Status*: PASS (Enforced by strict TypeScript types for `Puzzle` and `Level`).
3. **Scoring Gate (Principle IV)**: Score calculations must be deterministic (100 base, -15 per hint) with no hidden penalties.
   - *Status*: PASS (Implemented in pure TypeScript functions and verified by unit tests).
4. **Offline Gate (Principle V)**: The game must be 100% functional without internet connection.
   - *Status*: PASS (Data is local, state is persisted locally via AsyncStorage).
5. **Mobile layout Gate (Principle VI)**: Portrait layout with accessible touch targets (>44x44 dp).
   - *Status*: PASS (Verified via styled container constraints and layout design).
6. **Architecture Gate (Principle VII & VIII)**: Business logic decoupled from components, state transitions tested with Vitest.
   - *Status*: PASS (State logic encapsulated in custom hook `useGameState.ts` and covered by Vitest tests).

## Project Structure

### Documentation

```text
specs/001-core-gameplay-foundation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions and rationales
├── data-model.md        # State structure, entities, and state transitions diagram
└── quickstart.md        # Running the app, tests, and manual verification steps
```

### Source Code

```text
src/
├── components/          # Reusable UI components
│   ├── CongratulatoryPopup.tsx
│   ├── GameCompletionScreen.tsx
│   ├── LevelCompletionScreen.tsx
│   ├── PuzzleScreen.tsx
│   └── WelcomeScreen.tsx
├── data/
│   └── puzzles.ts       # Predefined local puzzles data
├── hooks/
│   └── useGameState.ts  # Decoupled gameplay state hook
└── utils/
    └── validation.ts    # Normalized answer validation helper

tests/
├── useGameState.test.ts # State, scoring, progression unit tests
└── validation.test.ts   # Answer validation helper tests

App.tsx                  # Main router and entry point
```

**Structure Decision**: A single project structure is selected since the app is built entirely as a standalone offline client. Decoupling the hook state `useGameState` from the UI components allows unit tests to cover 100% of state transitions without rendering components.
