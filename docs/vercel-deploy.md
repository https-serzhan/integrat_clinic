# Vercel Deployment

## Deployment Model

This project is deployed on Vercel as:

- static frontend files served directly from `src/` and `assets/`
- backend API through `api/index.js`

## Before Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the project root to the repository root.

## Vercel Settings

- Framework Preset: `Other`
- Build Command: `npm run build`
- Install Command: `npm install`

`npm run build` is intentionally a no-op. No generated `public/` directory is required.

## Required Environment Variables

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
```

## Database Preparation

Run the SQL from:

- `docs/supabase-schema.md`

Then create the admin account through the academy UI and promote it in Supabase.

## Production Notes

- Supabase must be treated as the source of truth.
- Local JSON storage is only a fallback mechanism.
- `laboratory.html` and `store.html` remain in the project intentionally.
- `/` is rewritten to `src/pages/index.html` through `vercel.json`.
