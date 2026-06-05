# Research: AI Puzzle Generation Engine

## Technical Decisions

### 1. API Integration Method
- **Decision**: Use direct HTTPS `fetch` calls to the Gemini API (`gemini-1.5-flash` model) instead of importing the `@google/generative-ai` SDK.
- **Rationale**:
  - Direct HTTP requests via `fetch` are standard in React Native, lightweight, and require zero additional dependencies.
  - Using the SDK can introduce build/module resolution issues in Metro/Expo on older SDK configurations.
  - The payload structure is simple and easy to post directly to:
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
- **Alternatives considered**:
  - `@google/generative-ai` SDK: Rejected due to unnecessary bundle bloat and Metro bundler compatibility risks.

### 2. Structured JSON Output from Gemini
- **Decision**: Configure the Gemini request payload with `"generationConfig": { "responseMimeType": "application/json" }` and specify a schema in the prompt.
- **Rationale**:
  - Gemini 1.5 Flash natively supports structured JSON generation via `responseMimeType`.
  - This eliminates parsing fragility (like regular expressions for extracting JSON blocks from markdown) and ensures consistent data structures.
- **Alternatives considered**:
  - Free-form text parsing: Rejected due to high failure rate and parsing complexity.

### 3. Prefetching Queue & Game Loop Integration
- **Decision**: Implement the prefetch queue directly inside a React Context or wrapper service.
  - The queue will trigger background fetches when size drops below 3.
  - It handles API key loading, validation, cooldown tracking (60s timer on failure), and falling back to a static local repository.
- **Rationale**:
  - Keeps UI components simple and focused on rendering.
  - Decouples core game mechanics from the networking layer.
- **Alternatives considered**:
  - Direct in-component fetching: Rejected as it causes slow UI transitions and violates Principle VII (Maintainable Architecture).

## Prompt Specification
The prompt will request:
```json
{
  "contents": [{
    "parts": [{
      "text": "Generate a single casual word puzzle for a mobile game. The puzzle MUST consist of:
      1. A question (a fun, easy-to-understand riddle or brain teaser).
      2. An answer (a single, simple word, in English, containing only alphabetic characters).
      3. Exactly three helpful progressive hints.
      4. A difficulty level: either 'easy' or 'medium' (based on the requested difficulty: {requested_difficulty}).
      
      You must respond in valid JSON matching this schema:
      {
        \"question\": \"string\",
        \"answer\": \"string\",
        \"hints\": [\"string\", \"string\", \"string\"],
        \"difficulty\": \"easy\" | \"medium\"
      }"
    }]
  }],
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```
