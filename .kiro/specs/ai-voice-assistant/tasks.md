# Implementation Plan: AI Voice Assistant

## Overview

Incremental implementation starting with project scaffolding, then core services (speech, commands, API), then the chat UI, then Firebase persistence, and finally backend API endpoints. Each step builds on the previous and ends with wiring into the running application.

## Tasks

- [-] 1. Scaffold project structure and install dependencies
  - Create `frontend/` (Vite + React + TypeScript + Tailwind CSS) and `backend/` (Node.js + Express + TypeScript) directories
  - Install frontend deps: `react`, `react-dom`, `axios`, `firebase`, `uuid`, `fast-check`, `vitest`, `@testing-library/react`
  - Install backend deps: `express`, `cors`, `dotenv`, `@google/generative-ai`, `axios`, `jest`, `supertest`, `ts-jest`
  - Create `.env.example` files for both frontend and backend listing all required environment variables
  - Add env var validation at backend startup (log warnings for missing vars)
  - _Requirements: 7.3, 8.4_

- [ ] 2. Implement CommandHandler service
  - Create `frontend/src/services/commandHandler.ts` with the `CommandResult` union type and `handle(transcript: string): CommandResult` function
  - Implement pattern matching for: open youtube, open google, search [query], time phrases, date phrases, weather in/of [city]
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9_

  - [ ] 2.1 Write property tests for CommandHandler
    - **Property 7: URL command detection** — for any transcript containing "open youtube"/"open google", result type is `open_url` with correct URL
    - **Property 8: Search command extraction** — for any "search [query]" transcript, result type is `search` with correct query
    - **Property 9: Time and date commands produce formatted responses** — result message matches expected format
    - **Property 10: Weather command extracts city** — result type is `weather` with correct city
    - **Property 11: All command results carry a non-empty message**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9**

- [ ] 3. Implement SpeechRecognizer and SpeechSynthesizer services
  - Create `frontend/src/services/speechRecognizer.ts` wrapping `window.SpeechRecognition` with `start()`, `stop()`, `onResult`, and `onError` callbacks; expose `isListening` state
  - Create `frontend/src/services/speechSynthesizer.ts` wrapping `window.speechSynthesis` with `speak(text, onEnd)` and graceful no-op when unsupported
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.4, 3.5_

  - [ ] 3.1 Write unit tests for SpeechRecognizer and SpeechSynthesizer
    - Test start/stop state transitions (Property 1: microphone toggle round-trip)
    - Test error handling for unsupported browser and denied permission (edge cases 1.4, 1.5)
    - Test SpeechSynthesizer no-op when `speechSynthesis` is undefined (edge case 3.4)
    - **Property 1: Microphone toggle is a round-trip**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 3.4**

- [ ] 4. Implement apiClient service
  - Create `frontend/src/services/apiClient.ts` using Axios with `sendMessage(message, history)` and `getWeather(city)` functions
  - Implement error handling: network errors → "Service unavailable", non-2xx → server error message
  - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 8.2_

  - [ ] 4.1 Write property tests for apiClient
    - **Property 3: Chat API payload always includes history capped at 10** — for any history of length N, payload contains min(N, 10) entries
    - **Property 4: API client round-trip** — mocked backend response is returned unmodified
    - **Validates: Requirements 2.1, 2.2, 2.5**

- [ ] 5. Implement ConversationStore service
  - Create `frontend/src/services/conversationStore.ts` with `initSession()`, `saveMessage()`, and `loadHistory()` using Firebase Firestore SDK
  - Store session ID in `localStorage`; use Firestore path `sessions/{sessionId}/messages/{messageId}`
  - Wrap all Firestore calls in try/catch; write failures log and continue, read failures return empty array
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 5.1 Write property tests for ConversationStore
    - **Property 15: Session ID uniqueness** — two fresh initSession() calls return different IDs
    - **Property 16: Message persistence round-trip** — saveMessage then loadHistory returns the saved message
    - **Property 17: Firestore path correctness** — saveMessage writes to correct collection path
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 6. Checkpoint — Ensure all service tests pass
  - Run `vitest --run` in `frontend/` and verify all tests pass; fix any failures before proceeding.

- [ ] 7. Build ChatInterface and MessageBubble components
  - Create `frontend/src/components/MessageBubble.tsx` rendering role-based alignment/styling and timestamp
  - Create `frontend/src/components/ChatInterface.tsx` with scrollable message list, auto-scroll on new message, loading indicator, listening indicator, speaking indicator, and text input field
  - Create `frontend/src/components/MicButton.tsx` with animated pulse when listening
  - Create `frontend/src/components/StatusBar.tsx` showing idle/listening/thinking/speaking state
  - Apply Tailwind CSS for modern minimal ChatGPT-style layout, responsive from 320px to 1920px
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 7.1 Write property and unit tests for ChatInterface components
    - **Property 2: Listening state drives visual indicator** — isListening=true renders listening indicator
    - **Property 5: Speaking state drives visual indicator** — isSpeaking=true renders speaking indicator
    - **Property 12: Messages rendered in chronological order** — for any message list, rendered order matches ascending timestamp
    - **Property 13: Message bubble contains role styling and timestamp** — for any Message, rendered bubble has role class and timestamp
    - **Property 14: Loading indicator visible during processing** — isLoading=true renders loading indicator
    - Unit test: text input field exists and submitting it adds a message (Req 5.7)
    - **Validates: Requirements 1.6, 3.2, 5.1, 5.3, 5.4, 5.5, 5.7**

- [ ] 8. Build App root component and wire frontend together
  - Create `frontend/src/App.tsx` managing global state: sessionId, messages, isListening, isSpeaking, isLoading, error
  - Wire: MicButton → SpeechRecognizer → CommandHandler → (browser action OR apiClient) → ChatInterface → SpeechSynthesizer
  - Wire: ConversationStore.initSession() on mount, loadHistory() on mount, saveMessage() on each new message
  - Wire: text input in ChatInterface → same pipeline as voice input (skip SpeechRecognizer)
  - Handle empty transcripts: do not call CommandHandler or apiClient (Property 18)
  - _Requirements: 1.1, 1.3, 1.6, 2.1, 3.1, 3.2, 3.3, 4.1–4.9, 5.1–5.7, 6.1–6.3, 8.1, 8.2, 8.3_

  - [ ] 8.1 Write property test for empty transcript handling
    - **Property 18: Empty transcript is ignored** — for any whitespace-only string, no API call or command is triggered
    - **Validates: Requirements 8.3**

  - [ ] 8.2 Write unit tests for App integration
    - Test that speech synthesis completes → state returns to idle (Property 6)
    - Test that backend unreachable → error message shown in chat (Req 8.2)
    - **Property 6: Speech synthesis completes to idle**
    - **Validates: Requirements 3.3, 8.1, 8.2**

- [ ] 9. Implement backend geminiService
  - Create `backend/src/services/geminiService.ts` using `@google/generative-ai`
  - Format `Message[]` history into Gemini `Content[]` format; call `generateContent`; return response text
  - Implement 30-second request timeout; on timeout return error string
  - Read `GEMINI_API_KEY` from `process.env`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.3_

  - [ ] 9.1 Write unit tests for geminiService
    - Test successful response passthrough (mock Gemini SDK)
    - Test timeout edge case (mock delayed response)
    - Test API failure edge case (mock rejected promise)
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 10. Implement backend weatherService
  - Create `backend/src/services/weatherService.ts` calling OpenWeatherMap API
  - Return formatted string: "Weather in {city}: {temp}°C, {description}, humidity {humidity}%"
  - Read `WEATHER_API_KEY` from `process.env`
  - _Requirements: 4.6, 4.7, 7.2, 7.3_

  - [ ] 10.1 Write unit tests for weatherService
    - Test successful response formatting (mock Axios)
    - Test city not found edge case (mock 404 response)
    - **Validates: Requirements 4.6, 4.7**

- [ ] 11. Implement backend Express routes and middleware
  - Create `backend/src/routes/chat.ts` with `POST /api/chat` — validate `message` field, call geminiService, return `{ response }`
  - Create `backend/src/routes/weather.ts` with `GET /api/weather` — validate `city` param, call weatherService, return `{ weather }`
  - Add CORS middleware configured from `FRONTEND_ORIGIN` env var
  - Add global error handler middleware returning `{ error: "..." }` with appropriate status codes
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

  - [ ] 11.1 Write unit tests for backend routes
    - Test POST /api/chat with valid body → 200 with response field (example)
    - Test POST /api/chat missing message → 400 (edge case 7.4)
    - Test GET /api/weather with valid city → 200 with weather field (example)
    - Test GET /api/weather missing city → 400 (edge case 7.5)
    - Test CORS header present on responses (example)
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6**

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` in `frontend/` and `jest` in `backend/`; fix any failures.
  - Verify the full conversation flow works end-to-end via automated integration tests.
