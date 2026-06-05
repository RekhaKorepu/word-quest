# Implementation Plan: Player Engagement & Progression Systems

**Branch**: `feat/phase-03` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-engagement-and-progression/spec.md`

## Summary
The goal of this phase is to build long-term engagement and progression systems. We will introduce:
1. A persistent Player Profile system storing total score, levels completed, puzzles solved, rank titles, and XP.
2. An Achievements system tracking milestones (e.g. Pure Genius, Streak Master) and displaying toast notifications.
3. A Statistics Dashboard showing game metrics (success rate, average score, hints used).
4. A Daily Challenge & Streak mechanism offering double XP and streak counters.
5. A "Reveal Answer" feature on the puzzle screen that sets the current puzzle score to 0, shows the answer, disables input, and renders a "Next Puzzle" button.

## Technical Context

**Language/Version**: TypeScript / ES2022

**Primary Dependencies**: React Native, Expo, React (hooks: useState, useEffect, useCallback, useMemo)

**Storage**: Local storage via Expo AsyncStorage (using a modular `ProfileStorage` module under `src/utils/profileStorage.ts`)

**Testing**: Vitest (`npm test`)

**Target Platform**: Mobile (React Native / iOS & Android)

**Project Type**: Mobile Application (Expo)

**Performance Goals**:
- Navigating to statistics/profile dashboards takes < 100ms.
- Unlocking an achievement pops up notification in < 150ms of solver evaluation.
- Local profile updates are atomic and save asynchronously with zero frame rate drops.

**Constraints**:
- Must be fully offline-capable for static levels and local fallback challenges.
- Reveal Answer must not be available on Daily Challenges.
- Static Level 1 shuffler must select 3 random puzzles on start.

**Scale/Scope**:
- Offline local profile.
- 5 unique achievements tracked.
- Endless progression mode difficulty ratio: gradually scales from 20% to max 40% medium puzzles at level 15+.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **P1-A**: *No Hard puzzles allowed?* **PASSED**. Only easy and medium puzzles are permitted.
- **P1-B**: *Easy puzzles remain dominant?* **PASSED**. Medium puzzles scale up slowly to a maximum cap of 40% in Level 15+.
- **P4**: *Scoring deterministic and consistent?* **PASSED**. Points are 1:1 mapped to XP, and Reveal Answer explicitly awards 0 points.
- **P5**: *Reliable offline experience?* **PASSED**. The profile and stats are stored 100% locally via AsyncStorage. If Gemini is offline, the daily challenge falls back to local puzzles.
- **P7**: *Business logic separated from UI?* **PASSED**. All stats calculation, achievement evaluation, and XP logic will reside in pure helper services, completely separate from screen views.
- **P8**: *New features include corresponding tests?* **PASSED**. A full set of unit tests covering profile transitions, daily streak calculation, statistics compilation, and achievement unlocking will be added.

## Project Structure

### Documentation (this feature)

```text
specs/003-engagement-and-progression/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/          # React Native UI components
│   ├── StatsDashboard.tsx          # NEW: Stats dashboard modal/screen
│   ├── ProfileHeader.tsx           # NEW: XP, level, rank bar
│   ├── AchievementToast.tsx        # NEW: In-game toast notifications
│   ├── DailyChallengeModal.tsx     # NEW: Modal for daily challenge
│   └── RevealAnswerControl.tsx     # NEW: UI for Reveal Answer / Next puzzle
├── data/
│   ├── fallbackPuzzles.ts
│   └── puzzles.ts
├── hooks/
│   ├── useGameState.ts             # MODIFIED: Game state logic (integration of XP, Reveal Answer)
│   └── useProfileState.ts          # NEW: Profile hook for stats, level, achievements
├── services/
│   ├── achievementEvaluator.ts     # NEW: Logic to check and unlock achievements
│   ├── puzzleManager.ts            # MODIFIED: Endless level difficulty scaling up to 40%
│   └── profileManager.ts           # NEW: Overall profile, level boundaries, and streak logic
├── utils/
│   ├── config.ts
│   ├── storage.ts
│   ├── profileStorage.ts           # NEW: Profile storage interface
│   └── validation.ts
└── App.tsx              # MODIFIED: Screen routing & Daily Challenge integration

tests/
├── services/
│   ├── achievement.test.ts         # NEW: Unlocking rules
│   ├── profileManager.test.ts      # NEW: XP leveling, rank titles, streaks
│   └── puzzleManager.test.ts       # MODIFIED: Evolved difficulty ratio
├── hooks/
│   └── useProfileState.test.ts     # NEW: Profile hook and storage test
└── integration/
    └── revealAnswer.test.ts        # NEW: Solve flow blocking on Reveal Answer
```

**Structure Decision**: Single React Native (Expo) project layout structure. Business and state management logic are fully separated into `src/services` and `src/hooks` directories to comply with Principle VII (Maintainable Architecture).
