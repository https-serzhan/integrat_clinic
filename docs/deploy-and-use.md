# Deploy And Use

## Deployment Model

This project is simplest to deploy as one Node.js service.
The backend serves both the frontend pages and the API.

## What You Need

- Linux server or VPS
- Node.js 20+
- npm
- Supabase project
- Telegram bot token and manager chat ID
- domain or server IP

## Files You Must Prepare

### Root `.env`

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

### Frontend runtime config

Create or update `src/scripts/shared/config.local.js`:

```js
const integratRuntimeOrigin =
  window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'http://localhost:3000';

window.INTEGRAT_RUNTIME_CONFIG = {
  clinicApiBaseUrl: integratRuntimeOrigin,
  academyApiBaseUrl: integratRuntimeOrigin,
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
    whatsapp: 'https://wa.me/+77711140710',
    google: 'https://www.youtube.com/watch?v=2qBlE2-WL60'
  }
};
```

## Supabase Setup

1. Open Supabase SQL editor.
2. Run the full SQL from `docs/supabase-schema.md`.
3. Sign up the future admin through the Academy page after deployment.
4. Promote that user in Supabase:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## Local Deployment

```bash
cd src/backend/academy
npm ci
npm start
```

Open:
- `http://localhost:3000/src/pages/index.html`
- `http://localhost:3000/src/pages/academy.html`
- `http://localhost:3000/src/pages/admin.html`

## VPS Deployment

### 1. Upload the project

Use Git or copy the repository to the server.

### 2. Install dependencies

```bash
cd /path/to/dental_proj/src/backend/academy
npm ci
```

### 3. Start the app manually once

```bash
cd /path/to/dental_proj/src/backend/academy
npm start
```

If startup is correct, you will see:
- `Integrat backend running on http://localhost:3000`
- `Telegram configured: yes` or `no`
- `Supabase data mode: enabled` or `disabled`
- `Fake backend link: ...`

### 4. Keep it running with PM2

```bash
npm install -g pm2
cd /path/to/dental_proj/src/backend/academy
pm2 start server.js --name integrat
pm2 save
pm2 startup
```

### 5. Reverse proxy with Nginx

Point your domain to the server, then proxy traffic to `http://127.0.0.1:3000`.

Example server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After that, enable HTTPS with your usual certificate setup.

## What Happens After Deploy

- public users can submit contact forms
- users must sign up or log in before booking appointments
- academy users can sign up and log in
- paid courses create pending payment requests
- admin approves or rejects course access
- manager receives Telegram notifications for contact, appointment, and payment events
- the backend prints request logs in the terminal

## Smoke Test Checklist

1. Open the home page.
2. Switch language and confirm the button label flips correctly.
3. Submit a contact form.
4. Check Supabase `contacts`.
5. Check Telegram for the contact notification.
6. Sign up a clinic user.
7. Book an appointment from the doctors flow.
8. Check Supabase `appointments`.
9. Sign up an academy user.
10. Send a payment request for a course.
11. Check Supabase `payment_requests`.
12. Log in as admin and approve the request.
13. Open the course videos page and confirm access works.

## Common Problems

### `Failed to fetch`

- backend is not running
- page was opened from the wrong origin
- stale browser cache is holding an old runtime config

Fix:
- restart backend
- hard refresh the browser
- make sure the site is opened through the backend URL

### Contact form returns HTML 404

The frontend can hit `/contacts` or `/api/contacts`.
If you still get 404, the backend is either not running or the page is not using the correct API origin.

### Signup or purchase fails with Supabase schema errors

Your Supabase tables do not match the current backend contract.
Run the SQL from `docs/supabase-schema.md` again.

## How You Deploy This Project In Practice

If you want the shortest reliable path:

1. create a VPS
2. install Node.js
3. clone the repository
4. create `.env`
5. create `src/scripts/shared/config.local.js`
6. run the Supabase SQL
7. run `npm ci` in `src/backend/academy`
8. run the server with PM2
9. put Nginx in front of `localhost:3000`
10. point your domain to the server

That is the deployment model this codebase is already built for.
