# Integrat Dental Ecosystem

## Project Overview

Integrat Dental Ecosystem is a multi-page web application for a dental clinic and academy.
It combines:

- a public clinic website
- doctor browsing and appointment booking
- an academy area with sign-up, login, and course purchase flow
- an admin area for reviewing appointments and academy payment requests

The project is deployed as one Node.js + Express application and uses Supabase as the primary production database.

## Problem Statement

Dental service businesses often split their online presence into disconnected tools:

- a marketing website for the clinic
- a separate booking flow
- a separate training or academy platform
- manual communication through phone or messenger

This creates inconsistent user experience, duplicated data, and weak administrative control.

This project solves that problem by providing one integrated system where:

- visitors can discover the clinic and its doctors
- patients must log in before booking an appointment, so the clinic knows exactly who booked
- academy users can register, request course purchase, and access approved materials
- administrators can review requests in one place

## Objectives

- build a single ecosystem for clinic and academy services
- enforce authenticated booking for doctor appointments
- centralize operational data in Supabase
- support admin review for academy payment approvals
- provide a deployable full-stack solution on Vercel

## Main Features

### Clinic side

- public landing pages
- contact form
- doctors listing
- doctor detail page
- authenticated appointment booking

### Academy side

- academy sign-up and login
- course catalog
- payment request workflow
- gated course access after approval

### Admin side

- admin login via academy auth
- appointment list
- payment request list
- manual approval or rejection of payment requests

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js 20
- Express
- Cookie Parser

### Database and external services

- Supabase
- Telegram Bot API for notifications

### Deployment

- Vercel

## Architecture

The project uses a simple monolithic structure:

- `src/pages` contains all HTML pages
- `src/styles` contains page and shared CSS
- `src/scripts` contains frontend logic
- `src/backend/academy/server.js` contains the Express backend
- `api/index.js` exposes the backend as a Vercel serverless function entrypoint
- `scripts/prepare-public.js` copies the frontend into `public/` for Vercel static serving

The backend serves:

- API endpoints for auth, contacts, appointments, courses, and admin actions
- static frontend assets and pages

## Core User Flows

### 1. Contact form

1. User opens a public page.
2. User fills name, phone, and comment.
3. Frontend sends the request to the backend.
4. Backend validates input.
5. Backend stores the record in Supabase.
6. Backend optionally sends a Telegram notification.

### 2. Doctor appointment booking

1. User opens the doctors area or a doctor page.
2. If the user is not authenticated, the frontend redirects them to clinic login/register.
3. After login or sign-up, the user returns to the doctor flow.
4. User selects time and submits appointment.
5. Backend validates the user and the doctor.
6. Backend stores the appointment in Supabase.

### 3. Academy course purchase

1. User signs up or logs in through the academy flow.
2. User opens a course and sends a payment request.
3. Backend creates a pending payment request.
4. Admin reviews the request.
5. If approved, the user gains course access.

## Project Structure

```text
.
├── api/
├── assets/
├── docs/
├── scripts/
├── src/
│   ├── backend/academy/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── .env.example
├── index.js
├── package.json
└── vercel.json
```

## Pages

- `index.html` - landing page
- `clinic.html` - clinic information
- `doctors.html` - doctors list
- `doctor.html` - single doctor page with booking flow
- `academy.html` - academy landing and access point
- `videos.html` - gated academy videos page
- `about.html` - about page
- `faq.html` - FAQ page
- `auth.html` - clinic authentication page
- `admin.html` - admin panel
- `laboratory.html` - reserved for future work
- `store.html` - reserved for future work

## Environment Variables

Minimum required production variables:

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

## Local Run

1. Create `.env` from `.env.example`.
2. Run the SQL from [docs/supabase-schema.md](docs/supabase-schema.md).
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open:

- `http://localhost:3000/src/pages/index.html`
- `http://localhost:3000/src/pages/academy.html`
- `http://localhost:3000/src/pages/admin.html`

## Deployment

The project is prepared for Vercel.

Deployment guide:

- [docs/vercel-deploy.md](docs/vercel-deploy.md)

Database setup:

- [docs/supabase-schema.md](docs/supabase-schema.md)

System explanation and defense notes:

- [docs/project-explanation.md](docs/project-explanation.md)

## Technical Notes

- Supabase is the primary production data source.
- Telegram is optional and should not block core business flows.
- `laboratory.html` and `store.html` are intentionally kept for future development.

## Student IDs

- 230103179
- 230103120
- 230103083
- 230103081
