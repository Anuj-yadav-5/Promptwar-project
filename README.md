# 🏟️ PulseArena AI — Smart Stadium Experience Platform

<div align="center">

![PulseArena AI](https://img.shields.io/badge/PulseArena-AI%20Platform-00d4ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTVMMTIgMnpNMiAxN2wxMCA1IDEwLTVNMiAxMmwxMCA1IDEwLTUiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google)
![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-34A853?style=for-the-badge&logo=google-cloud)
![Tests](https://img.shields.io/badge/Tests-105%20Passing-00ff88?style=for-the-badge&logo=vitest)
![Google Translate](https://img.shields.io/badge/Google%20Translate-20%20Languages-4285F4?style=for-the-badge&logo=google)

**AI-driven real-time crowd management and venue operations dashboard for large-scale sporting events.**

🔗 **Live Demo:** [https://promptwar-app-52090498784.us-central1.run.app](https://promptwar-app-52090498784.us-central1.run.app)

</div>

---

## 🌟 Overview

PulseArena AI transforms the physical event experience by solving the core problems of modern large-scale venues:

- 🚶 **Crowd Congestion** — Real-time density monitoring across all stadium zones with live heatmap overlays and Google Charts visualization
- ⏱️ **Long Wait Times** — Virtual queuing with AI-predicted wait times and digital position tracking
- 🧭 **Navigation Confusion** — AI-recommended crowd-aware routing vs standard path comparisons
- 🚨 **Safety Alerts** — Instant critical incident broadcasting with OS-level push notifications
- 🌤️ **Environmental Awareness** — Real-time weather telemetry via Open-Meteo API, anchored to stadium GPS coordinates
- 🤖 **AI Assistant** — Context-aware chatbot powered by Google Gemini 2.5 Flash for instant query resolution
- 🌍 **Multi-Language Support** — Full Google Translate integration across 20 languages with a beautiful custom UI

Built for high-capacity operations exclusively engineered for **15 premier Indian Cricket Stadiums** including **Narendra Modi Stadium (Ahmedabad)**, **Wankhede Stadium (Mumbai)**, and **Eden Gardens (Kolkata)**.

---

## 🚀 Key Features

| Module | Description |
|---|---|
| 📊 **Mission Control Dashboard** | Live KPIs: crowd flow score, attendance counter, alert feed, Google Charts zone density visualization |
| 🌍 **Multi-Venue Management** | Switch between 15 major Indian cricket stadiums with re-anchored Leaflet map views and Google Maps embed |
| 🌤️ **Live Weather Widget** | Open-Meteo API pulling real-time atmospheric data per stadium GPS coordinates |
| 🗺️ **Live Operations Map** | Interactive Leaflet.js map with real-time zone density heat overlays |
| 🎫 **Smart Queue System** | Join queues digitally, track live position, auto-update every 3 seconds |
| ⏱️ **Live Operations Clock** | Precision synchronized digital clock embedded in the global UI header |
| 🔍 **Predictive Global Search** | Instant cross-dashboard search: venues, zones, features, and AI queries |
| 🧭 **Smart Navigation** | Crowd-aware routing with side-by-side path comparisons and time savings |
| 🎫 **Digital E-Tickets** | Authenticated QR pass with "Add to Google Wallet" integration and profile photo display |
| 🚨 **Alert Center** | OS-level browser push notifications (Notification API) for critical crowd alerts |
| 🌍 **Custom Language Selector** | Dark glassmorphism dropdown with 20 languages, ISO color badges, powered by Google Translate |
| 🤖 **AI Assistant** | Gemini 2.5 Flash powered chatbot with rule-based fast paths + AI fallback |
| 🔧 **Admin Console** | Admin-only panel with live Firebase Firestore zone override controls |
| 📈 **Google Charts Analytics** | Live crowd density bar chart with real-time zone data, color-coded by status |

---

## 🤖 AI Integration (4 Workflows)

### Google Gemini 2.5 Flash
The PulseArena AI integrates Gemini into **4 distinct application workflows**:

1. **Dashboard Insights** — Auto-analyzes complex crowd flow and outputs a single 20-word operational tip.
2. **Alert Recommendations** — Provides priority-based action items for active crowd anomalies.
3. **Smart Queues** — Infers the longest queue and outputs dynamic optimization tips for venue staff.
4. **Chatbot Fallback** — Advanced generative Q&A for queries failing the rule-based rapid-response path.

```js
// geminiInsights.js — unified service
const ai = new GoogleGenAI({ apiKey: API_KEY });
export async function generateCrowdInsight(crowdData) { /* ... */ }
export async function generateAlertRecommendation(alert) { /* ... */ }
export async function generateQueueTip(queues) { /* ... */ }
```

---

## 🌍 Multi-Language Support

The platform supports **20 languages** via a fully custom-designed Google Translate integration:

- **Custom UI** — Dark glassmorphism dropdown with searchable list, no default Google widget visible
- **Color-coded ISO Badges** — Each language has a unique color badge (EN, HI, ES, FR, etc.) — works on all platforms including Windows
- **20 Languages** — English, हिन्दी, Español, Français, Deutsch, 中文, العربية, Português, Русский, 日本語, 한국어, Italiano, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ਪੰਜਾਬੀ, اردو, Nederlands
- **Persistent Selection** — Language choice is remembered across page navigations via cookie
- **Clean UI** — Google Translate banner is completely hidden; page layout is unaffected

---

## 🔔 Push Notification System

Real OS-level browser push notifications via the native **Web Notifications API**:

- One-click permission request on the Alerts page
- Critical alerts (High Density, Emergency) trigger native OS notifications even when the tab is in background
- Graceful degradation if notification permissions are denied

---

## 🔐 Security Architecture

| Layer | Implementation |
|---|---|
| **Authentication** | Firebase Auth — Email/Password + Google OAuth2 |
| **Admin Guard** | Exact email whitelist via `VITE_ADMIN_EMAILS` env variable |
| **Route Protection** | `ProtectedRoute` + `AdminRoute` components block all unauthorized access |
| **Error Handling** | React `ErrorBoundary` wraps all routes — no blank screen crashes |
| **Secrets** | All keys via `VITE_*` environment variables — never hardcoded |
| **HTTP Headers** | nginx: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection` |
| **Profile Images** | `referrerPolicy="no-referrer"` + initial-badge fallback for cross-origin Google avatars |

---

## ⚡ Performance, Code Quality, & Efficiency

| Optimization | Detail |
|---|---|
| **React Lazy + Suspense** | All 10 pages code-split, loaded on-demand |
| **Vite Manual Chunks** | `firebase` / `vendor` / `maps` / `icons` chunks — vendor reduced from 633 kB → 168 kB |
| **PropTypes & Hooks** | `PropTypes` validation on all shared UI components + custom `useCrowd`/`useAuth` hooks |
| **esbuild Minification** | `build.minify: 'esbuild'` with `target: 'esnext'` |
| **nginx gzip** | Compresses JS, CSS, JSON, SVG in transit |
| **Asset Caching** | 1-year `Cache-Control: immutable` on all hashed bundles |
| **Google Charts Safety** | Library/rendering split into two decoupled `useEffect` hooks with a global lock to prevent re-injection |
| **Stable Effects** | Firebase listeners and simulation intervals isolated in `[isReady]`-gated effects — no memory leaks |
| **React.memo** | `AiChatWidget` memoized to prevent re-renders on parent state changes |
| **Throttled Simulation** | ~5% alert chance per 3s tick (~45s average interval) |

---

## 🧪 Testing

**105 tests across 8 test files** — all passing.

```bash
npm run test
# Test Files  8 passed (8)
# Tests       105 passed (105)
# Exit code:  0
```

| Test File | Coverage |
|---|---|
| `chatbotEngine.test.js` | 24 tests — all chatbot routes, edge cases, null inputs, AI fallback behavior |
| `crowdSimulator.test.js` | 24 tests — zone data, queue data, flow history, activity feed, predictions |
| `alertEngine.test.js` | 16 tests — alert generation, batch seeding, constants, priority validation |
| `firestoreService.test.js` | 12 tests — Firestore reads/writes, silent failure behavior, null guards |
| `authContext.test.jsx` | 11 tests — login, register, logout, password reset, friendly error mapping |
| `remoteConfigService.test.js`| 9 tests — Firebase Remote Config sync, boolean/number/string reads, defaults |
| `geminiInsights.test.js` | 8 tests — Dashboard, Alert, and Queue Gemini workflows including missing keys/fallbacks |
| `App.test.jsx` | 1 test — component mounts and renders without crash |

---

## 🌐 Google Services Integration

| Service | Usage |
|---|---|
| **Google Gemini 2.5 Flash** | AI generative insights (Dashboard, Alert Center, Queues, Chatbot) |
| **Google Translate API** | Full-page translation across 20 languages with custom-designed selector UI |
| **Google Charts** | Live zone crowd density bar chart on Dashboard (real-time, color-coded) |
| **Google Maps Embed** | Venue location display on Dashboard with directions link |
| **Google Wallet API (Mock)** | Interactive UI capability configured on E-Ticket dashboard |
| **Google Cloud Vision API (Mock)** | Indicated active CCTV density calculation in Admin panel |
| **Firebase App Config** | Firebase Remote Config for remote venue mode and AI toggles |
| **Firebase Authentication** | Email/Password + Google OAuth2 Sign-In + Password Reset |
| **Firebase Analytics** | Page view and custom event tracking via `logEvent` + `trackEvent` |
| **Firebase Perf Monitoring** | Automatic page load tracing + network request monitoring |
| **Cloud Firestore** | Admin zone overrides, broadcast alerts, user logs, venue preferences |
| **Google Cloud Run** | Zero-downtime, auto-scaling unmanaged production deployment |
| **Google Tag Manager** | Enterprise event routing tag script in `index.html` |
| **Google reCAPTCHA v3** | Invisible bot protection script for authentication workflows |
| **Firebase Storage** | Initialized Cloud Storage SDK for admin venue media distribution |
| **Firebase Realtime Database** | Initialized RTDB websocket for ultra-low latency live poll metrics |
| **Firebase Cloud Messaging** | Notification permission request handler for live push alerts |
| **Google Material Symbols** | UI enhancements utilizing dynamically loaded variable fonts/icons |

---

## ♿ Accessibility

All interactive elements follow WCAG 2.1 AA standards:

- `aria-label` on all buttons, inputs, and icon-only controls
- `role="navigation"` + `aria-label="Main navigation"` on sidebar nav
- `aria-current="page"` on active route link
- `aria-expanded` on mobile menu toggle
- `role="alert"` on Error Boundary fallback UI
- `htmlFor` / `id` pairing on all form inputs
- `aria-label` on `Show/Hide password` toggle
- Keyboard accessible throughout (all interactive elements are focusable)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Routing | React Router v6 |
| State | React Context API + `useReducer` |
| Styling | Vanilla CSS — custom Dark Cyber design system + Tailwind utilities |
| Maps | Leaflet.js via `react-leaflet` |
| Charts | Google Charts (live zone density) |
| Icons | Lucide React |
| AI/ML | Google Gemini 2.5 Flash (`@google/genai`) |
| Translation | Google Translate API with custom glassmorphism UI |
| Backend | Google Firebase (Auth, Firestore, Analytics, Performance) |
| Build | Vite with esbuild minification + Rollup code splitting |
| Testing | Vitest + Testing Library + jsdom |
| Deployment | Google Cloud Run (Docker + nginx) |

---

## 💻 Getting Started

### Prerequisites
- Node.js v20+
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Anuj-yadav-5/Promptwar-project.git
cd Promptwar-project

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your Firebase + Gemini API keys (see .env.example)

# 4. Start development server
npm run dev
```

### Environment Variables

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAILS=admin@yourdomain.com
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Running Tests

```bash
npm run test          # Run all 105 tests once
npm run test:watch    # Watch mode during development
```

---

## ☁️ Cloud Deployment

### Google Cloud Run (Production)

```bash
# Authenticate
gcloud auth login

# Deploy from source (Docker build happens in Cloud Build)
gcloud run deploy promptwar-app \
  --source . \
  --region us-central1 \
  --project pulsearena-ai-493808
```

### Firebase Hosting (Static CDN alternative)

```bash
npm run build
firebase deploy --only hosting
```

---

## 🎨 Design System

Ultra-premium **Dark Cyber** aesthetic — custom Vanilla CSS with glassmorphism.

| Token | Value |
|---|---|
| Base Background | Deep Navy `#0a0e27` |
| Primary Accent | Neon Cyan `#00d4ff` |
| Secondary Accent | Electric Purple `#7b2ff7` |
| Alert / Action | Hot Pink `#ff2d95` |
| Success | Electric Green `#00ff88` |
| Display Font | `Orbitron` (Google Fonts) |
| Body Font | `Inter` (Google Fonts) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AiChatWidget.jsx      # Floating AI chat assistant
│   ├── ErrorBoundary.jsx     # React error boundary (crash protection)
│   ├── Layout.jsx            # Global app frame (header, language selector, toasts)
│   ├── ProtectedRoute.jsx    # Auth + Admin route guards
│   ├── Sidebar.jsx           # Navigation sidebar with ARIA roles
│   ├── StatCard.jsx          # Animated KPI stat card component
│   ├── DensityBadge.jsx      # Color-coded zone density status badge
│   └── WeatherWidget.jsx     # Live weather via Open-Meteo API
├── context/
│   ├── AuthContext.jsx       # Firebase auth state management
│   └── CrowdContext.jsx      # Global crowd simulation + Firestore sync
├── pages/                    # Lazy-loaded route components
│   ├── Dashboard.jsx         # Mission control + Google Charts + Google Maps
│   ├── Alerts.jsx            # Alert center + OS push notifications
│   ├── Ticket.jsx            # E-Ticket with QR + Google Wallet
│   ├── AiAssistant.jsx       # Gemini AI chatbot interface
│   ├── CrowdMap.jsx          # Leaflet interactive stadium map
│   ├── QueueSystem.jsx       # Virtual queue management
│   ├── Navigation.jsx        # Crowd-aware smart routing
│   └── AdminDashboard.jsx    # Admin-only Firestore control panel
├── services/
│   ├── alertEngine.js        # Random alert generation with JSDoc
│   ├── chatbotEngine.js      # Gemini AI + rule-based hybrid engine
│   ├── crowdSimulator.js     # Real-time crowd data simulation
│   ├── firebase.js           # Firebase app + Auth + Firestore + Analytics
│   ├── firestoreService.js   # Firestore CRUD helpers (silent-fail)
│   ├── geminiInsights.js     # Gemini AI workflows (dashboard/alert/queue)
│   └── remoteConfigService.js# Firebase Remote Config sync
├── tests/                    # 105 tests across 8 files
└── constants/
    └── venues.js             # 15 Indian cricket stadium definitions
```

---

## 👨‍💻 Developer

**Anuj Yadav**  
© 2026 PulseArena AI Platform. All rights reserved.