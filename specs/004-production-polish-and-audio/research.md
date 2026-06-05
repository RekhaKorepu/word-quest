# Research: Production Polish and Audio

This document logs research and tech decisions for Phase 4.

## Sound Effects in React Native (Expo)

### Choice: `expo-av`
`expo-av` is the official, well-supported Expo package for audio playback.

#### Playback Patterns
To meet the $<80$ms latency success criterion (SC-001):
1. **Dynamic loading on tap** (Bad): Invoking `Sound.createAsync()` on demand introduces file system I/O latency ($>100$ms), causing sound to lag behind the touch gesture.
2. **Preloading / Singleton Sound Map** (Chosen): Create an `AudioManager` that loads all 6 MP3 assets into memory at app start (using `Audio.Sound.createAsync()` with `shouldPlay: false`). Playback is triggered using `.replayAsync()`, which offers near-instantaneous trigger latency ($<20$ms).

---

## Offline AI Puzzle Cache

### Choice: AsyncStorage Persistence
To ensure offline-ready state persistence across app restarts:
- We will store the prefetch queue (up to 5 puzzles) as serialized JSON in `AsyncStorage` under the key `@wordquest_offline_cache`.
- On startup, the queue is loaded from local storage into the in-memory queue inside `puzzleManager.ts`.
- Every time a new AI puzzle is fetched online, the cache is updated in `AsyncStorage`.
- When prefetching occurs offline, network failure triggers a graceful fallback to reading from this cached array. If the cache is exhausted, the app falls back to predefined levels.

---

## Expo App Polish & Metadata

### Choice: Configuration in `app.json`
- **Splash Screen**: We will configure Expo to mount a custom splash image by adding the `splash` object:
  ```json
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#000000"
  }
  ```
- **App Icon**: Ensure `./assets/icon.png` is correctly referenced and formatted as a 1024x1024 pixel PNG.
