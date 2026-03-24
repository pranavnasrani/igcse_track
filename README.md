# IGCSE Tracker

A modern, fast, and intuitive web application designed to help students track their IGCSE past paper progress, analyze their performance, and stay motivated.

## Features

- **Smart Search**: Quickly find past papers using natural language or shorthand (e.g., "Math s23 p42" or "June 2023").
- **Real-Time Analytics**: Visualise your progress with interactive charts showing your average scores and performance trends over time.
- **Motivational Streaks**: Keep your momentum going with a 7-day streak tracker right on your dashboard.
- **Quick Logging**: Log a completed paper from anywhere in the app with the global "Quick Log" button.
- **Dark Mode**: Fully supported dark mode that automatically syncs with your system preferences.
- **Cloud Sync**: All your data is securely stored and synced in real-time using Firebase.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand (via custom hooks)
- **Backend & Auth**: Firebase (Firestore & Authentication)
- **Notifications**: Sonner

## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up your Firebase project and add your configuration to `src/firebase.ts` or `firebase-applet-config.json`.
4. Run the development server with `npm run dev`.

## License

MIT
