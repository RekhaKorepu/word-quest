# Research: Core Gameplay Foundation

## Technology Choices

### 1. Game State Management
- **Decision**: Encapsulate gameplay state within a custom hook `useGameState` using a Redux-like reducer pattern or simple React state transitions.
- **Rationale**: Keeps business logic entirely separate from UI rendering components (Principle VII: Maintainable Architecture). It also makes state transitions deterministic and extremely easy to test in isolation with Vitest (Principle VIII: Test-Driven Reliability).
- **Alternatives considered**: Redux Toolkit (rejected as too heavyweight for this phase) or standard context API (rejected as unnecessary for simple linear flows).

### 2. Local Persistence
- **Decision**: Use `@react-native-async-storage/async-storage` for progress persistence.
- **Rationale**: Standard, lightweight storage system for React Native/Expo that satisfies the offline-capable requirement (Principle V). It easily handles state serialization/deserialization.
- **Alternatives considered**: SQLite or Expo FileSystem (rejected as overly complex for basic state persistence).

### 3. Predefined Puzzles Local Storage
- **Decision**: Store puzzles in a static local TypeScript array/JSON file.
- **Rationale**: Simple, zero-dependency, reliable offline data source matching the Phase 1 requirement.
- **Alternatives considered**: Local SQLite DB (rejected for simplicity and file-size reasons).

## Predefined Puzzles Data Structure
```typescript
export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  hints: [string, string, string]; // Exactly 3 hints
}

export interface Level {
  levelNumber: number;
  puzzles: [Puzzle, Puzzle, Puzzle]; // Exactly 3 puzzles
}
```
This guarantees compile-time compliance with the puzzle requirements (exactly 3 puzzles per level, exactly 3 hints per puzzle) from the constitution.
