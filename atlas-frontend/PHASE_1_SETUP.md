# ATLAS — Phase 1: Foundation

What's in this phase: project scaffold, design system, full navigation shell
(7 tabs), and working Google Sign-In via Firebase.

## 1. Install dependencies

```bash
cd atlas-frontend
npm install
```

## 2. Create a Firebase project (5 minutes)

1. Go to https://console.firebase.google.com → **Add project** → name it
   anything (e.g. `atlas-hackathon`).
2. Once created, click the **web icon (`</>`)** to register a web app.
3. Copy the `firebaseConfig` values shown — you'll paste these into `.env`.
4. In the left sidebar: **Authentication → Get started → Sign-in method
   → Google → Enable**. Add your own email as a test user if prompted.
5. Still in Authentication: **Settings → Authorized domains** → confirm
   `localhost` is listed (it usually is by default).

## 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and paste in the values from step 2:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=atlas-hackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=atlas-hackathon
VITE_FIREBASE_STORAGE_BUCKET=atlas-hackathon.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 4. Run it

```bash
npm run dev
```

Open http://localhost:5173 — you should see the ATLAS login screen.
Click **Continue with Google**, sign in, and you'll land on the Overview
dashboard with the full sidebar (Digital Twin, Predictive Engine, AI
Council, Emergency Response, Knowledge Center all present as "soon"
placeholders — they're built in later phases).

## What to check works

- [ ] Login screen renders with the glass card and Google button
- [ ] Google sign-in popup appears and completes
- [ ] After sign-in, Overview page shows with KPI cards
- [ ] Sidebar navigation switches between all 7 tabs
- [ ] On a narrow browser window (or phone), sidebar collapses to a
      hamburger menu
- [ ] Sign-out (top-right avatar menu) returns you to the login screen

## Project structure

```
src/
├── lib/
│   ├── firebase.ts       Firebase init + Google sign-in helpers
│   └── nav.ts            Sidebar navigation config (single source of truth)
├── context/
│   └── AuthContext.tsx   App-wide auth state
├── components/
│   ├── layout/           AppShell, Sidebar, TopBar, VitalsWaveform
│   ├── ui/               GlassPanel (reusable glass surface)
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   ├── Overview.tsx      Home dashboard (KPIs are mock data for now)
│   └── ModulePlaceholder.tsx
└── App.tsx               Routes
```

## Design tokens

All colors/fonts live as CSS variables in `src/index.css` (`:root`). If you
want to tweak the accent color or fonts, that's the one place to change it.

## Next: Phase 2

The live **Simulation Engine** — the data spine that generates real-time
sensor readings for every asset, and that the Digital Twin, ML service, and
AI Council will all read from. Say "build phase 2" when ready.
