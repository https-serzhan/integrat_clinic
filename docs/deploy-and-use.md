# Deploy And Use

## 1. Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (for production data mode)
- Telegram bot token + manager `chat_id`

## 2. Setup order (important)

1. Apply SQL schema from [docs/supabase-schema.md](/Users/serzhansrsnbv/Desktop/dental_proj/docs/supabase-schema.md).
2. Configure `.env`.
3. Configure `src/scripts/shared/config.local.js`.
4. Start backend.
5. Run smoke checks below.

## 3. Environment

Create `.env` in repository root:

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
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SYNC_ENABLED=1
SUPABASE_PROFILE_ID_COLUMN=id

SUPABASE_PROFILES_TABLE=profiles
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_COURSES_TABLE=courses
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_PAYMENT_SETTINGS_TABLE=payment_settings
SUPABASE_COURSE_ACCESS_TABLE=course_access

KASPI_PAYMENT_NUMBER=+70000000000
KASPI_PAYMENT_NAME=Manager Name
KASPI_PAYMENT_INSTRUCTIONS=Transfer payment to this Kaspi number and then press "Send payment request" in Academy.
```

Create `src/scripts/shared/config.local.js`:

```js
window.INTEGRAT_RUNTIME_CONFIG = {
  clinicApiBaseUrl: 'http://127.0.0.1:3000',
  academyApiBaseUrl: 'http://127.0.0.1:3000',
  contact: {
    address: 'Astana, Mangilik El 36',
    phone: '+7 747 457 17 40',
    tel: '+77474571740',
    email: 'hello@integrat.kz',
    mapEmbedUrl: 'https://www.google.com/maps?q=Astana%20Mangilik%20El%2036&output=embed'
  },
  socials: {
    instagram: 'https://www.instagram.com/https.serzhan/',
    telegram: 'https://t.me/altawh1d',
    whatsapp: 'https://wa.me/77474571740',
    google: 'https://maps.google.com/?q=Astana%20Mangilik%20El%2036'
  }
};
```

## 4. Install and run

```bash
cd src/backend/academy
npm install
npm start
```

## 5. Open URLs

- Home: `http://localhost:3000/src/pages/index.html`
- Academy: `http://localhost:3000/src/pages/academy.html`
- Admin confirmation page: `http://localhost:3000/src/pages/admin.html`

## 6. Live behavior

- Contact form is public (no auth).
- Academy access requires login/signup.
- Signup/login checks database data (Supabase in data mode).
- Course buy flow:
  - show Kaspi number/instructions
  - user sends payment request
  - admin approves/rejects request
  - only approved requests unlock video access
- Manager receives Telegram notifications for:
  - new contact form
  - new payment request

## 7. Startup and runtime logs

On startup backend prints:

- local URL
- admin email
- Telegram configured: `yes/no`
- Supabase data mode: `enabled/disabled`
- request logging status
- fake backend link

If enabled, startup also sends fake backend link to Telegram (`TELEGRAM_STARTUP_NOTIFY=1`).

Every request is logged:

- `[timestamp] METHOD /path -> status (ms)`

## 8. Smoke checks after deploy

1. `GET /health` returns `{"ok":true}`.
2. Submit contact form from UI and verify:
   - HTTP 201
   - row in Supabase `contacts`
   - Telegram manager message
3. Signup/login in Academy works.
4. Create payment request from Academy and verify:
   - row in `payment_requests` with `pending`
   - Telegram manager message
5. Approve request in admin page and verify:
   - request becomes `approved`
   - course opens in videos page

## 9. Troubleshooting

### Contact form returns HTML 404

Symptoms:
- error text contains `<!doctype html><title>404 Not Found</title>...`

Checks:
1. Confirm backend is running on `http://localhost:3000`.
2. Clear stale frontend base URL from browser localStorage:
   - key: `integrat.clinicApiBaseUrl`
3. Retry form submit.

Notes:
- Backend supports both `POST /contacts` and `POST /api/contacts`.
- Frontend API client automatically retries `/api/...` when non-API route returns 404.

## 10. Verification

Use the smoke checks above after each deploy.
For code-level validation during development, run syntax checks on the backend and frontend scripts you changed.

## 11. Production notes

1. Use strong `JWT_SECRET`.
2. Rotate Telegram/Supabase secrets regularly.
3. Keep `SUPABASE_SYNC_ENABLED=1` only after schema is applied.
4. Put backend behind HTTPS reverse proxy.
5. Use process manager (PM2/systemd/Docker) with auto-restart.
6. Persist `src/backend/academy/data` as volume for fallback/offline mode.
