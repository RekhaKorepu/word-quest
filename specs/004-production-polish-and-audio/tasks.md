# Tasks: Production Polish and Audio

**Input**: Design documents from `/specs/004-production-polish-and-audio/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `expo-av` audio playback dependency in `package.json`
- [x] T002 [P] Bundle lightweight audio MP3 assets under `assets/sounds/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage APIs that must be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement sound settings storage getters/seters in `src/utils/profileStorage.ts`
- [x] T004 Implement offline prefetch cache storage serialization/deserialization helpers in `src/utils/profileStorage.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Audio Feedback System (Priority: P1)

**Goal**: Play satisfying low-latency audio effects on button clicks, correctness, failure, hint reveals, achievements, and level completed, with a global mute state.

**Independent Test**: Enable sounds and perform interactive events (correct answers, hints, etc.) to verify sounds play. Toggle the mute state and verify absolute silence.

### Tests for User Story 1

- [x] T005 [P] [US1] Create unit tests for audio mute state persistence and playback settings in `tests/services/audio.test.ts`

### Implementation for User Story 1

- [x] T006 [US1] Create `src/services/audioManager.ts` to handle asset preloading, playback controls, and volume/mute settings
- [x] T007 [US1] Integrate general UI click sounds in `src/components/WelcomeScreen.tsx` and `src/components/PuzzleScreen.tsx`
- [x] T008 [US1] Integrate correctness/failure audio cues on guess submissions in `src/hooks/useGameState.ts` and `src/components/PuzzleScreen.tsx`
- [x] T009 [US1] Integrate hint reveal sound in `src/hooks/useGameState.ts` and level completion success theme in `src/components/LevelCompletionScreen.tsx`
- [x] T010 [US1] Integrate achievement unlock sound effect in `src/components/AchievementToast.tsx`
- [x] T011 [US1] Implement a mute/unmute toggle speaker control on the `src/components/WelcomeScreen.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Resilient Offline AI Puzzle Cache (Priority: P1)

**Goal**: Cache prefetched AI puzzles locally and serve them when the user is disconnected, keeping fallback levels as a secondary fallback.

**Independent Test**: Load the app online to prefetch puzzles, disconnect internet access, and verify the app serves the cached AI puzzles successfully.

### Tests for User Story 2

- [x] T012 [P] [US2] Create unit tests for offline cache preloading, queue retrieval, and network offline fallback in `tests/services/puzzleManagerOffline.test.ts`

### Implementation for User Story 2

- [x] T013 [US2] Update `src/services/puzzleManager.ts` to initialize the prefetch queue from local cache on startup and save the queue back to AsyncStorage on every successful prefetch
- [x] T014 [US2] Update prefetch fallback handlers in `src/services/puzzleManager.ts` to retrieve puzzles from the local offline cache first before loading static fallback puzzles

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Visual Polish & App Identity (Priority: P2)

**Goal**: Add custom app icons and configure a branded splash screen that transitions smoothly into the game.

**Independent Test**: Boot the app and verify the splash screen displays cleanly, then fades out to the Welcome Screen with no layout jitter.

### Implementation for User Story 3

- [x] T015 [US3] Add the splash configuration block to `app.json` pointing to `./assets/splash.png`
- [x] T016 [US3] Create and save a custom 1242x2436 pixel splash screen image at `assets/splash.png` using the image generation tool

**Checkpoint**: User Story 3 is fully functional and testable independently.

---

## Phase 6: User Story 4 - Graceful Error Handling & Optimization (Priority: P2)

**Goal**: Minimize redundant prefetch API calls and capture errors gracefully to prevent screen freezes or crashes.

**Independent Test**: Cause network errors or API timeouts during gameplay and verify the app warns the player via a non-blocking toast without crashing.

### Implementation for User Story 4

- [x] T017 [US4] Optimize queue checks in `src/services/puzzleManager.ts` to prevent duplicate prefetch calls when a fetch is already in progress
- [x] T018 [US4] Add a root-level Error Boundary wrapper in `App.tsx` to handle unexpected UI crashes gracefully and offer a soft reload option

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance checks, cleanup, and overall verification

- [x] T019 [P] Update documentation files and run quickstart validations
- [x] T020 Run entire test suite `npm test` and verify all 135+ tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion
- **User Stories (Phase 3+)**: All depend on Foundational (Phase 2) completion
- **Polish (Phase 7)**: Depends on all User Stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Phase 2
- **User Story 4 (P2)**: Can start after Phase 2

---

## Implementation Strategy

### MVP First
1. Complete Setup (Phase 1)
2. Complete Foundational (Phase 2)
3. Complete Phase 3: User Story 1 (Audio System)
4. Validate Story 1 manually
5. Proceed to subsequent phases
