# Quickstart: Production Polish and Audio

This guide describes how to run and test the Phase 4 sound and offline capabilities.

## Installation of Audio Libraries

Install `expo-av` using Expo CLI to ensure native audio module linkage:

```bash
npx expo install expo-av
```

## Running the Application with Audio

Start the development server:

```bash
npm run start
```

Open on an iOS/Android simulator or device. Sound effects will load in the background on initial app launch.

## Testing Offline Resilience

1. Turn off WiFi and Cellular data on your testing device or simulator.
2. Launch the application.
3. Verify that you can still play and cycle through cached AI puzzles.
