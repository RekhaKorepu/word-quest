# Quickstart: Player Engagement & Progression Systems

This document outlines how to manually verify and play-test the Phase 3 features.

---

## 1. Profile, XP, and Ranks
1. Launch the application.
2. In the header of the welcome/game screen, verify the presence of the **Profile Header**:
   - Shows Level (starts at 1)
   - Shows Rank (starts as `"Novice"`)
   - Shows XP progress bar (starts at 0/500)
3. Solve a Level 1 puzzle correctly.
   - Verify that your total score and XP increment by the score earned.
4. Keep solving puzzles until XP reaches 500+.
   - Verify the level transitions to 2.
5. Solve enough puzzles to reach Level 5.
   - Verify the rank changes to `"Apprentice"`.

---

## 2. Reveal Answer Button
1. Start a puzzle.
2. Click the **Reveal Answer** button adjacent to the "Reveal Hint" button.
3. Verify that:
   - The guess text input field is disabled.
   - The correct answer is displayed clearly.
   - The puzzle score earned is 0.
   - A **Next Puzzle** button is rendered to advance.
4. Click **Next Puzzle** and confirm transition.

---

## 3. Achievements & Toast Notifications
1. Solve your first puzzle.
   - Verify that the **First Steps** achievement notification modal/toast slides in from the top/bottom.
2. Play through an entire level and solve all 3 puzzles without requesting any hints.
   - At the level completion screen, verify that the **Pure Genius** achievement notification triggers.

---

## 4. Statistics Dashboard
1. On the Welcome Screen, click the **Statistics** button.
2. Verify that the stats modal loads instantly and displays:
   - Total puzzles solved.
   - Total hints used.
   - Average score calculation.
   - Best level score.
   - Success rate percentage.

---

## 5. Daily Challenge & Streaks
1. On the Welcome Screen, click **Daily Challenge**.
2. Complete the unique daily puzzle.
   - Verify that you receive **Double XP**.
   - Verify that your consecutive daily streak counter increments to 1.
3. Re-verify the streak updates correctly tomorrow when completing the daily puzzle again.
