# Integrat Dental Platform

React + TypeScript SPA for a multi-surface dental ecosystem:

- clinic presentation and treatment catalog
- doctors directory with filtering and booking flow
- academy course marketplace with filtering and sorting
- course viewer with gated access flow
- local admin workspace for appointments and payment approvals
- backend notifications through Telegram and Supabase

The project is split into a React client and a Node server. The client keeps local UI state in `localStorage`, while important business events are sent to the server for Telegram notification and Supabase storage.

## Stack

- React
- TypeScript
- React Router
- Vite
- Node HTTP server
- Telegram Bot API
- Supabase REST API
- local mock data layer with persistent `localStorage`

## Project structure

- `client/` - React + TypeScript frontend
- `client/src/main.tsx` - React entrypoint
- `client/src/App.tsx` - application routes
- `client/src/pages/` - React page components only
- `client/src/components/` - shared UI components
- `client/src/data/` - local site data used by pages and mock API layer
- `client/src/lib/` - frontend helpers and API client
- `client/src/styles/` - global and page styles
- `client/public/assets/` - static images, icons, and PDFs served by Vite
- `server/` - Node backend for Telegram notifications and Supabase writes
- `supabase/` - SQL schema for required tables

## Pages

- `/` - home
- `/clinic` - clinic overview
- `/doctors` - doctors listing, filters, and patient dashboard
- `/doctor?doctor=<id>` - doctor case page
- `/academy` - course catalog with filters and sorting
- `/videos?course=<id>` - course viewer
- `/about` - about page
- `/faq` - FAQ landing
- `/auth` - clinic auth
- `/admin` - admin workspace
- `/laboratory` - laboratory showcase
- `/store` - store showcase

## Local run

Install dependencies from the project root:

```bash
npm install
```

Run the backend in one terminal:

```bash
npm run server:dev
```

Run the frontend in another terminal:

```bash
npm run client:dev
```

Open `http://localhost:5173`. The frontend sends event requests to `/api/events`, and Vite proxies that path to `http://localhost:4000` during local development.

Production preview:

```bash
npm run build
npm run client:preview
```

## Mock accounts

- Admin: `admin@integrat.local` / `Admin123!`
- Patient: `patient@integrat.local` / `Patient123!`
- Student: `student@integrat.local` / `Student123!`

## Contact Forms

All contact forms use shared validation for name, Kazakhstan phone number, comment length, and consent.

Integrated events go through `server/events.js` so secrets stay server-side. The server sends the Telegram notification first and then writes to Supabase.

Handled events:

- contact form request
- new user registration
- doctor appointment request
- course payment request
- admin payment approval/rejection

Required frontend env:

```bash
VITE_EVENTS_API_URL=/api/events
VITE_REQUIRE_REMOTE_EVENTS=1
```

Required server-only env:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROFILES_TABLE=profiles
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_CONTACTS_NAME_COLUMN=fullname
SUPABASE_CONTACTS_COMMENT_COLUMN=comment
SUPABASE_APPOINTMENTS_TABLE=appointments
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_COURSE_ACCESS_TABLE=course_access
```

Create Supabase tables with `supabase/schema.sql`.

If your existing `contacts` table uses `full_name` or `name` instead of `fullname`, either set `SUPABASE_CONTACTS_NAME_COLUMN` or let the server auto-retry common column names. The server also retries `comment` and `message` for the message column.

Do not expose Telegram bot tokens or Supabase service-role keys with a `VITE_` prefix.

## Vercel deployment

The project is configured for a single Vercel deployment:

- static frontend from `client/dist`
- backend functions from `api/events.js` and `api/health.js`
- SPA routing handled by `vercel.json`

Required Vercel environment variables:

```text
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_THREAD_ID=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PROFILES_TABLE=profiles
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_CONTACTS_NAME_COLUMN=fullname
SUPABASE_CONTACTS_COMMENT_COLUMN=comment
SUPABASE_APPOINTMENTS_TABLE=appointments
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_COURSE_ACCESS_TABLE=course_access
```

Optional frontend env:

```text
VITE_EVENTS_API_URL=/api/events
VITE_REQUIRE_REMOTE_EVENTS=1
```

Deploy steps:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Use the repository root as the Vercel project root.
4. Let Vercel read `vercel.json`.
5. Add the environment variables above in the Vercel dashboard.
6. Deploy.

After deployment:

- frontend routes work directly on the Vercel domain
- forms post to `/api/events`
- Telegram notifications and Supabase writes run inside Vercel Functions
