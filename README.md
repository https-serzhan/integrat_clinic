# Integrat Dental Ecosystem

A frontend-first multi-page dental platform that brings clinic services, academy content, laboratory offerings, and store pages into one branded web experience.

## Problem Statement
Dental brands often present their services across disconnected pages, tools, or platforms. That creates a fragmented user experience for patients, doctors, and students. This project explores a unified digital ecosystem where users can discover services, browse specialists, submit inquiries, log in, and access educational content in one place.

## Features
- Multi-page frontend experience for Home, Clinic, Doctors, Academy, Laboratory, Store, About, FAQ, Auth, Admin, Dashboard, and Videos
- Reusable frontend sections such as navigation, hero blocks, sliders, cards, footer, and modal windows
- Contact forms integrated across multiple pages
- Doctor listing with filters and modal-based appointment flow
- FastAPI backend for contacts, doctors, authentication, and appointments
- Express backend for academy login, course access control, and admin permissions
- Admin page for granting student access to academy content
- Dashboard page for viewing contacts and appointments
- Visual branding with custom assets, responsive layouts, and page-specific styling

## Project Structure
- `pages/` - HTML pages
- `css/` - global and page-specific styles
- `js/` - frontend scripts
- `js/shared/` - shared frontend utilities
- `assets/` - images and illustrations
- `icons/` - UI icons
- `main.py` - FastAPI backend
- `schema.sql` - SQLite schema
- `backend/` - Express backend for academy access flow

## Installation

### 1. Frontend Preview
To preview the static frontend pages:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500/pages/index.html
```

## 2. FastAPI Backend
Use this backend for contacts, doctors, auth, and appointments.

Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the API:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 3. Academy Backend
Use this backend for academy login, course access, and admin permission control.

```bash
cd backend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000/pages/academy.html
```

## Usage Instructions

### Main Website
- Start the frontend preview server.
- Open `pages/index.html`.
- Navigate between the Clinic, Doctors, Academy, Laboratory, Store, About, and FAQ pages.
- Use the contact forms on supported pages.
- Open `pages/auth.html` for registration and login.
- Use the Doctors page and modal flow to test appointment creation.

### Academy Flow
- Open `pages/academy.html` through the Express backend.
- Sign up or log in.
- Visit `pages/videos.html?course=endo-faq`.
- Use `pages/admin.html` to grant course access after purchase confirmation.

Default admin credentials:
- Email: `admin@integrat.local`
- Password: `Admin123!`

## Screenshots
Screenshots can be added here after export from the final UI.

Suggested screenshots:
- Home page
- Doctors page
- Academy page
- Admin page
- Videos page

## Technology Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend API: Python, FastAPI, SQLite, aiosqlite
- Academy backend: Node.js, Express
- Charts: Chart.js
- Assets: SVG, PNG, JPG

## Notes
This repository is primarily strongest on the frontend side: page design, layout work, reusable UI sections, and interactive client-side behavior. The backend parts are included as supporting prototypes for forms, authentication, appointments, and academy access.
