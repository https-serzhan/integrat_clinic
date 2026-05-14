# Integrat Dental Platform

React + TypeScript SPA for a multi-surface dental ecosystem:

- clinic presentation and treatment catalog
- doctors directory with filtering and booking flow
- academy course marketplace with filtering and sorting
- course viewer with gated access flow
- local admin workspace for appointments and payment approvals

The project is now fully front-end driven and GitHub Pages friendly. All data is mocked in a typed local store backed by `localStorage`, so the app works without a backend.

## Stack

- React
- TypeScript
- React Router
- Vite
- local mock data layer with persistent `localStorage`

## Pages

- `/` - home
- `/clinic` - clinic overview
- `/doctors` - doctors listing, filters, and patient dashboard
- `/doctor?doctor=<id>` - doctor case page
- `/academy` - course catalog with filters and sorting
- `/videos?course=<id>` - course viewer
- `/about` - about page
- `/faq` - FAQ landing
- `/auth` - clinic auth
- `/admin` - admin workspace
- `/laboratory` - laboratory showcase
- `/store` - store showcase

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Production preview:

```bash
npm run build
npm run preview
```

## Mock accounts

- Admin: `admin@integrat.local` / `Admin123!`
- Patient: `patient@integrat.local` / `Patient123!`
- Student: `student@integrat.local` / `Student123!`

## GitHub Pages

The project is configured for GitHub Pages with a workflow in `.github/workflows/deploy-pages.yml`.

Expected Pages URL after deployment:

`https://https-serzhan.github.io/integrat_clinic/`
