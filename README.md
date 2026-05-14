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

Open `http://localhost:5173`. The frontend sends event requests to `http://localhost:4000/api/events` by default.

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
VITE_EVENTS_API_URL=http://localhost:4000/api/events
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

Do not expose Telegram bot tokens or Supabase service-role keys with a `VITE_` prefix. GitHub Pages can host the client only; deploy the server separately for the Telegram/Supabase flow.

## GitHub Pages

The client is configured for GitHub Pages with a workflow in `.github/workflows/deploy-pages.yml`.

For forms, registrations, appointments, and payment requests to work on GitHub Pages, deploy the `server/` folder separately and add its event endpoint as a repository variable:

```text
VITE_EVENTS_API_URL=https://your-server-domain.com/api/events
```

Expected Pages URL after deployment:

`https://https-serzhan.github.io/integrat_clinic/`
