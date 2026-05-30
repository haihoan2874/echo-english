# EchoEnglish

A personal English learning app that transforms passive YouTube watching into active learning. Built with React + Vite.

## What it does

- Load any YouTube video and study with synced subtitles
- Click any word to get Vietnamese translation instantly
- Dictation mode: fill in blanks while listening
- Save vocabulary to a personal notebook
- Flashcard review with flip animation (know / don't know scoring)
- AI conversation partner with level selection (A1 to B2)
- Playlist manager to organize study videos
- Watch history with progress tracking

## Tech stack

- React 18, Vite, Tailwind CSS
- Zustand for state management (persisted to localStorage)
- Google Gemini API for AI conversation
- GSAP for animations
- Web Speech API for voice input/output
- react-hot-toast for notifications

## Prerequisites

- Node.js 18+
- A small Node.js backend running on port 3001 to fetch YouTube transcripts (via `youtube-transcript` or similar)

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

The transcript backend must be running separately on port 3001. Without it, subtitles will not load but other features still work.

## Project structure

```
src/
  pages/          # Main screens (Home, Lesson, Vocab, AIChat)
  components/     # Reusable UI components
    home/         # Homepage-specific components
    modals/       # Modal dialogs
  store/          # Zustand stores (vocab, history, playlist, chat)
```

## Notes

- The Gemini API key is hardcoded in `AIChatPage.jsx` for local development. Move it to a `.env` file before any public deployment.
- All user data (vocab, playlists, history, chat level) is stored in the browser's localStorage. Clearing site data will reset everything.
