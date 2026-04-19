# 🏟️ PulseArena AI — Smart Stadium Experience Platform

> **AI-driven real-time crowd management and venue operations dashboard for large-scale sporting events.**

Built specifically for high-capacity operational management across global venues including **Narendra Modi Stadium (Ahmedabad)**, **Wankhede Stadium (Mumbai)**, and **Eden Gardens (Kolkata)**.

---

## 🌟 Overview

PulseArena AI transforms the physical event experience by solving the core problems of modern large-scale venues:

- 🚶 **Crowd Congestion** — real-time density monitoring across all stadium zones, offset accurately per stadium coordinates
- ⏱️ **Long Wait Times** — virtual queuing with live wait time predictions
- 🧭 **Navigation Confusion** — AI-recommended crowd-aware routing
- 🚨 **Safety Alerts** — instant critical incident broadcasting to all connected users
- 🌤️ **Environmental Awareness** — real-time weather telemetry fetching for optimal event readiness

---

## 🚀 Key Features

| Module | Description |
|---|---|
| 📊 **Mission Control Dashboard** | Live KPIs, crowd flow score, attendance counter, AI activity feed |
| 🌍 **Multi-Venue Management** | Dynamically switch between multiple international stadiums with re-anchored maps |
| 🌤️ **Live Weather Widget** | Integrated Open-Meteo API pulling real-time venue-specific atmospheric data |
| 🗺️ **Live Operations Map** | Interactive Leaflet.js map with real-time zone density heat overlays |
| 🎫 **Smart Queue System** | Virtual queuing — join digitally, track queue length and wait times live |
| ⏱️ **Live Operations Clock** | Precision synchronized digital operation-time embedded in the global UI |
| 🔍 **Predictive Global Search** | Real-time global dashboard search bar to instantly query and navigate |
| 🧭 **Smart Navigation** | Crowd-aware routing comparing standard vs AI-recommended paths |
| 🚨 **Alert Center** | Centralized hub for crowd, safety, and system notifications |
| 🤖 **AI Assistant** | Context-aware, fully animated AI agent answering queries and pulling live API data |
| 🔧 **Admin Console** | Admin-only data management panel driven via Google Firebase |

---

## 🔐 Security Architecture

- **Google Firebase Authentication** — Email/Password + Google OAuth2 Sign-In
- **Exact Email Whitelist** — Admin panel access is locked to a hardcoded verified email address. No fuzzy matching, no PIN, no localStorage bypass
- **Route-Level Guard** — `AdminRoute` component blocks direct URL access to `/stadium/admin` for non-admins
- **Protected Routes** — All dashboard paths require a valid authenticated session

---

## ⚡ Performance & Efficiency

- **React Lazy + Suspense** — Every page is code-split and loaded on-demand, minimising initial bundle size
- **Stable Effect Dependencies** — Firebase listeners and simulation intervals are in independent `useEffect` hooks with stable `[isReady]` dependencies, preventing memory leaks and duplicate subscriptions
- **Throttled Alerts** — Random alert generation runs at ~5% probability per 3-second tick (~45s average interval)
- **Toast Auto-Dismiss** — All toasts expire and are removed from state after 5 seconds

---

## 🔗 External APIs & Services

| Service | Usage |
|---|---|
| **Open-Meteo API** | Free, open-source real-time weather tracking mapped to the exact stadium GPS coordinates |
| **Firebase Authentication** | Google OAuth2 Sign-In, Email/Password, Password Reset |
| **Firebase Analytics** | Page view tracking via `logEvent` |
| **Cloud Firestore** | Admin panel zone overrides, broadcast alerts, admin email registry |
| **Leaflet & OpenStreetMap** | Geospatial visualization framework and map tiles |

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
| Backend | Google Firebase |

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

The application uses an ultra-premium **Dark Cyber** aesthetic driven entirely by custom Vanilla CSS and interactive glassmorphism components.

| Token | Value |
|---|---|
| Base Background | Deep Navy `#0a0e27` |
| Primary Accent | Neon Cyan `#00d4ff` |
| Secondary Accent | Electric Purple `#7b2ff7` |
| Alert / Action | Hot Pink `#ff2d95` |
| Display Font | `Orbitron` (Google Fonts) |
| Body Font | `Inter` (Google Fonts) |

---

## 👨‍💻 Developer

**Anuj Yadav**
© 2026 PulseArena AI Platform. All rights reserved.