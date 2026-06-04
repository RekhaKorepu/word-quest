# Feature Specification: Core Gameplay Foundation

**Feature Branch**: `feat/phase-01`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "The objective of Phase 1 is to build a complete and playable word puzzle game without any AI integration. This phase focuses entirely on creating the gameplay experience and validating that the game is fun and intuitive. When the application launches, the player should see a visually appealing welcome screen with attractive animations, engaging text, decorative puzzle-themed elements, and a Start Game button positioned approximately 25% above the bottom of the screen. The screen should immediately communicate that this is a fun and brain-engaging puzzle game.

When the player presses the Start Game button, they should be taken to the puzzle screen where puzzles are presented one at a time. For this phase, all puzzles should be stored locally in the application using predefined puzzle data. Each level should contain exactly three puzzles. The puzzle screen should display the current level number, puzzle number, current score, remaining guesses, and the puzzle question itself.

The player should be able to enter an answer and submit it. Answer validation should be user-friendly by ignoring capitalization differences and unnecessary spaces. Each puzzle should provide a maximum of five guessing attempts. Every incorrect guess should reduce the remaining attempt count. If all five attempts are exhausted, the puzzle should be marked as failed and the correct answer should be revealed before moving on.

Each puzzle should include three progressively useful hints. The player may choose to use any hint when needed. Every hint used should reduce the score earned for that puzzle by fifteen points. A correctly solved puzzle should award a maximum of one hundred points, with deductions applied only for hints that were used.

When a player successfully solves a puzzle, a congratulatory popup should appear, informing them of their success and asking whether they are ready to proceed to the next puzzle. After completing all three puzzles within a level, a level completion screen should appear showing the player's performance and providing an option to move to the next level.

The main goal of this phase is to establish the entire gameplay loop, including puzzle solving, hints, scoring, guesses, puzzle progression, and level progression. By the end of this phase, the game should be fully playable from start to finish without relying on any external services."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Welcome Screen & Game Entry (Priority: P1)

As a new or returning player, I want to see an engaging and visually appealing welcome screen when I launch the application, so that I immediately understand it is a fun, brain-engaging puzzle game and can easily start playing.

**Why this priority**: Crucial for first impressions, user retention, and providing the entry point to the core gameplay loop.

**Independent Test**: Can be verified by launching the app, observing the visual elements and layout, clicking the "Start Game" button, and confirming transition to the puzzle screen.

**Acceptance Scenarios**:

1. **Given** the application has launched, **When** the welcome screen is displayed, **Then** I see the game title, decorative puzzle elements, introductory text, and a "Start Game" button positioned roughly 25% from the bottom of the screen.
2. **Given** I am on the welcome screen, **When** I press the "Start Game" button, **Then** I am immediately taken to the active puzzle screen.

---

### User Story 2 - Core Puzzle Solving & Validation (Priority: P1)

As a player, I want to view a puzzle question, submit my answer, and receive clear feedback on my remaining attempts and correctness, so that I can enjoy the challenge of solving puzzles.

**Why this priority**: This is the core gameplay loop. Without answer input and validation, the game cannot function.

**Independent Test**: Can be verified on the puzzle screen by typing different correct and incorrect answers and checking if attempt counts decrease or success state is triggered.

**Acceptance Scenarios**:

1. **Given** I am on the puzzle screen, **When** I look at the screen, **Then** I see the current level number, puzzle number (1-3), current cumulative score, remaining guesses (initially 5), and the puzzle question.
2. **Given** a puzzle requires the answer "word", **When** I enter " WORD " or "Word" and submit, **Then** the answer is accepted as correct because capitalization and unnecessary spaces are ignored.
3. **Given** I enter an incorrect answer and submit, **When** the validation occurs, **Then** the remaining guesses count is decremented by 1, and I am prompted to try again.
4. **Given** I have 1 remaining guess, **When** I submit another incorrect answer, **Then** the guesses count drops to 0, the puzzle is marked as failed, the correct answer is revealed on the screen, and I am presented with a way to move to the next puzzle.

---

### User Story 3 - Hint Usage & Scoring (Priority: P2)

As a player, I want to use progressively helpful hints when I am stuck on a puzzle, understanding that each hint reduces my potential score for that puzzle, so that I can still progress without getting completely blocked.

**Why this priority**: Supports player engagement and Principle I (Player Experience First) by preventing frustration while maintaining a fair scoring system (Principle IV).

**Independent Test**: Can be verified by requesting multiple hints in a puzzle, observing the hints reveal one by one, and verifying that the final score awarded is reduced by 15 points per hint.

**Acceptance Scenarios**:

1. **Given** I am on a puzzle and have not used any hints, **When** I request a hint, **Then** Hint 1 is revealed, and the potential score for this puzzle is reduced from 100 to 85.
2. **Given** I have already revealed Hint 1, **When** I request another hint, **Then** Hint 2 is revealed, and the potential score for this puzzle is reduced to 70.
3. **Given** I have revealed all 3 hints, **When** I solve the puzzle correctly on my next attempt, **Then** I am awarded 55 points (100 - 3 * 15), which is added to my cumulative score.
4. **Given** I fail to solve a puzzle after 5 attempts, **When** the puzzle is marked as failed, **Then** I receive 0 points for that puzzle, regardless of how many hints were used.

---

### User Story 4 - Puzzle & Level Progression (Priority: P1)

As a player, I want to progress from one puzzle to the next, and see a summary of my performance at the end of each level before moving to the next level, so that I feel a sense of progression and accomplishment.

**Why this priority**: Establishes the progression loop, celebrating user milestones in alignment with Principle X (Delight Through Polish).

**Independent Test**: Can be verified by completing three puzzles (either solved or failed) and ensuring the level completion screen is shown, listing the level performance, and letting the user advance to the next level.

**Acceptance Scenarios**:

1. **Given** I successfully solve a puzzle, **When** I submit the correct answer, **Then** a congratulatory popup appears confirming my success and asking if I am ready to proceed to the next puzzle.
2. **Given** I am on the last puzzle (puzzle 3) of the current level, **When** I complete the puzzle (either solved or failed), **Then** I am shown a level completion screen presenting my level performance (e.g. puzzles solved, total score, hints used) and a button to proceed to the next level.

---

### Edge Cases

- **App Relaunch Mid-Level**: How does the game handle a player closing and reopening the app in the middle of a level? The player's current level, puzzle, score, and remaining guesses should be loaded so they can resume exactly where they left off.
- **End of Content**: After the player completes the final predefined level, the system displays a Game Completion screen showing overall statistics, final score, and a congratulatory "Puzzle Master" message, providing options to restart from Level 1.
- **Empty or Whitespace-Only Submissions**: If a player clicks submit without typing any characters or only spaces, the game should prevent submission or ignore it without reducing the attempt count.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST launch to a welcome screen featuring game title, engaging introductory text, decorative puzzle elements, animations, and a "Start Game" button positioned approximately 25% from the bottom of the screen.
- **FR-002**: The system MUST store puzzle data locally within the application, consisting of predefined levels, each containing exactly three puzzles.
- **FR-003**: Each local puzzle entry MUST contain a question, a single correct answer, and exactly three progressively useful hints.
- **FR-004**: The puzzle screen MUST display the current level number, current puzzle number (1 to 3), current cumulative score, remaining guesses (starting at 5), and the puzzle question.
- **FR-005**: The system MUST validate player answers case-insensitively and ignore leading, trailing, and duplicate internal spaces.
- **FR-006**: The system MUST decrement the remaining guess count by one for every incorrect guess.
- **FR-007**: If the guess count reaches zero, the system MUST display the correct answer and allow the player to proceed to the next puzzle without awarding points.
- **FR-008**: The system MUST allow the player to request up to three hints per puzzle sequentially, revealing one at a time.
- **FR-009**: The system MUST deduct exactly 15 points from the puzzle's maximum 100 points for each hint used. Solving a puzzle correctly MUST award `100 - (15 * hints_used)` points.
- **FR-010**: Upon solving a puzzle correctly, the system MUST show a congratulatory popup with a option to proceed to the next puzzle.
- **FR-011**: After completing the third puzzle of a level, the system MUST show a level completion screen summarizing the player's performance for the level and providing a button to transition to the next level.
- **FR-012**: The system MUST persist gameplay progress (current level index, current puzzle index, score, current attempts, and revealed hints) using local storage so that player state is retained across application relaunches.
- **FR-013**: After the player completes the final predefined level, the system MUST display a Game Completion screen showing overall statistics, final score, and a congratulatory "Puzzle Master" message, and provide a button option to restart the game from Level 1.

### Key Entities *(include if feature involves data)*

- **Puzzle**: Represents a single word puzzle.
  - Attributes: `id` (string), `question` (string), `answer` (string), `hints` (array of 3 strings).
- **Level**: Represents a group of puzzles.
  - Attributes: `levelNumber` (number), `puzzles` (array of exactly 3 Puzzles).
- **PlayerState**: Represents the current session progress.
  - Attributes: `currentLevelNumber` (number), `currentPuzzleIndex` (number), `cumulativeScore` (number), `remainingGuesses` (number), `revealedHintIndices` (array of numbers), `guessesSubmitted` (array of strings).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the gameplay flow (welcome screen -> level play -> hint usage -> scoring -> popups -> level completion -> next level) is playable offline without requiring any network connectivity.
- **SC-002**: Transitioning between the welcome screen, puzzle screen, success popups, and level completion screens takes less than 300 milliseconds.
- **SC-003**: The player state is successfully saved and restored in 100% of app close/relaunch test scenarios, ensuring zero loss of level progression or score.
- **SC-004**: Answer validation correctly ignores casing and spacing variations in 100% of tested valid submissions (e.g. "  ANS  " vs "ans").

## Assumptions

- **Predefined Content**: It is assumed that at least 3 levels (9 puzzles total) of local predefined puzzles are hardcoded or stored in a JSON file to enable start-to-finish gameplay.
- **Single-Player Focus**: There are no player profiles, leaderboards, or multiplayer components in this phase.
- **Device Support**: The UI is optimized primarily for portrait mode on mobile devices (React Native on iOS and Android).
