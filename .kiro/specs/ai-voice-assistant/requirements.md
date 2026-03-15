# Requirements Document

## Introduction

A full-stack web-based AI Voice Assistant that allows users to speak through their browser microphone, converts speech to text, sends the text to the Gemini AI API for a natural language response, and reads the response aloud using browser Text-to-Speech. The assistant supports special voice commands (open YouTube, open Google, search Google, tell time/date, tell weather) and persists conversation history in Firebase Firestore. The UI is a modern, minimal chat interface similar to ChatGPT.

## Glossary

- **Assistant**: The AI Voice Assistant web application
- **SpeechRecognizer**: The browser Web Speech API component that converts microphone audio to text
- **SpeechSynthesizer**: The browser Speech Synthesis API component that converts text to audio
- **GeminiClient**: The backend service that communicates with the Gemini AI API
- **ConversationStore**: The Firebase Firestore component that persists chat history
- **CommandHandler**: The component that detects and executes special voice commands
- **ChatInterface**: The React frontend component displaying the conversation
- **Session**: A user's browser session identified by a unique session ID
- **Message**: A single user or assistant turn in the conversation

---

## Requirements

### Requirement 1: Speech-to-Text Input

**User Story:** As a user, I want to speak into my browser microphone and have my speech converted to text, so that I can interact with the assistant hands-free.

#### Acceptance Criteria

1. WHEN the user clicks the microphone button, THE SpeechRecognizer SHALL begin capturing audio from the browser microphone.
2. WHEN the user stops speaking, THE SpeechRecognizer SHALL finalize the transcription and produce a text string.
3. WHEN the user clicks the microphone button again while listening, THE SpeechRecognizer SHALL stop capturing audio.
4. IF the browser does not support the Web Speech API, THEN THE Assistant SHALL display an error message informing the user that voice input is unavailable.
5. IF microphone permission is denied by the user, THEN THE SpeechRecognizer SHALL display a descriptive error message and return to idle state.
6. WHILE the SpeechRecognizer is active, THE ChatInterface SHALL display a visual indicator showing that the assistant is listening.

---

### Requirement 2: AI Response Generation

**User Story:** As a user, I want my spoken input to be sent to an AI and receive a natural language response, so that I can have a meaningful conversation.

#### Acceptance Criteria

1. WHEN a transcribed text message is received, THE GeminiClient SHALL send the message along with the conversation history to the Gemini AI API.
2. WHEN the Gemini API returns a response, THE GeminiClient SHALL return the response text to the frontend.
3. IF the Gemini API request fails, THEN THE GeminiClient SHALL return a descriptive error message to the frontend within 10 seconds.
4. IF the Gemini API response exceeds 30 seconds, THEN THE GeminiClient SHALL time out the request and return an error message.
5. THE GeminiClient SHALL include the last 10 messages of conversation history in each API request to maintain context.

---

### Requirement 3: Text-to-Speech Output

**User Story:** As a user, I want the assistant's response to be read aloud, so that I can receive answers without reading the screen.

#### Acceptance Criteria

1. WHEN the GeminiClient returns a response, THE SpeechSynthesizer SHALL convert the response text to speech and play it through the browser.
2. WHEN speech synthesis begins, THE ChatInterface SHALL display a visual indicator showing that the assistant is speaking.
3. WHEN speech synthesis completes, THE ChatInterface SHALL return to idle state.
4. IF the browser does not support Speech Synthesis, THEN THE Assistant SHALL display the response text only without attempting speech synthesis.
5. THE SpeechSynthesizer SHALL use the default browser voice and a speech rate of 1.0.

---

### Requirement 4: Special Voice Commands

**User Story:** As a user, I want to use specific voice commands to trigger browser actions, so that I can control my browser hands-free.

#### Acceptance Criteria

1. WHEN the transcribed text contains "open youtube" (case-insensitive), THE CommandHandler SHALL open `https://www.youtube.com` in a new browser tab.
2. WHEN the transcribed text contains "open google" (case-insensitive), THE CommandHandler SHALL open `https://www.google.com` in a new browser tab.
3. WHEN the transcribed text contains "search" followed by a query (case-insensitive), THE CommandHandler SHALL open a Google search for the extracted query in a new browser tab.
4. WHEN the transcribed text contains "what time is it" or "what is the time" or "current time" (case-insensitive), THE CommandHandler SHALL respond with the current local time in HH:MM AM/PM format.
5. WHEN the transcribed text contains "what is the date" or "today's date" or "current date" (case-insensitive), THE CommandHandler SHALL respond with the current local date in a human-readable format (e.g., "Monday, March 15, 2026").
6. WHEN the transcribed text contains "weather in [city]" or "weather of [city]" (case-insensitive), THE CommandHandler SHALL fetch and return the current weather for the specified city using a weather API.
7. IF a weather API request fails, THEN THE CommandHandler SHALL return a descriptive error message indicating the city was not found or the service is unavailable.
8. WHEN a special command is detected, THE CommandHandler SHALL respond with a confirmation message and THE SpeechSynthesizer SHALL read it aloud.
9. WHEN a special command is detected, THE CommandHandler SHALL NOT forward the message to the GeminiClient.

---

### Requirement 5: Chat Interface

**User Story:** As a user, I want to see the conversation displayed in a chat-style interface, so that I can follow the dialogue visually.

#### Acceptance Criteria

1. THE ChatInterface SHALL display all user messages and assistant responses in chronological order.
2. WHEN a new message is added, THE ChatInterface SHALL scroll to the most recent message automatically.
3. THE ChatInterface SHALL visually distinguish user messages from assistant messages using different alignment and styling.
4. THE ChatInterface SHALL display a timestamp for each message.
5. WHILE the GeminiClient is processing a request, THE ChatInterface SHALL display a loading indicator.
6. THE ChatInterface SHALL be responsive and render correctly on screen widths from 320px to 1920px.
7. THE ChatInterface SHALL provide a text input field as an alternative to voice input, allowing users to type messages.

---

### Requirement 6: Conversation History Persistence

**User Story:** As a user, I want my conversation history to be saved, so that I can review past interactions.

#### Acceptance Criteria

1. WHEN a new Session is created, THE ConversationStore SHALL generate and persist a unique session ID in the browser's localStorage.
2. WHEN a Message is sent or received, THE ConversationStore SHALL persist the message (role, content, timestamp) to Firebase Firestore under the current session ID.
3. WHEN the page is loaded and a session ID exists in localStorage, THE ConversationStore SHALL retrieve and display the conversation history for that session.
4. THE ConversationStore SHALL store messages in a Firestore collection named `sessions/{sessionId}/messages`.
5. IF a Firestore write operation fails, THEN THE ConversationStore SHALL log the error and continue without interrupting the conversation flow.
6. IF a Firestore read operation fails on page load, THEN THE ConversationStore SHALL display an empty conversation and log the error.

---

### Requirement 7: Backend API

**User Story:** As a developer, I want a clean backend API that proxies requests to Gemini and handles weather lookups, so that API keys are kept secure on the server.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /api/chat` endpoint that accepts `{ message: string, history: Message[] }` and returns `{ response: string }`.
2. THE Backend SHALL expose a `GET /api/weather?city={city}` endpoint that returns current weather data for the specified city.
3. THE Backend SHALL read the Gemini API key and weather API key exclusively from environment variables and SHALL NOT expose them to the frontend.
4. IF a request to `POST /api/chat` is missing the `message` field, THEN THE Backend SHALL return HTTP 400 with a descriptive error message.
5. IF a request to `GET /api/weather` is missing the `city` query parameter, THEN THE Backend SHALL return HTTP 400 with a descriptive error message.
6. THE Backend SHALL include CORS headers to allow requests from the configured frontend origin.

---

### Requirement 8: Error Handling and Resilience

**User Story:** As a user, I want the assistant to handle errors gracefully, so that failures do not break my experience.

#### Acceptance Criteria

1. IF any unhandled error occurs in the frontend, THEN THE Assistant SHALL display a user-friendly error message in the chat interface without crashing.
2. IF the backend is unreachable, THEN THE Assistant SHALL display a message indicating the service is unavailable and prompt the user to try again.
3. IF the SpeechRecognizer produces an empty transcription, THEN THE Assistant SHALL ignore the input and return to idle state without sending a request.
4. THE Assistant SHALL validate that all required environment variables are present at startup and SHALL log a warning for any missing variables.
