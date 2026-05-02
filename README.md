# Integrat Dental Ecosystem

Integrat is a multi-page dental clinic and academy application built with static HTML/CSS/JS on the frontend and one Express backend.

## What is in the project

- public clinic pages
- doctors listing and doctor detail flow
- client appointment booking and cancellation
- academy login, course purchase requests, and gated course pages
- admin panel for appointments and academy payment requests

The client dashboard is part of the doctors page. Logged-in clients can open `doctors.html#clientDashboard` to review and cancel appointments.

## Stack

- Node.js 20
- Express
- Vanilla JavaScript
- HTML/CSS
- optional Supabase integration
- optional Telegram notifications

## Project structure

```text
.
├── api/
├── assets/
├── docs/
├── src/
│   ├── backend/academy/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── package.json
└── vercel.json
```

There is no source `public/` folder. The app serves `src/` and `assets/` directly.

## Pages

- `src/pages/index.html` - home
- `src/pages/clinic.html` - clinic
- `src/pages/doctors.html` - doctors and client dashboard
- `src/pages/doctor.html` - single doctor page
- `src/pages/academy.html` - academy
- `src/pages/videos.html` - academy course viewer
- `src/pages/about.html` - about
- `src/pages/faq.html` - FAQ
- `src/pages/auth.html` - clinic auth
- `src/pages/admin.html` - admin
- `src/pages/laboratory.html` - kept intentionally
- `src/pages/store.html` - kept intentionally

## Local run

Install dependencies from the repo root:

```bash
npm install
```

Start the app:

```bash
npm start
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/src/pages/doctors.html`
- `http://localhost:3000/src/pages/academy.html`
- `http://localhost:3000/src/pages/admin.html`

`npm run build` is a no-op kept for deployment parity.

## Environment

Minimum production variables:

```env
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SUPABASE_SYNC_ENABLED=1
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROFILES_TABLE=profiles
SUPABASE_PROFILE_ID_COLUMN=id
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_APPOINTMENTS_TABLE=appointments
SUPABASE_COURSES_TABLE=courses
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_PAYMENT_SETTINGS_TABLE=payment_settings
SUPABASE_COURSE_ACCESS_TABLE=course_access
```

Optional:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_THREAD_ID=
TELEGRAM_STARTUP_NOTIFY=1
FAKE_BACKEND_LINK=
ALLOWED_CORS_ORIGINS=
INTEGRAT_DATA_DIR=
```

If Supabase is not configured, the backend falls back to local JSON storage in `src/backend/academy/data/`.

## Deployment

The project is prepared for Vercel:

- static files are served directly from the repository
- API routes go through `api/index.js`
- `/` rewrites to `src/pages/index.html`

Supporting docs:

- [docs/vercel-deploy.md](docs/vercel-deploy.md)
- [docs/supabase-schema.md](docs/supabase-schema.md)
- [docs/project-explanation.md](docs/project-explanation.md)

## Notes

- install dependencies only in the repo root
- `store.html` and `laboratory.html` are intentionally retained
- the site is locked to English
- shared video sections use the same configured home-page video source

## Student IDs

- 230103179
- 230103120
- 230103083
- 230103081
