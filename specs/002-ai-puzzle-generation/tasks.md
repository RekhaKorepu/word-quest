# Tasks: AI Puzzle Generation Engine

**Input**: Design documents from `/specs/002-ai-puzzle-generation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. In compliance with Principle VIII (Test-Driven Reliability), automated testing tasks are defined for each user story and must be written/verified before complete implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume a single project structure rooted at `src/` and `tests/` at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [x] T001 Configure environment configuration mapping for `EXPO_PUBLIC_GEMINI_API_KEY` in `src/utils/config.ts`
- [x] T002 Update `.env.example` at the root directory to include the `EXPO_PUBLIC_GEMINI_API_KEY` placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core static database that acts as a fallback for all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create local fallback database in `src/data/fallbackPuzzles.ts` containing at least 9 puzzles (split between easy and medium difficulties)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Endless Puzzle Play with AI-Generated Puzzles (Priority: P1) 🎯 MVP

**Goal**: Request structured JSON puzzles from Gemini API, validate them, and integrate them into the screen components.

**Independent Test**: Complete Level 1 and verify that Level 2 successfully fetches and renders newly generated puzzles from the Gemini API.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create unit tests in `tests/gemini.test.ts` to verify the API service (mocking fetch requests and checking response handling)
- [x] T005 [P] [US1] Create unit tests in `tests/validationRules.test.ts` to verify validation rule checks (answering formats, hints length, question string limits)

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement Gemini API fetch service in `src/services/gemini.ts` to request puzzles of a specific difficulty using `fetch` with `responseMimeType: "application/json"`
- [x] T007 [US1] Implement validation checker functions in `src/services/puzzleManager.ts` to check puzzle schema validity
- [x] T008 [US1] Modify `src/hooks/useGameState.ts` and `App.tsx` to dynamically query and display puzzles from the manager instead of indexing static `LEVELS` array

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Seamless Play via Prefetching and Caching (Priority: P2)

**Goal**: Keep a running queue cache of validated puzzles pre-generated in the background to ensure instant screen transitions.

**Independent Test**: Complete a level and verify that the next level's puzzles load instantly without any spinner/loading screens.

### Tests for User Story 2

- [x] T009 [P] [US2] Create unit tests in `tests/puzzleQueue.test.ts` to verify queue operations (enqueue, dequeue, and prefetching triggers when sizes fall below 3)

### Implementation for User Story 2

- [x] T010 [US2] Implement the in-memory prefetch queue state machine in `src/services/puzzleManager.ts`
- [x] T011 [US2] Integrate the prefetch manager with the level change mechanics in `src/hooks/useGameState.ts` to trigger background loading on level initialization

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Offline/Network Failure Resilience (Priority: P2)

**Goal**: Seamlessly fallback to local puzzles and trigger a 60-second cooldown period when the API call fails or times out.

**Independent Test**: Disconnect from the network, complete a level, and verify that the app transitions smoothly to a local fallback puzzle without crashing.

### Tests for User Story 3

- [x] T012 [P] [US3] Create unit/integration tests in `tests/fallbackHandling.test.ts` to verify cooldown timers and fallback triggers under simulated API error/timeout conditions

### Implementation for User Story 3

- [x] T013 [US3] Implement the 60-second cooldown state tracker and local fallback puzzle selection logic in `src/services/puzzleManager.ts` (using data from `src/data/fallbackPuzzles.ts`)

**Checkpoint**: User Stories 1, 2, and 3 should now be independently functional.

---

## Phase 6: User Story 4 - Gradual Difficulty Scaling (Priority: P3)

**Goal**: Restrict puzzle generation to "easy" on early levels, and gradually introduce "medium" puzzles at a controlled low percentage (e.g. 10%-20% chance) on higher levels.

**Independent Test**: Complete levels 1-2 (100% easy) and play levels 3+ to verify that "medium" puzzles appear at low rates, and "hard" puzzles are never loaded.

### Tests for User Story 4

- [x] T014 [P] [US4] Create unit tests in `tests/difficultyScaling.test.ts` to verify puzzle difficulty selection percentages at level milestones

### Implementation for User Story 4

- [x] T015 [US4] Implement difficulty selector logic (odds calculation) in `src/services/puzzleManager.ts` and pass the determined difficulty to the prefetching calls

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 Perform code cleanup, refactor imports, and ensure no console logging leaks key secrets
- [x] T017 Run all manual verification flows defined in `specs/002-ai-puzzle-generation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories proceed sequentially in priority order (P1 → P2 → P3).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P2)**: Integrates with US1. Prefetching builds on top of direct API calls.
- **User Story 3 (P3)**: Offline fallback handler operates on top of the prefetching queue.
- **User Story 4 (P4)**: Difficulty selection scales the API parameters defined in US1/US2.

### Within Each User Story

- Tests MUST be written and verified first.
- Services and data layers before UI integration.

### Parallel Opportunities

- Setup tasks (T001, T002) can run in parallel.
- Test files (T004, T005, T009, T012, T014) can be prepared in parallel.
- Service structures for T006 and validation rules in T007 can be worked on in parallel.

---

## Parallel Example: User Story 1

```bash
# Prepare both test files for User Story 1:
Task: "Create unit tests in tests/gemini.test.ts"
Task: "Create unit tests in tests/validationRules.test.ts"

# Implement independent services:
Task: "Implement Gemini API fetch service in src/services/gemini.ts"
Task: "Implement validation checker functions in src/services/puzzleManager.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (e.g. dynamic API loading works).

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3. Add User Story 2 → Test independently → Deploy/Demo.
4. Add User Story 3 → Test independently → Deploy/Demo.
5. Add User Story 4 → Test independently → Deploy/Demo.
