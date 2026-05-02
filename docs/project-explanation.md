# Project Explanation And Defense Notes

## 1. What This Project Is

This project is a unified digital platform for a dental clinic and its educational academy.
Instead of building separate systems for public pages, booking, and academy access, the project combines them into one web application.

## 2. What Problem It Solves

The project addresses three operational problems:

1. patient communication is often fragmented
2. appointment booking is often disconnected from patient identity
3. academy sales and access are often managed manually

This system solves those issues by requiring authenticated booking, storing operational records centrally, and giving administrators a single review point.

## 3. Main Modules

### Public website

- home page
- clinic page
- about page
- FAQ page
- contact form

### Doctors module

- doctors list
- doctor modal
- doctor detail page
- appointment request flow

### Academy module

- academy sign-up
- academy login
- course listing
- payment request flow
- access control for videos

### Admin module

- payment request review
- appointment monitoring
- user overview

## 4. Authentication Model

There are two user-facing auth flows in the system:

### Clinic auth

Used for:

- patient login
- patient sign-up
- doctor appointment booking

This is required because the clinic must know who is booking an appointment.

### Academy auth

Used for:

- academy account registration
- academy login
- course access and purchase actions
- admin authentication

## 5. Backend Responsibilities

The backend is implemented in:

- `src/backend/academy/server.js`

It is responsible for:

- validating requests
- handling contact submissions
- handling clinic auth
- handling academy auth
- creating appointment records
- creating payment request records
- exposing admin APIs
- integrating with Supabase
- sending Telegram notifications

## 6. Database Design

The main production database is Supabase.

Main tables:

- `profiles`
- `contacts`
- `appointments`
- `courses`
- `payment_requests`
- `payment_settings`
- `course_access`

Why these tables exist:

- `profiles` stores users and roles
- `contacts` stores public contact form submissions
- `appointments` stores doctor booking requests
- `courses` stores academy course catalog data
- `payment_requests` stores course purchase requests
- `payment_settings` stores payment destination details
- `course_access` stores approved course permissions

## 7. How Appointment Booking Works

1. The user clicks a booking action.
2. If the user is not logged in, the frontend redirects to clinic authentication.
3. After login or sign-up, the user returns to the booking flow.
4. The frontend sends doctor id and preferred datetime.
5. The backend validates the request.
6. The backend stores the appointment in Supabase.
7. The appointment becomes visible in the admin panel.

This flow is important during defense because it proves that anonymous appointment creation is not allowed.

## 8. How Course Purchase Works

1. Academy user signs in.
2. User opens a course.
3. User sends a payment request.
4. Backend creates a pending record.
5. Admin reviews the request.
6. If approved, access is granted through `course_access`.
7. The user can open the videos page for that course.

## 9. Frontend Structure

Frontend logic is separated by page and shared helpers:

- page scripts in `src/scripts/`
- shared scripts in `src/scripts/shared/`
- page styles in `src/styles/`

Shared helpers include:

- API clients
- i18n logic
- modal behavior
- global navigation wiring
- contact form behavior

## 10. Deployment Design

The project is prepared for Vercel.

Production deployment structure:

- `api/index.js` exposes the Express app
- `src/` and `assets/` hold the static frontend files directly
- `vercel.json` redirects `/` to `src/pages/index.html` and forwards API paths to the backend

This lets Vercel serve static pages from the repository while routing API requests to the backend function.

## 11. Why Supabase Is Important

Supabase is used as the main data store because serverless platforms do not provide reliable persistent local filesystem storage for application data.

Without Supabase:

- appointments may disappear between deployments
- payment requests may disappear
- users cannot be managed consistently

## 12. Known Limitations

- `laboratory.html` is still a reserved future page
- `store.html` is still a reserved future page
- Telegram delivery depends on external credentials and network availability
- some local fallback logic remains for non-production scenarios

## 13. Suggested Demo Flow For Defense

1. Show the home page.
2. Open the doctors page.
3. Try booking while logged out.
4. Show redirect to login/register.
5. Register a patient.
6. Complete a doctor booking.
7. Show the appointment in Supabase and admin panel.
8. Open the academy page.
9. Register an academy user.
10. Send a payment request for a course.
11. Log in as admin.
12. Approve the request.
13. Show course access on the videos page.

## 14. Likely Defense Questions

### Why did you use one backend instead of multiple services?

Because the project scope is academic and operationally related. One backend keeps deployment and integration simpler.

### Why did you require authentication for appointments?

Because the clinic must know exactly who created the booking, and anonymous appointment requests are not operationally reliable.

### Why did you choose Supabase?

Because it gives a hosted PostgreSQL-backed environment, predictable persistence, and an easy integration path for a student project.

### Why does the project have both clinic and academy auth flows?

Because clinic booking and academy access represent different user journeys, even though they are part of one ecosystem.

## 15. Student IDs

- 230103179
- 230103120
- 230103083
- 230103081
