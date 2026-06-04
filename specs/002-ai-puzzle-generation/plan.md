# Implementation Plan: AI Puzzle Generation Engine

**Branch**: `feat/phase-02` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-ai-puzzle-generation/spec.md`

## Summary
Replace the static puzzle repository with dynamically generated puzzles using the Gemini API. We will build a dedicated Gemini API service, a validation/schema checking layer, an in-memory prefetch queue, a 60-second cooldown recovery mechanism for offline/error handling, and integrate these into the existing `useGameState` hook.

## Technical Context

**Language/Version**: TypeScript / React Native (Expo SDK 56)

**Primary Dependencies**: `react-native-safe-area-context`, `@react-native-async-storage/async-storage`

**Storage**: In-memory cache for prefetch queue, localStorage / AsyncStorage for persistent game stats.

**Testing**: Vitest

**Target Platform**: Mobile (iOS / Android) and Web (Expo Web)

**Project Type**: Mobile App

**Performance Goals**: <100ms transition time between puzzles when using the prefetch cache.

**Constraints**: API key configuration via `EXPO_PUBLIC_GEMINI_API_KEY`, 60-second error cooldown, offline reliability.

**Scale/Scope**: Infinite levels.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Player Experience First)**: Puzzles must remain easy-to-solve riddles/clues.
- **Principle II (Quality Over Quantity)**: Validates exactly 3 hints, valid answer format, and question length. Local fallback repository ensures that gameplay is not interrupted.
- **Principle III (Progressive Difficulty)**: Controls distribution of Easy (100% on Level 1-2, 90% on Level 3-4, 80% on Level 5+) vs Medium puzzles. Restricts Hard puzzles.
- **Principle V (Reliable Offline Experience)**: Implements 60-second API cooldown and local fallback.
- **Principle VII (Maintainable Architecture)**: Separates Gemini API and caching/prefetching logic into independent services (`src/services/gemini.ts` and `src/services/puzzleManager.ts`) outside the React component tree.

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-puzzle-generation/
├── plan.md              # This file
├── research.md          # Research options and decisions
├── data-model.md        # Entities and states definitions
├── quickstart.md        # Environment setup and verification guide
└── contracts/
    └── gemini-api.json  # Gemini API response schema contract
```

### Source Code Layout

```text
src/
├── components/          # UI Components
├── data/
│   ├── puzzles.ts       # Type definitions for levels/puzzles
│   └── fallbackPuzzles.ts # [NEW] Local fallback static puzzle database
├── hooks/
│   └── useGameState.ts  # [MODIFY] State engine hook updated to fetch puzzles
├── services/
│   ├── gemini.ts        # [NEW] Gemini API fetch service
│   └── puzzleManager.ts # [NEW] Caching, prefetching, and cooldown manager
└── utils/
    ├── storage.ts       # Storage utility
    └── validation.ts    # Answer normalization utility
```

**Structure Decision**: Single-project structure. All service files live under `src/services/` and fallback data under `src/data/` to keep clean modularity.

## Proposed Changes

### [Services]

#### [NEW] [gemini.ts](file:///Users/rekhakorepu/Documents/spec-kit/WordQuest/src/services/gemini.ts)
Responsible for calling the Gemini API with structured JSON output and fetching a puzzle matching the requested difficulty.
- Reads `process.env.EXPO_PUBLIC_GEMINI_API_KEY`.
- Uses `fetch` to request `gemini-1.5-flash` model.
- Validates structural schema.

#### [NEW] [puzzleManager.ts](file:///Users/rekhakorepu/Documents/spec-kit/WordQuest/src/services/puzzleManager.ts)
Handles queue management (size limit of 3), triggering background prefetching, validation rules (character lengths, hints count, profanity check), tracking the 60-second cooldown timer, and switching to [fallbackPuzzles.ts](file:///Users/rekhakorepu/Documents/spec-kit/WordQuest/src/data/fallbackPuzzles.ts).

### [Data & Hooks]

#### [NEW] [fallbackPuzzles.ts](file:///Users/rekhakorepu/Documents/spec-kit/WordQuest/src/data/fallbackPuzzles.ts)
Contains static fallback puzzles for easy and medium difficulties (at least 9 total).

#### [MODIFY] [useGameState.ts](file:///Users/rekhakorepu/Documents/spec-kit/WordQuest/src/hooks/useGameState.ts)
Modify state machine and initialization to call `puzzleManager` for loading next puzzles instead of indexing directly into a static `LEVELS` array.

## Verification Plan

### Automated Tests
- Create unit tests for validation rules (hints length, correct formatting).
- Create unit tests for prefetch queue caching behavior.
- Create unit tests for fallback repository triggering on simulated API exceptions.
- Command: `npm test`

### Manual Verification
- Follow the instructions in [quickstart.md](./quickstart.md) to check:
  - Happy path AI generation.
  - Rate-limit error handling and cooldowns.
  - Offline local fallback transitions.
