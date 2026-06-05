# Research and Decisions: Player Engagement & Progression Systems

## Summary of Decisions

| Research Area | Chosen Decision | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Data Persistence** | **AsyncStorage** | Native local storage interface on Expo/React Native. Zero network overhead, fully offline-functional (Principle V), and highly performant (<5ms reads/writes). | SecureStore (rejected as profile data is not sensitive/secret), SQLite (rejected as overhead is too high for simple key-value progression objects). |
| **XP & Level Scaling** | **Linear intervals (500 XP / level)** | Simple, transparent, and deterministic. Ensures players easily understand progression (Level = `Math.floor(XP/500) + 1`). | Exponential scaling (e.g. `Level = sqrt(XP)`), which increases grinding frustration, violating Principle I (Player Experience First). |
| **Daily Streak Validation** | **Local ISO-Date Comparison** | Compares `lastCompletedChallengeDate` stored in local profile with `currentDate` (in `YYYY-MM-DD` format). If difference is exactly 1 day, streak increments; if >1 day, streak resets. Fully offline-friendly. | Clock Server API Sync (rejected due to offline play requirements violating Principle V). |
| **Reveal Answer Blocking** | **Disable guess submission, award 0 points, render 'Next Puzzle'** | Blocks the player from further guesses on that puzzle once reveal is triggered, preventing score exploitation while keeping them moving forward. | Skip puzzle immediately without showing answer (rejected because seeing the answer provides educational value and reduces player frustration). |
