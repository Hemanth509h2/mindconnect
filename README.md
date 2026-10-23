# MindConnect

An events platform for mental health — like Unstop, but for workshops,
webinars, conferences and conclaves. Organizers list events; participants
discover them and register.

Two deployables that talk **only over HTTP**:

```
├── frontend/   # Next.js UI — port 3200
│   └── src/
│       ├── app/             # pages + server actions (app/actions/)
│       ├── components/
│       └── lib/api.ts       # api(): server-side calls to API_URL with the user's token
└── backend/    # Next.js API server (route handlers only) + Prisma — port 4200
    ├── src/middleware.ts    # CORS for ALLOWED_ORIGINS
    ├── src/app/api/         # route handlers (folder path = URL)
    ├── src/lib/             # auth (JWT), events (validation + serialising), db, http helpers
    └── prisma/              # schema + demo seed
```

Ports are 3200/4200 so MindConnect can run next to the STAAD platform
(3000/4000/4100).

## Run locally

```bash
# 1. Backend (API at http://localhost:4200)
cd backend
cp .env.example .env        # Neon URL + AUTH_SECRET (openssl rand -base64 32)
npm install
npm run db:push             # creates the tables (once, and after schema changes)
npm run dev

# 2. Frontend (UI at http://localhost:3200)
cd frontend
cp .env.example .env
npm install
npm run dev
```

The database starts empty: sign up as an organizer to create the first event.
(`npm run db:seed` adds demo events but deletes all data first, so it only
runs against a database on your machine or a schema ending in `_dev` — never
the shared Neon database.)

## How auth works

The backend issues a JWT from `POST /api/auth/signup` or `/api/auth/login`.
The frontend's server actions keep it in an httpOnly cookie (`mc_session`)
and send it to the backend as `Authorization: Bearer <token>`. The browser
never calls the backend directly, so the token is never exposed to page
scripts and the frontend only needs `API_URL` on its server.

## Database

One Neon Postgres database (`ep-falling-rain…`, US East — Ohio), used both
when you run MindConnect locally and by the live site. Anything you do
locally — sign-ups, test events, registrations — is real data.

## Features

**Participants** — browse and search events (type, topic, mode, fee,
upcoming/past), event pages with speakers, agenda and organizer profile,
register in one step (seat limits and deadlines enforced), see meeting links
once registered, cancel, and track everything under *My registrations*.

**Organizers** — sign up as an organizer (or upgrade from a participant
account), create events as drafts or publish straight away, edit, cancel or
restore, delete unused drafts, see registrants and download them as CSV, and
a public organizer profile page.

**Platform** — Tele-MANAS helpline on every page, all times in IST, fees are
shown but collected by the organizer (no online payments yet).

## API

All responses are JSON; errors are `{ "error": "message" }`.

| Method | Path | Auth | |
| ------ | ---- | ---- | - |
| POST | `/api/auth/signup` | — | `{ name, email, password, role?, orgName? }` → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET / PATCH | `/api/me` | user | Profile |
| POST | `/api/me/become-organizer` | user | `{ orgName }` |
| GET | `/api/me/registrations` | user | Your registrations with event summaries |
| GET | `/api/events` | — | `?q&type&mode&topic&price=free\|paid&when=upcoming\|past&page&pageSize` |
| GET | `/api/events/:slug` | optional | Event; meeting link only for the organizer and registered users |
| POST | `/api/events/:slug/register` | user | `{ name, email, phone, organization?, note?, consent: true }` |
| POST | `/api/registrations/:id/cancel` | user | Cancel your own registration |
| GET | `/api/organizers/:id` | — | Public organizer profile + published events |
| GET | `/api/stats` | — | Counts for the home page |
| GET / POST | `/api/organizer/events` | organizer | Your events / create one |
| GET / PUT / DELETE | `/api/organizer/events/:id` | organizer | Load, update, delete (drafts without registrations only) |
| PATCH | `/api/organizer/events/:id/status` | organizer | `{ status: DRAFT \| PUBLISHED \| CANCELLED }` |
| GET | `/api/organizer/events/:id/registrations` | organizer | Registrants; `?format=csv` downloads them |

## Deploy to Vercel

Create **two Vercel projects** from this repo, one per folder (Project
Settings → Root Directory: `backend` for one, `frontend` for the other). Each
folder's `vercel.json` sets the build and runs functions in Cleveland
(`cle1`), next to the database in Neon's us-east-2.

1. **Backend project** env vars: `DATABASE_URL` (the same URL as in
   `backend/.env`), `AUTH_SECRET` (a new one: `openssl rand -base64 32`),
   `ALLOWED_ORIGINS` (the frontend's URL).
2. **Frontend project** env var: `API_URL` — the backend's production
   domain, e.g. `https://mindconnect-backend.vercel.app`. Use the production
   domain rather than a deployment URL: Vercel's Deployment Protection can
   put deployment and preview URLs behind a Vercel login.

Deploy the backend first so its URL exists when you set `API_URL`.

## Not built yet

Online payments (Cashfree), email confirmations and reminders, password reset
and email verification, admin moderation of listings, image uploads (banners
and speaker photos are links for now), and rate limiting on login.
