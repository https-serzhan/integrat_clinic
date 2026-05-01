# Academy Backend

## Run

```bash
cd src/backend/academy
npm install
npm start
```

## Entry Points

- Home page: `http://localhost:3000/src/pages/index.html`
- Academy page: `http://localhost:3000/src/pages/academy.html`
- Videos page: `http://localhost:3000/src/pages/videos.html?course=endo-faq`
- Admin page: `http://localhost:3000/src/pages/admin.html`

## Auth and Permissions Flow

- Users sign up or log in from Academy modal (`/api/auth/*`).
- Sign up stores user in Supabase `profiles` (or local fallback if Supabase disabled).
- Role is taken from DB (`profiles.role`) and admins are set manually in Supabase.
- Academy purchase endpoint creates `pending` payment request.
- Admin confirms or rejects payment requests from admin page.
- Access is granted only after approval.
- Videos page verifies access through `GET /api/courses/:courseId/access`.

## Default Admin

- Local default admin is still auto-created for offline/testing mode.
- In Supabase mode, `profiles.role='admin'` controls admin access.

## Environment Variables

- `PORT`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_THREAD_ID` (optional)
- `TELEGRAM_STARTUP_NOTIFY` (`1` to send fake startup link to Telegram)
- `FAKE_BACKEND_LINK`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SYNC_ENABLED`
- `SUPABASE_PROFILES_TABLE`
- `SUPABASE_PROFILE_ID_COLUMN`
- `SUPABASE_CONTACTS_TABLE`
- `SUPABASE_COURSES_TABLE`
- `SUPABASE_PAYMENT_REQUESTS_TABLE`
- `SUPABASE_PAYMENT_SETTINGS_TABLE`
- `SUPABASE_COURSE_ACCESS_TABLE`
- `KASPI_PAYMENT_NUMBER`
- `KASPI_PAYMENT_NAME`
- `KASPI_PAYMENT_INSTRUCTIONS`

## Startup Output

After `npm start`, the backend prints:

- bound local URL
- default admin email
- Telegram configuration status
- Supabase data mode status
- fake backend link

Each incoming request is also logged with timestamp, route, status, and duration.

## Supabase Data

When `SUPABASE_SYNC_ENABLED=1`, backend reads/writes:

- `profiles` for academy auth users and roles
- `contacts` for public contact form
- `courses` for academy list
- `payment_settings` for Kaspi receiver details
- `payment_requests` for pending/approved/rejected purchase flow
- `course_access` for approved grants

## Key Endpoints

- `GET /api/courses`
- `GET /api/payment/settings`
- `GET /api/courses/purchases/me`
- `POST /api/courses/:courseId/purchase`
- `GET /api/courses/:courseId/access`
- `GET /api/admin/payment-requests`
- `POST /api/admin/payment-requests/:paymentRequestId/decision`
- `POST /api/notifications/telegram-code` (admin only)
