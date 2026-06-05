# Tasks: Player Engagement & Progression Systems

**Input**: Design documents from `/specs/003-engagement-and-progression/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize profile storage module in src/utils/profileStorage.ts
- [X] T002 Configure mock storage tests in tests/__mocks__/async-storage.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Implement player profile manager services in src/services/profileManager.ts
- [X] T004 Implement profile hook wrapper in src/hooks/useProfileState.ts
- [X] T005 [P] Update endless mode level difficulty ratios to scale medium puzzles in src/services/puzzleManager.ts
- [X] T006 Add unit tests for endless mode scaling in tests/services/puzzleManager.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Player Profile & Experience System (Priority: P1) 🎯 MVP

**Goal**: Track total score, XP, completed levels, and ranks in a persistent profile.

**Independent Test**: Solving a puzzle increases the player's XP, and accumulating enough XP advances their level and rank in the local profile state.

### Tests for User Story 1
- [X] T007 [P] [US1] Create unit tests for XP leveling and rank titles in tests/services/profileManager.test.ts
- [X] T008 [US1] Implement experience points leveling up and rank title progression in src/services/profileManager.ts

### Implementation for User Story 1
- [X] T009 [US1] Integrate profile manager into hooks in src/hooks/useProfileState.ts
- [X] T010 [US1] Add profile header UI component in src/components/ProfileHeader.tsx
- [X] T011 [US1] Integrate ProfileHeader component into main screens in App.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Reveal Answer Feature (Priority: P1)

**Goal**: Add "Reveal Answer" option that sets score to 0, shows answer, disables input, and shows "Next Puzzle" button.

**Independent Test**: Click "Reveal Answer" on the puzzle screen, verify input/submit is disabled, score is 0, answer is shown, and "Next Puzzle" button advances to the next puzzle.

### Tests for User Story 2
- [X] T012 [P] [US2] Create integration tests for Reveal Answer flow in tests/integration/revealAnswer.test.ts

### Implementation for User Story 2
- [X] T013 [US2] Add reveal answer state handling in src/hooks/useGameState.ts
- [X] T014 [US2] Create RevealAnswerControl UI component in src/components/RevealAnswerControl.tsx
- [X] T015 [US2] Integrate RevealAnswerControl component into puzzle display in src/components/PuzzleScreen.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Achievements & Notifications (Priority: P2)

**Goal**: Track milestones (First Steps, Pure Genius, High Scorer, Streak Master, Dedicated Solver) and display non-intrusive toast notifications.

**Independent Test**: Solve a puzzle without hints and verify that the "Pure Genius" achievement is unlocked and displays an in-game notification.

### Tests for User Story 3
- [X] T016 [P] [US3] Create unit tests for achievement evaluation rules in tests/services/achievement.test.ts

### Implementation for User Story 3
- [X] T017 [US3] Implement achievement evaluator service in src/services/achievementEvaluator.ts
- [X] T018 [US3] Create AchievementToast UI component in src/components/AchievementToast.tsx
- [X] T019 [US3] Integrate achievement check and notifications in src/hooks/useProfileState.ts
- [X] T020 [US3] Render AchievementToast overlay in App.tsx

**Checkpoint**: At this point, User Stories 1, 2, and 3 should all work independently

---

## Phase 6: User Story 4 - Statistics Dashboard (Priority: P2)

**Goal**: Store and display stats dashboard (Puzzles Solved, Hints Used, Average Score, Best Level Score, Success Rate).

**Independent Test**: Open statistics dashboard from Welcome Screen and verify historical metrics calculated correctly.

### Tests for User Story 4
- [X] T021 [P] [US4] Create unit tests for game statistics aggregation in tests/hooks/useProfileState.test.ts

### Implementation for User Story 4
- [X] T022 [US4] Implement GameStats tracking helpers in src/services/profileManager.ts
- [X] T023 [US4] Create StatsDashboard modal/screen in src/components/StatsDashboard.tsx
- [X] T024 [US4] Add Stats button on WelcomeScreen and wire up dashboard display in App.tsx

**Checkpoint**: At this point, User Stories 1 to 4 should all work independently

---

## Phase 7: User Story 5 - Daily Challenges & Streaks (Priority: P3)

**Goal**: Unique Daily Challenge, double XP, and daily streak validation logic.

**Independent Test**: Open Daily Challenge screen, complete daily puzzle, verify 2x XP is awarded, and streak counter increments.

### Tests for User Story 5
- [X] T025 [P] [US5] Create unit tests for consecutive ISO date streak logic in tests/services/profileManager.test.ts

### Implementation for User Story 5
- [X] T026 [US5] Implement Daily Streak calculation and lastActiveDate tracking in src/services/profileManager.ts
- [X] T027 [US5] Create DailyChallengeModal UI component in src/components/DailyChallengeModal.tsx
- [X] T028 [US5] Implement Gemini daily puzzle generation or local fallback daily challenge loader in src/services/puzzleManager.ts
- [X] T029 [US5] Wire Daily Challenge access from Welcome Screen and update streaks on completion in App.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T030 Perform code cleanup and refactor shared hooks for profile storage optimization
- [X] T031 Verify all manual play-test guides defined in specs/003-engagement-and-progression/quickstart.md
- [X] T032 [P] Verify all Vitest unit and integration tests run successfully with zero warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models/tests for User Story 1 together:
Task: "Create unit tests for XP leveling and rank titles in tests/services/profileManager.test.ts"
Task: "Implement experience points leveling up and rank title progression in src/services/profileManager.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
