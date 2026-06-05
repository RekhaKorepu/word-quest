# Feature Specification: Player Engagement & Progression Systems

**Feature Branch**: `feat/phase-03`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "The objective of Phase 3 is to introduce long-term engagement systems..."

## Clarifications

### Session 2026-06-05
- Q: Player Profile Persistence on New Game → A: Option A (Persistent Profile - overall XP, Level, Rank, and achievements are preserved; only active level progress resets).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Profile & Experience System (Priority: P1)

As a player, I want to see my total score, completed levels, and experience level progress so that I feel motivated by my accomplishments and rank advancement.

**Why this priority**: Core progression foundation. All gameplay loops feed into XP and profiles.

**Independent Test**: Can be fully tested by verifying that solving a puzzle increases the player's XP, and accumulating enough XP advances their level and rank in the local profile state.

**Acceptance Scenarios**:

1. **Given** I am a new player starting Level 1, **When** I successfully solve a puzzle, **Then** my profile gains XP equal to the score earned (e.g., +100 XP), and my profile's total score is updated.
2. **Given** I have 950 XP and my level is 2, **When** I earn 60 points from a puzzle (bringing my total to 1010 XP), **Then** my player level increases to 3, and I see a rank title update (e.g., advancing from "Novice" to "Apprentice").

---

### User Story 2 - Reveal Answer Feature (Priority: P1)

As a player stuck on a difficult puzzle, I want to reveal the correct answer directly so that I can bypass it and continue playing, even if it means sacrificing my score for that puzzle.

**Why this priority**: Critical UI/gameplay requirement to prevent players from getting permanently blocked.

**Independent Test**: Can be tested on the puzzle screen by clicking the "Reveal Answer" button, verifying the text input is disabled, score is set to 0, and the correct answer is displayed with a "Next Puzzle" button.

**Acceptance Scenarios**:

1. **Given** I am playing a puzzle, **When** I click the "Reveal Answer" button, **Then** the answer text input and submit buttons are disabled, my points for this puzzle are set to 0, the correct answer is displayed on the screen, and a "Next Puzzle" button is rendered.
2. **Given** I revealed the answer for the current puzzle, **When** I click the "Next Puzzle" button, **Then** I am advanced to the next puzzle in the level.

---

### User Story 3 - Achievements & Notifications (Priority: P2)

As a player, I want to earn badges/achievements for reaching specific milestones (like solving my first puzzle or completing a level with zero hints) so that I receive positive reinforcement.

**Why this priority**: Boosts engagement by giving players secondary goals.

**Independent Test**: Can be tested by solving a puzzle without using any hints and verifying that the "Pure Genius" achievement is unlocked and displays an in-game notification.

**Acceptance Scenarios**:

1. **Given** I have never solved a puzzle, **When** I successfully solve my first puzzle, **Then** the "First Steps" achievement is unlocked, and a congratulatory notification modal or toast is displayed.
2. **Given** I start a new level, **When** I complete all 3 puzzles in that level without clicking "Reveal Hint", **Then** the "Pure Genius" achievement is unlocked at the level completion screen.

---

### User Story 4 - Statistics Dashboard (Priority: P2)

As a player, I want to view detailed stats of my gameplay history (like average score, success rate, and hints used) so that I can track my overall improvement.

**Why this priority**: Helps competitive and reflective players review their performance.

**Independent Test**: Can be tested by navigating to the statistics page from the Welcome Screen and seeing the historical metrics calculated correctly.

**Acceptance Scenarios**:

1. **Given** I have completed 2 levels and solved 5 puzzles using 3 hints total, **When** I open the statistics dashboard, **Then** I see: Puzzles Solved: 5, Average Score: 85 (e.g., if total score is 425), Hints Used: 3, Success Rate: 100%.

---

### User Story 5 - Daily Challenges & Streaks (Priority: P3)

As a player, I want to play a unique daily challenge puzzle every day to earn extra rewards and maintain a consecutive daily play streak.

**Why this priority**: Primary driver for daily retention.

**Independent Test**: Can be tested by opening the Daily Challenge screen, completing the designated daily puzzle, verifying the double XP reward is awarded, and the streak counter increments by 1.

**Acceptance Scenarios**:

1. **Given** a new day has started, **When** I launch the app and navigate to "Daily Challenge", **Then** the system loads a unique puzzle generated for today, and offers double XP rewards upon completion.
2. **Given** I completed yesterday's challenge, **When** I complete today's challenge, **Then** my daily streak counter increments from 1 to 2.

### Edge Cases

- **Date Changes / Timezone Shifts**: How does the system handle a player changing their device clock to cheat on the daily streak?
  - *Mitigation*: The app uses ISO-date checks (`YYYY-MM-DD`) based on the local system time. Consecutive days must be exactly 1 day apart. If a date is skipped or is in the future, the streak resets or ignores the future date.
- **Multiple Achievements Unlocked Simultaneously**: What happens if a player triggers both "High Scorer" and "Streak Master" in the same turn?
  - *Mitigation*: Achievement notifications are queued and displayed sequentially to avoid overlapping modals.
- **Saving / Restoring Complex Stats**: How does the system prevent profile corruption if local storage fails?
  - *Mitigation*: The profile and stats state is auto-saved locally in AsyncStorage under a robust schema, with default fallback values (0 score, level 1, empty achievements) if loading fails.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Profile Management**: The system MUST store and maintain a local player profile containing total score, levels completed, puzzles solved, guesses submitted, hints used, and rank titles. The player profile and achievements MUST persist permanently across game sessions; starting a new game session MUST only reset the active level index, puzzle index, and active level score, leaving total XP, levels completed, rank, and unlocked achievements intact.
- **FR-002**: **XP Progression**: Every point earned from solving a puzzle MUST contribute 1:1 to Player XP. Leveling up occurs every 500 XP (Level = `Math.floor(XP / 500) + 1`).
- **FR-003**: **Rank Titles**: The profile MUST display player ranks based on level:
  - Level 1-4: "Novice"
  - Level 5-9: "Apprentice"
  - Level 10-14: "Journeyman"
  - Level 15-19: "Expert"
  - Level 20+: "Grandmaster"
- **FR-004**: **Achievements System**: The system MUST define and track the following achievements:
  - *First Steps*: Solved 1st puzzle.
  - *Pure Genius*: Completed a level with 0 hints.
  - *High Scorer*: Reached 300 points in a single level.
  - *Streak Master*: Solved 5 puzzles in a row without failing.
  - *Dedicated Solver*: Solved 30 total puzzles.
- **FR-005**: **In-Game Notifications**: Unlocking an achievement MUST trigger an immediate, non-intrusive pop-up notification/toast.
- **FR-006**: **Statistics Dashboard**: The app MUST present a statistics screen showing: Total Puzzles Solved, Hints Used, Average Score, Best Level Score, and Success Rate (puzzles solved divided by total puzzles attempted).
- **FR-007**: **Reveal Answer**: A "Reveal Answer" button MUST be placed adjacent to the "Reveal Hint" button. Clicking it MUST:
  - Disable further guesses or input.
  - Set the current puzzle score to 0.
  - Show the correct answer.
  - Render a "Next Puzzle" button to advance.
- **FR-008**: **Daily Challenge**: The system MUST serve a unique daily challenge puzzle once per day. It MUST offer double XP (2x standard score) and increment the daily streak counter.
- **FR-009**: **Daily Streak**: If the player completes the Daily Challenge on consecutive calendar days, the streak counter MUST increment. If a day is missed, the streak resets to 0.
- **FR-010**: **Evolved Difficulty**: In endless mode (levels 5+), the ratio of medium puzzles generated MUST increase gradually, scaling up to a maximum of 40% medium puzzles at level 15+ (remaining 60% easy).

### Key Entities

- **PlayerProfile**: Represents the user's progress. Attributes: `totalScore`, `xp`, `level`, `rank`, `streak`, `lastActiveDate`.
- **Achievement**: Represents milestones. Attributes: `id`, `name`, `description`, `unlockedAt`.
- **GameStats**: Tracks detailed history. Attributes: `puzzlesAttempted`, `puzzlesSolved`, `hintsUsed`, `bestLevelScore`.
- **DailyChallengeState**: Tracks completion of the daily puzzle. Attributes: `dateString` (YYYY-MM-DD), `completed`, `puzzleId`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Navigation to the Statistics Dashboard and Profile screen loads in under 100ms.
- **SC-002**: Unlocking an achievement triggers its notification toast within 150ms of guess evaluation.
- **SC-003**: Reveal Answer action immediately updates the screen state and renders the "Next Puzzle" control with zero visible lag.
- **SC-004**: Storing, updating, and restoring player profiles remains 100% stable locally, surviving app restarts and crashes.

## Assumptions

- We assume player profiles and statistics will be stored entirely locally on the device via `AsyncStorage` (no external database server is required in this phase).
- We assume the daily challenge puzzle can be generated using a date-based seed or fetched once daily, defaulting to a specific fallback puzzle if the device has no internet access.
- We assume that "Reveal Answer" is not available on the Daily Challenge to maintain competitive integrity of daily streaks.
