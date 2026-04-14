# Academy Backend

## Run

```bash
cd src/backend/academy
npm install
npm start
```

## Entry Points

- Academy page: `http://localhost:3000/src/pages/academy.html`
- Admin page: `http://localhost:3000/src/pages/admin.html`

## Auth and Permissions Flow

- Users sign up or log in from the Academy page modal.
- The videos page checks both authentication and course access with `videos.html?course=endo-faq`.
- Admin grants course access manually after purchase confirmation.

## Default Admin

- Email: `admin@integrat.local`
- Password: `Admin123!`

## Environment Variables

- `PORT`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
