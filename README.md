# Integrat Dental Ecosystem

Deploy-ready frontend + backend in one repository.

- Frontend: static pages in `src/pages`, shared scripts in `src/scripts`, styles in `src/styles`.
- Backend: unified Express API + static hosting in `src/backend/academy/server.js`.
- Legacy FastAPI backend remains in `src/backend/api` (not required for the main deploy flow).
- UI language: English/Russian toggle with persisted selection and dynamic re-render support.

## Quick Start

1. Install backend dependencies:

```bash
cd src/backend/academy
npm install
```

2. Configure environment:

```bash
cd /Users/serzhansrsnbv/Desktop/dental_proj
edit .env
edit src/scripts/shared/config.local.js
```

3. Start server:

```bash
cd src/backend/academy
npm start
```

4. Open app:

- `http://localhost:3000/src/pages/index.html`
- Academy admin: `http://localhost:3000/src/pages/admin.html`

On startup the backend now prints:

- local backend URL
- fake demo backend link
- Telegram configuration status
- Supabase data mode status
- request logs for every HTTP call

## Default Admin

- Email: `admin@integrat.local`
- Password: `Admin123!`

Override via `.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

Frontend runtime values are kept in:

- `src/scripts/shared/config.local.js`

## Telegram Notification Setup

Set these in `.env` when your bot API is ready:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_THREAD_ID` (optional, for forum topics)
- `TELEGRAM_STARTUP_NOTIFY=1` if you want startup link notifications sent to Telegram

After contact submissions and new academy payment requests, backend sends manager notifications to Telegram and logs delivery results in server console.

`POST /api/notifications/telegram-code` is admin-protected.

## Supabase Data Mode

When `SUPABASE_SYNC_ENABLED=1`, academy and contact data are handled through Supabase tables (see `docs/supabase-schema.md`).

Set these in `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SYNC_ENABLED=1`
- `SUPABASE_PROFILES_TABLE=profiles`
- `SUPABASE_PROFILE_ID_COLUMN=id`
- `SUPABASE_CONTACTS_TABLE=contacts`
- `SUPABASE_COURSES_TABLE=courses`
- `SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests`
- `SUPABASE_PAYMENT_SETTINGS_TABLE=payment_settings`
- `SUPABASE_COURSE_ACCESS_TABLE=course_access`
- `KASPI_PAYMENT_NUMBER`
- `KASPI_PAYMENT_NAME`
- `KASPI_PAYMENT_INSTRUCTIONS`

Local JSON storage remains as fallback for offline/testing.

## Main API Endpoints

### Clinic/Auth (Bearer token)

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /contacts`
- `GET /contacts` (admin bearer)
- `GET /doctors`
- `POST /appointments` (auth bearer)
- `GET /appointments` (auth bearer)
- `GET /dashboard/summary` (admin bearer)

### Academy (Cookie session)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/courses`
- `GET /api/payment/settings`
- `GET /api/courses/purchases/me`
- `POST /api/courses/:courseId/purchase`
- `GET /api/courses/:courseId/access`

### Admin (Cookie session, role=admin)

- `GET /api/admin/users`
- `GET /api/admin/payment-requests`
- `POST /api/admin/payment-requests/:paymentRequestId/decision`

### Telegram utility

- `POST /api/notifications/telegram-code` (admin session required)

## Documentation

- Deployment + operations: `docs/deploy-and-use.md`
- Defense notes for presentation: `docs/project-defense.md`
- Backend details: `docs/academy-backend.md`
- Supabase SQL: `docs/supabase-schema.md`
