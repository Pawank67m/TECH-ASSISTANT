---
inclusion: always
---

# Design System Rules for AI Voice Assistant

## Project Overview

Full-stack web app: React (TypeScript) frontend + Node.js/Express backend.
UI is a minimal ChatGPT-style chat interface.

## Tech Stack

- Frontend: React + TypeScript (Vite assumed)
- Backend: Node.js + Express + TypeScript
- Database: Firebase Firestore
- HTTP client: Axios
- Testing: Vitest (frontend), Jest (backend), fast-check (property tests)

## Component Architecture

Components live in `frontend/src/` and follow this structure:

```
frontend/src/
  components/
    ChatInterface.tsx
    MessageBubble.tsx
    MicButton.tsx
    StatusBar.tsx
  services/
    speechRecognizer.ts
    speechSynthesizer.ts
    commandHandler.ts
    apiClient.ts
    conversationStore.ts
  App.tsx
```

## Styling Approach

- Minimal, modern chat UI similar to ChatGPT
- Responsive: support 320px–1920px screen widths
- User messages: right-aligned
- Assistant messages: left-aligned
- Each message bubble includes role-based styling and a timestamp

## Design Tokens & Conventions

- No external design token library defined yet — use CSS variables or Tailwind if introduced
- When implementing from Figma: replace Tailwind utility classes with project CSS variables/tokens
- Reuse existing components (buttons, inputs, bubbles) instead of duplicating

## Figma Integration Guidelines

- Treat Figma MCP output (React + Tailwind) as a design reference, not final code
- Replace Tailwind classes with project styling conventions
- Reuse `MessageBubble`, `MicButton`, `StatusBar`, `ChatInterface` before creating new components
- Strive for 1:1 visual parity with Figma designs
- Validate final UI against Figma screenshots for both look and behavior
- Prefer design-system tokens and adjust spacing/sizes minimally to match visuals

## Key Data Models

```ts
interface Message {
  id: string;        // UUID
  role: 'user' | 'assistant';
  content: string;
  timestamp: number; // Unix ms
}
```

## State Flags (App-level)

- `isListening: boolean` — microphone active
- `isLoading: boolean` — waiting for AI response
- `isSpeaking: boolean` — speech synthesis active

## Asset & Icon Conventions

- No icon library defined yet — document any icons added under `frontend/src/assets/`
- Use semantic HTML and ARIA labels for accessibility on interactive elements (MicButton, etc.)
