# Integrat Clinic - Local Run Guide

Simple full-stack run: static frontend + FastAPI backend.

## 1) Requirements

- Python 3.10+
- `pip`
- Any static file server (Live Server extension or Python `http.server`)

## 2) Backend setup (API)

From project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create env file (already included in repo as `.env`):

```env
APP_NAME=Integrat Clinic API
APP_ENV=development
DEBUG=true
DATABASE_PATH=./integrat_clinic.db
JWT_SECRET=dev-secret-please-change
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000
```

Start backend:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected:

```json
{ "status": "ok", "environment": "development" }
```

Notes:

- SQLite schema is auto-created on startup from `app/db/schema.sql`.
- DB file will appear as `integrat_clinic.db` in project root.

## 3) Frontend setup (site)

Use a static server from the same project root.

Option A (VS Code Live Server):

- Open `pages/index.html`
- Click "Go Live"
- Usually runs on `http://127.0.0.1:5500`

Option B (Python static server):

```bash
python3 -m http.server 5500
```

Open:

- `http://127.0.0.1:5500/pages/index.html`

## 4) Connect frontend -> backend

Use this API base URL in JS:

```js
const API_BASE = "http://127.0.0.1:8000";
```

Example login:

```js
const loginRes = await fetch(`${API_BASE}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@test.com", password: "12345678" }),
});
const { access_token } = await loginRes.json();
```

Example authorized request:

```js
const res = await fetch(`${API_BASE}/clinics?lat=51.1&lng=71.4`, {
  headers: { Authorization: `Bearer ${access_token}` },
});
const data = await res.json();
```

## 5) Minimal demo flow

1. Register user:

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"12345678"}'
```

2. Login and copy `access_token`:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"12345678"}'
```

3. Query clinics:

```bash
curl "http://127.0.0.1:8000/clinics?lat=51.1&lng=71.4"
```

## 6) Common issues

- `ModuleNotFoundError`: dependencies not installed -> run `pip install -r requirements.txt`.
- `CORS` errors in browser -> ensure frontend URL is in `CORS_ORIGINS`.
- `401 Unauthorized` -> JWT missing/invalid in `Authorization: Bearer <token>`.
- Port busy -> run backend on another port (`--port 8001`) and update frontend API base.
