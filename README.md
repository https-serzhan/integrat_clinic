# Integrat Dental Ecosystem

Integrat is a multi-page dental website with a single Node.js backend.

It includes:
- clinic pages and public contact forms
- doctor listing and authenticated appointment requests
- academy signup, login, course purchasing, and gated video access
- admin approval flow for academy payments
- Telegram notifications for manager events
- Supabase storage for production data

## Repository Structure

- `src/pages` for HTML pages
- `src/styles` for CSS
- `src/scripts` for frontend logic
- `src/backend/academy` for the Node.js server and local fallback data
- `docs/deploy-and-use.md` for deployment steps
- `docs/railway-deploy.md` for Railway deployment
- `docs/academy-backend.md` for backend details
- `docs/project-defense.md` for project presentation notes
- `docs/supabase-schema.md` for the Supabase SQL schema
- `Dockerfile` for root-level container deployment
- `.env.example` for deploy-time variables

## Local Run

1. Create `.env` in the repository root.
2. Update `src/scripts/shared/config.js` if you want to change frontend contact or social links.
3. Apply the SQL from `docs/supabase-schema.md` if you want Supabase-backed data.
4. Install backend dependencies.
5. Start the backend.

```bash
cd src/backend/academy
npm ci
npm start
```

## Main URLs

- Home: `http://localhost:3000/src/pages/index.html`
- Clinic: `http://localhost:3000/src/pages/clinic.html`
- Doctors: `http://localhost:3000/src/pages/doctors.html`
- Academy: `http://localhost:3000/src/pages/academy.html`
- About: `http://localhost:3000/src/pages/about.html`
- Admin: `http://localhost:3000/src/pages/admin.html`

## Current Runtime Requirements

Backend `.env` should include at minimum:

```env
PORT=3000
JWT_SECRET=change-me
ADMIN_EMAIL=admin@integrat.local
ADMIN_PASSWORD=Admin123!
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_THREAD_ID=
TELEGRAM_STARTUP_NOTIFY=1
FAKE_BACKEND_LINK=https://integrat-demo.example.com
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SYNC_ENABLED=1
SUPABASE_PROFILES_TABLE=profiles
SUPABASE_PROFILE_ID_COLUMN=id
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_APPOINTMENTS_TABLE=appointments
SUPABASE_COURSES_TABLE=courses
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_PAYMENT_SETTINGS_TABLE=payment_settings
SUPABASE_COURSE_ACCESS_TABLE=course_access
KASPI_PAYMENT_NUMBER=+77711140710
KASPI_PAYMENT_NAME=Serzhan S.
KASPI_PAYMENT_INSTRUCTIONS=Transfer the course amount to Kaspi and then send the payment request from Academy.
ALLOWED_CORS_ORIGINS=
INTEGRAT_DATA_DIR=
```

Frontend runtime config is stored in:

- `src/scripts/shared/config.js`

## What The Backend Does

- serves the frontend pages and assets
- stores contacts
- stores clinic auth users and appointments
- handles academy auth, purchases, and access checks
- exposes admin endpoints for appointments, users, grants, purchases, and payment requests
- sends Telegram notifications for contact, appointment, and payment events
- prints startup and request logs to the terminal

## Verification

Run the automated checks:

```bash
node --test tests/*.test.js
```

## Deployment

Use `docs/deploy-and-use.md` for the full deployment procedure.
For Railway, use `docs/railway-deploy.md`.
The repository also includes a root `package.json` so Railway can run it correctly even when it chooses Node/Railpack instead of the `Dockerfile`.
