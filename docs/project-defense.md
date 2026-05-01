# Project Defense Notes

## Project goal

Integrat is a unified dental platform with:

- Clinic showcase + lead capture
- Doctor browsing and appointment requests
- Academy catalog with authentication
- Paid course access control
- Admin management panel
- English/Russian UI toggle
- Supabase-backed academy users, contacts, and payment approvals

## Final architecture

- **Frontend**: multipage HTML/CSS/JS (`src/pages`, `src/scripts`, `src/styles`)
- **Backend**: Express server (`src/backend/academy/server.js`) serving both static files and APIs
- **Storage**:
  - Primary demo/offline storage: JSON persistence in `src/backend/academy/data`
  - Supabase data mode: `profiles`, `contacts`, `courses`, `payment_settings`, `payment_requests`, `course_access`

## Core implemented logic

1. Auth
- Clinic auth (Bearer token): register/login for dashboard + appointments
- Academy auth (cookie session): signup/login/logout/me

2. Courses and purchasing
- Academy course catalog from API
- Buy action shows Kaspi payment details
- User sends payment request per course (`pending`)
- Admin approve/reject updates request status
- Access gate on videos page based on `approved` status/admin
- Purchased courses visible for logged-in user

3. Forms and validation
- Contact forms validate name/phone/comment/consent
- Auth forms validate email/password strength/confirm password
- Doctor appointment form validates datetime and auth

4. Telegram manager notifications
- Backend sends manager notifications for:
  - new contact form submission
  - new academy payment request
- Sends via Telegram Bot API when env configured
- Falls back to console logging when not configured

5. UX quality
- Skeleton loaders for academy cards, doctors grid, dashboard tables
- Button wiring for service toggles, course actions, booking actions
- Global language switch with persisted choice and dynamic section rerendering

6. Observability
- Request logs with status + latency in deploy console
- Event-level Telegram delivery logs
- Startup summary with fake demo backend link
- Optional startup Telegram notification with demo link

7. Supabase integration
- Academy auth checks Supabase `profiles` directly when enabled
- Contact form stores `full_name`, `phone_number`, `comment` in Supabase `contacts`
- Payment workflow is stored in Supabase `payment_requests` + `course_access`
- Local JSON fallback keeps demo/test deterministic if remote services are unavailable

## Why this is backend-integration-ready

- Frontend API access centralized in shared clients (`api.js`, `auth-api.js`)
- Runtime frontend values configurable via `config.local.js`
- Endpoint contracts are explicit and documented
- Fallback content exists for empty/missing API data

## Backend TODO (for next iteration)

1. Move clinic appointments and dashboard analytics fully to Supabase/Postgres.
2. Add payment proof upload + anti-fraud verification.
3. Add email/phone verification workflow and rate limiting.
4. Replace fallback secrets with mandatory production-only env validation.
5. Add structured logger + trace IDs.
6. Add browser-level UI regression tests for language switching.
7. Add Docker + CI pipeline.
8. Move secrets to environment manager (Vault/Cloud Secret Manager).

## Endpoints summary

### Clinic/Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /contacts`
- `GET /contacts`
- `GET /doctors`
- `POST /appointments`
- `GET /appointments`
- `GET /dashboard/summary`

### Academy
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/courses`
- `GET /api/payment/settings`
- `GET /api/courses/purchases/me`
- `POST /api/courses/:courseId/purchase`
- `GET /api/courses/:courseId/access`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/payment-requests`
- `POST /api/admin/payment-requests/:paymentRequestId/decision`

### Telegram utility
- `POST /api/notifications/telegram-code` (admin only)
