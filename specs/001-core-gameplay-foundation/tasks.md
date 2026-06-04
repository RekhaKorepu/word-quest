# Tasks: Core Gameplay Foundation

**Input**: Design documents from `/specs/001-core-gameplay-foundation/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are requested/required for scoring, hint deductions, and progression validation per Principle VIII.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume single project structure at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [X] T001 Create project directories and subdirectories in `src/components/`, `src/data/`, `src/hooks/`, `src/utils/`, and `tests/` per implementation plan
- [X] T002 Verify that TypeScript and Vitest packages are configured and dependencies installed in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Implement static local puzzles dataset in `src/data/puzzles.ts` (contains 3 levels, each with exactly 3 puzzles containing question, answer, and 3 hints)
- [X] T004 [P] Implement normalized answer validation helper in `src/utils/validation.ts` (ignores casing, leading/trailing spaces, and duplicate internal spaces)
- [X] T005 Configure Vitest test environment runner config in `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin. ✅

---

## Phase 3: User Story 1 - Welcome Screen & Game Entry (Priority: P1) 🎯 MVP

**Goal**: Display an engaging welcome screen and start the game loop.

**Independent Test**: Verify WelcomeScreen rendering with "Start Game" on first load, "Resume Game"/"Start New Game" when saved progress exists, and click action to start.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Write unit test for validation helper in `tests/validation.test.ts`

### Implementation for User Story 1

- [X] T007 [US1] Create basic WelcomeScreen UI component in `src/components/WelcomeScreen.tsx`
- [X] T008 [US1] Configure WelcomeScreen as the entry screen in `App.tsx`

**Checkpoint**: Welcome Screen is functional and routes to the game. ✅

---

## Phase 4: User Story 2 - Core Puzzle Solving & Validation (Priority: P1)

**Goal**: Present puzzle questions, validate submissions, reduce attempts, and reveal failure correct answer.

**Independent Test**: Play a single puzzle, type correct/incorrect answers, check decrement of remaining attempts, and observe the failure answer reveal.

### Tests for User Story 2

- [X] T009 [P] [US2] Write unit test for core puzzle guessing state transitions (correct guess, incorrect guess, out of guesses) in `tests/useGameState.test.ts`

### Implementation for User Story 2

- [X] T010 [P] [US2] Implement state hook `useGameState.ts` in `src/hooks/useGameState.ts` (handling initial guessing logic, normalization, attempt decrementing, correct/incorrect action transitions)
- [X] T011 [US2] Create PuzzleScreen UI component in `src/components/PuzzleScreen.tsx`
- [X] T012 [US2] Integrate PuzzleScreen with state hook and wire basic screen rendering in `App.tsx`

**Checkpoint**: Main puzzle guessing screen and validation logic are fully functional. ✅

---

## Phase 5: User Story 3 - Hint Usage & Scoring (Priority: P2)

**Goal**: Sequentially request up to 3 hints per puzzle with progressive score deductions.

**Independent Test**: Click hints, verify they reveal one-by-one, check potential score deduction, and verify correct total score updates upon solving.

### Tests for User Story 3

- [X] T013 [P] [US3] Write unit test for hint reveal and score deduction logic (`100 - 15 * hints_used`) in `tests/useGameState.test.ts`

### Implementation for User Story 3

- [X] T014 [US3] Update state hook `useGameState.ts` in `src/hooks/useGameState.ts` to implement hint indices tracking and score deduction calculations
- [X] T015 [US3] Update PuzzleScreen UI component in `src/components/PuzzleScreen.tsx` to display available hints and trigger hint actions

**Checkpoint**: Hints can be revealed with correct score deductions applied upon correct solution. ✅

---

## Phase 6: User Story 4 - Puzzle & Level Progression (Priority: P1)

**Goal**: Handle level transitions, congratulations popups, level summaries, game completion screens, and AsyncStorage state persistence.

**Independent Test**: Play through all levels, check completion screens, close/reopen app to check session recovery, and restart from the game completion screen.

### Tests for User Story 4

- [X] T016 [P] [US4] Write unit test for level transition, game completion transition, state saving, and loading logic in `tests/useGameState.test.ts`

### Implementation for User Story 4

- [X] T017 [P] [US4] Implement congratulatory popup UI component in `src/components/CongratulatoryPopup.tsx`
- [X] T018 [P] [US4] Implement level completion summary UI component in `src/components/LevelCompletionScreen.tsx`
- [X] T019 [P] [US4] Implement game completion summary UI component in `src/components/GameCompletionScreen.tsx`
- [X] T020 [US4] Update state hook `useGameState.ts` in `src/hooks/useGameState.ts` to implement level/puzzle progression, game completion state, reset state logic, and AsyncStorage persistence
- [X] T021 [US4] Update WelcomeScreen UI component in `src/components/WelcomeScreen.tsx` to handle "Resume Game" (checks AsyncStorage) and "Start New Game" (resets state)
- [X] T022 [US4] Update components routing and UI wiring in `App.tsx` to support congratulations popup, level completion, game completion screen, and welcome screen state-based buttons

**Checkpoint**: End-to-end progression loop is fully functional and persisted offline. ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual improvements, complete flow verification, and testing.

- [X] T023 Add polished transitions and micro-animations to UI screens/popups in `src/components/` and `App.tsx`
- [X] T024 Perform final manual verification of the end-to-end user flows as documented in `quickstart.md`
- [X] T025 Run quickstart.md validation and verify that all Vitest unit tests pass successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1) is the MVP and is worked on first.
  - User Story 2 (P1) is needed for core guessing play.
  - User Story 3 (P2) adds hint/scoring mechanics.
  - User Story 4 (P1) links the levels and persists state.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Foundational tasks `T003` and `T004` can run in parallel.
- UI components `T017`, `T018`, and `T019` in User Story 4 can be built in parallel.
- Test tasks marked with `[P]` (e.g. `T006`, `T009`, `T013`, `T016`) can run in parallel with each other.

---

## Parallel Example: User Story 4

```bash
# Implement static components in parallel:
Task: "Implement congratulatory popup UI component in src/components/CongratulatoryPopup.tsx"
Task: "Implement level completion summary UI component in src/components/LevelCompletionScreen.tsx"
Task: "Implement game completion summary UI component in src/components/GameCompletionScreen.tsx"
```

---

## Implementation Strategy

### MVP First (Welcome + Guessing + Validation)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T003, T004)
3. Complete Phase 3: User Story 1 (Welcome screen setup)
4. Complete Phase 4: User Story 2 (State hook basic guessing + validation + PuzzleScreen rendering)
5. **STOP and VALIDATE**: Verify that the welcome screen opens, transitions to puzzle screen, and handles correct/incorrect validation.
