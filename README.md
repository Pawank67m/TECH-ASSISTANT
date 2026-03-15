# TECH INNOV — AI Voice Assistant

A full-stack AI-powered voice assistant with a 3D robot interface, built with React + Node.js.

## Features

- 🎙️ Voice input via Web Speech API
- 🔊 Siri-like voice replies using Speech Synthesis
- 🤖 Interactive 3D robot (Spline)
- 💬 ChatGPT-style chat interface
- 🌐 Open websites by voice ("open YouTube", "open GitHub"...)
- 🖥️ Open desktop apps by voice ("open notepad", "open calculator"...)
- 🔍 Google search by voice ("search React hooks")
- 🌤️ Weather lookup ("weather in Mumbai")
- 🕐 Time & date queries
- ✨ Animated glowing input bar with lightning effects

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI | Groq API (LLaMA 3) |
| Weather | wttr.in (free, no key needed) |
| 3D | Spline |
| Styling | Tailwind CSS |

## Project Structure

```
├── frontend/          # React app
│   └── src/
│       ├── components/   # UI components
│       ├── services/     # Speech, API, commands
│       └── App.tsx
├── backend/           # Express API
│   └── src/
│       ├── routes/       # chat, weather, open-app
│       └── services/     # Groq AI, weather
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ API key to .env as GEMINI_API_KEY
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

**backend/.env**
```
GEMINI_API_KEY=your_groq_api_key
FRONTEND_ORIGIN=http://localhost:5173
PORT=3001
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3001
```

## Voice Commands

| Say | Action |
|-----|--------|
| "open YouTube" | Opens youtube.com |
| "open Chrome" | Launches Chrome |
| "open Notepad" | Launches Notepad |
| "search React tutorials" | Google search |
| "weather in London" | Shows weather |
| "what time is it" | Current time |
| "what is today's date" | Current date |

## License

MIT
