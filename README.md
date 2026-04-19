# 🏟️ PulseArena AI — Smart Stadium Experience Platform

> **AI-driven real-time crowd management and venue operations dashboard for large-scale sporting events.**

Built for the **Narendra Modi Stadium, Ahmedabad** — the world's largest cricket stadium with a capacity of 132,000 spectators.

---

## 🌟 Overview

PulseArena AI transforms the physical event experience by solving the core problems of modern large-scale venues:

- 🚶 **Crowd Congestion** — real-time density monitoring across all stadium zones
- ⏱️ **Long Wait Times** — virtual queuing with live wait time predictions
- 🧭 **Navigation Confusion** — AI-recommended crowd-aware routing
- 🚨 **Safety Alerts** — instant critical incident broadcasting to all connected users

---

## 🚀 Key Features

| Module | Description |
|---|---|
| 📊 **Mission Control Dashboard** | Live KPIs, crowd flow score, attendance counter, AI activity feed |
| 🗺️ **Live Operations Map** | Interactive Leaflet.js map with real-time zone density heat overlays |
| 🎫 **Smart Queue System** | Virtual queuing — join digitally, track queue length and wait times live |
| 🧭 **Smart Navigation** | Crowd-aware routing comparing standard vs AI-recommended paths |
| 🚨 **Alert Center** | Centralized hub for crowd, weather, safety, and system notifications |
| 🤖 **AI Assistant** | Context-aware chatbot answering venue queries with a typewriter effect |
| 🔧 **Admin Console** | Admin-only data management panel — manual zone density overrides via Firebase |

---

## 🔐 Security Architecture

- **Google Firebase Authentication** — Email/Password + Google OAuth2 Sign-In
- **Exact Email Whitelist** — Admin panel access is locked to a hardcoded verified email address. No fuzzy matching, no PIN, no localStorage bypass
- **Route-Level Guard** — `AdminRoute` component blocks direct URL access to `/stadium/admin` for non-admins, independent of the sidebar
- **Protected Routes** — All dashboard paths require a valid authenticated session

---

## ⚡ Performance & Efficiency

- **React Lazy + Suspense** — Every page is code-split and loaded on-demand, minimising initial bundle size
- **Stable Effect Dependencies** — Firebase listeners and simulation intervals are in independent `useEffect` hooks with stable `[isReady]` dependencies, preventing memory leaks and duplicate subscriptions
- **Throttled Alerts** — Random alert generation runs at ~5% probability per 3-second tick (~45s average interval)
- **Toast Auto-Dismiss** — All toasts expire and are removed from state after 5 seconds

---

## 🏗️ Stability

- **Global ErrorBoundary** — Wraps the entire app; catches unexpected runtime errors and shows a styled recovery screen instead of a blank white page
- **Firebase Graceful Fallback** — Auth state listener is fully synchronous; admin verification runs as a non-blocking background task
- **Split Data Architecture** — Simulation logic lives entirely in `src/services/`, completely decoupled from UI components

---

## ♿ Accessibility

- `aria-label` attributes on all icon-only interactive buttons
- High-contrast neon-on-dark colour palette (WCAG-informed)
- Semantic HTML structure with proper heading hierarchy per page
- Keyboard-navigable dropdowns and modals

---

## 🔗 Google Services Used

| Service | Usage |
|---|---|
| **Firebase Authentication** | Google OAuth2 Sign-In, Email/Password, Password Reset |
| **Firebase Analytics** | Page view tracking via `logEvent` |
| **Cloud Firestore** | Admin panel zone overrides, broadcast alerts, admin email registry |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| State | React Context API + `useReducer` |
| Styling | Vanilla CSS custom design system (Dark Cyber theme) |
| Maps | Leaflet.js via `react-leaflet` |
| Icons | Lucide React |
| Auth & DB | Google Firebase (Auth + Firestore + Analytics) |

---

## 💻 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Create a .env file in the root with your Firebase project keys:
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# 3. Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🎨 Design System

The application uses a premium **Dark Cyber** aesthetic:

| Token | Value |
|---|---|
| Base Background | Deep Navy `#0a0e27` |
| Primary Accent | Neon Cyan `#00d4ff` |
| Secondary Accent | Electric Purple `#7b2ff7` |
| Alert / Action | Hot Pink `#ff2d95` |
| Warning | Neon Orange `#ff8c00` |
| Success | Neon Green `#00ff88` |
| Display Font | `Orbitron` (Google Fonts) |
| Body Font | `Inter` (Google Fonts) |

UI components use glassmorphism panels, animated gradients, and neon glow effects.

---

## 🧠 Simulation Engine

All crowd data (densities, queues, alerts) is generated client-side by `src/services/crowdSimulator.js`. The engine models **4 event phases** (Pre-Event, Event Active, Half-Time, Post-Event) that dynamically shift crowd distribution across 18 stadium zones — creating realistic fluctuations without requiring a live IoT backend.

The Admin Console (admin-only) allows switching from AI simulation to **Manual Control** mode, where zone densities are driven directly from Firebase Firestore sliders in real time.

---

## 📁 Project Structure

```
src/
├── App.jsx                  # Route definitions + lazy loading
├── main.jsx                 # App entry point + ErrorBoundary
├── components/
│   ├── Layout.jsx           # Header, sidebar shell, Account Settings modal
│   ├── Sidebar.jsx          # Navigation + admin-aware menu
│   ├── ProtectedRoute.jsx   # Auth guard + AdminRoute guard
│   ├── AiChatWidget.jsx     # Floating AI chatbot
│   └── ToastNotification.jsx
├── context/
│   ├── AuthContext.jsx      # Firebase auth state + admin whitelist
│   └── CrowdContext.jsx     # Simulation engine + Firebase real-time sync
├── pages/
│   ├── Dashboard.jsx
│   ├── CrowdMap.jsx
│   ├── QueueSystem.jsx
│   ├── Navigation.jsx
│   ├── Alerts.jsx
│   ├── AiAssistant.jsx
│   ├── AdminDashboard.jsx
│   ├── AuthPage.jsx
│   ├── LandingPage.jsx
│   └── NotFound.jsx
└── services/
    ├── firebase.js          # Firebase app + Auth + Firestore exports
    ├── crowdSimulator.js    # Zone & queue simulation engine
    └── alertEngine.js       # Alert generation logic
```

---

## 👨‍💻 Developer

**Anuj Yadav**
© 2026 PulseArena AI Platform. All rights reserved.