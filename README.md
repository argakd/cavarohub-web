# CavaroHub Web

React frontend for CavaroHub, an event management platform: hosts create and promote events, attendees browse, register, and pay for tickets.

Pairs with [`cavarohub-api`](../cavarohub-api) for the backend — set `VITE_API_URL` to wherever that's running.

## Stack

- **React 19** + TypeScript
- **Vite 8**
- **TailwindCSS v4** + **shadcn/ui** (Radix UI primitives + `components.json`)
- **Zustand** — auth store, persisted to `localStorage`
- **TanStack Query** — server-state cache for all API reads/writes
- **React Hook Form** + **Zod 4** resolvers — every form
- **react-router** (the unified v7+ package)
- **Axios** — one configured instance auto-attaches the login token to every request
- **react-hot-toast** — toast notifications

## Project layout

```
cavarohub-web/
├── components.json        # shadcn/ui config
├── src/
│   ├── api/                # axios calls per resource (auth, events, transactions, reviews, dashboard)
│   ├── components/
│   │   └── ui/             # shadcn/ui components (button, card, dialog, tabs, select, ...)
│   ├── store/               # Zustand auth store
│   ├── hooks/               # TanStack Query hooks per resource
│   ├── pages/                # landing (hero), login/register/profile, event detail, checkout, dashboard, etc.
│   ├── lib/                  # cn() className helper
│   ├── types/                 # shared TS types
│   └── utils/                 # formatting helpers
└── vite.config.ts
```

## Local setup

```bash
cp .env.example .env   # point VITE_API_URL at your running cavarohub-api
npm install
npm run dev
```

Opens on `http://localhost:5173`. See the root-level `RUN_AND_DEPLOY_GUIDE.md` (one directory up, alongside this repo) for the complete walkthrough, including deploying to Vercel.

## Feature overview

Hero landing page, category/location filters, debounced search, responsive layout, empty states; event detail with ticket selection and checkout; host dashboard (event/transaction/revenue/attendee totals, day/month/year chart); host event management (create, delete, vouchers, accept/reject transactions); registration with a Host/Attendee toggle; referral codes, points, and profile editing; forgot/reset password.

No automated test suite is included, matching the reference projects this structure follows.
