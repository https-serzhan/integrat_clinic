# Integrat Backend

## Run

1. Install dependencies:
   - `cd backend`
   - `npm install`
2. Start server:
   - `npm start`
3. Open site:
   - `http://localhost:3000/pages/academy.html`

## Auth + Permissions Flow

- Users sign up/login from Academy page modal.
- Course videos page checks auth and `course` access (`videos.html?course=endo-faq`).
- Because purchase is external, admin grants access manually from:
  - `http://localhost:3000/pages/admin.html`

## Default Admin (dev seed)

- Email: `admin@integrat.local`
- Password: `Admin123!`

Override with env vars before start:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `PORT`
