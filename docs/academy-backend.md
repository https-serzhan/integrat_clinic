# Academy Backend

## Role

`src/backend/academy/server.js` serves the full project:
- static frontend pages from `src/`
- clinic auth and appointment endpoints
- public contact form endpoints
- academy auth and course endpoints
- admin endpoints
- Telegram notifications

## Run

```bash
cd src/backend/academy
npm ci
npm start
```

## Startup Output

On boot the server prints:
- local URL
- default admin email
- Telegram status
- Supabase data mode status
- HTTP request logging status
- fake backend link

If `TELEGRAM_STARTUP_NOTIFY=1`, the startup link is also sent to Telegram.

## Core Environment Variables

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

## Data Flow

### Clinic side
- `POST /auth/register` creates a clinic user
- `POST /auth/login` returns a bearer token
- `POST /appointments` requires clinic auth
- `POST /contacts` is public
- contacts are saved locally and optionally synced to Supabase
- appointments are saved locally and optionally synced to Supabase

### Academy side
- `POST /api/auth/signup` creates an academy account
- `POST /api/auth/login` starts the academy session
- `POST /api/courses/:courseId/purchase` creates a pending payment request
- `GET /api/courses/:courseId/access` checks if the user may open the videos page
- approved requests grant access through `course_access`

### Admin side
- admins are controlled by `profiles.role = 'admin'`
- admin can review payment requests
- admin can review appointments
- admin can manage users, grants, and purchases

## Main Endpoints

### Public and clinic auth
- `GET /health`
- `GET /api/health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /contacts`
- `POST /api/contacts`
- `GET /doctors`
- `POST /appointments`
- `GET /appointments`

### Academy auth and courses
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/payment/settings`
- `GET /api/courses`
- `GET /api/courses/purchases/me`
- `POST /api/courses/:courseId/purchase`
- `GET /api/courses/:courseId/access`

### Admin
- `GET /api/admin/appointments`
- `GET /api/admin/users`
- `GET /api/admin/grants`
- `POST /api/admin/grants`
- `DELETE /api/admin/grants/:grantId`
- `GET /api/admin/payment-requests`
- `POST /api/admin/payment-requests/:paymentRequestId/decision`
- `GET /api/admin/purchases`
- `POST /api/notifications/telegram-code`

## Supabase Tables Used

- `profiles`
- `contacts`
- `appointments`
- `courses`
- `payment_settings`
- `payment_requests`
- `course_access`

Use `docs/supabase-schema.md` to create them.
