# Data Model: Production Polish and Audio

This document defines the data models and schemas used for Phase 4.

## Entities

### `AudioSettings`
Represents the user's audio preferences.

- **Attributes**:
  - `isMuted` (boolean): Whether sound effects are silenced. Defaults to `false`.
- **Validation**:
  - Must be a valid boolean.
- **Storage Key**:
  - `@wordquest_audio_settings`

---

### `OfflinePuzzleCache`
Represents the local persistent store for pre-fetched AI puzzles.

- **Attributes**:
  - `puzzles` (GeneratedPuzzle[]): List of cached puzzles.
- **Validation**:
  - Maximum array length: `5`.
  - Each item in the array must conform to the `GeneratedPuzzle` schema:
    - `id` (string)
    - `question` (string, length 15-200)
    - `answer` (string, alphabetic only)
    - `hints` (array of exactly 3 non-empty strings)
    - `difficulty` ('easy' | 'medium')
- **Storage Key**:
  - `@wordquest_offline_cache`
