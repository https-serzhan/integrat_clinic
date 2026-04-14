# Integrat Dental Ecosystem

Frontend-first dental platform that combines clinic, academy, laboratory, and store experiences in one repository.

## Repository Layout

```text
.
├── src/
│   ├── backend/
│   │   ├── academy/
│   │   └── api/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── docs/
├── tests/
├── assets/
│   ├── icons/
│   └── images/
├── README.md
├── .gitignore
├── .env.example
├── LICENSE
└── requirements.txt
```

## Run Locally

### Static Frontend Preview

```bash
python3 -m http.server 5500
```

Open `http://127.0.0.1:5500/src/pages/index.html`.

### FastAPI Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --app-dir src/backend/api --reload --host 127.0.0.1 --port 8000
```

### Academy Backend

```bash
cd src/backend/academy
npm install
npm run dev
```

Open `http://localhost:3000/src/pages/academy.html`.

## Notes

- Frontend pages live in `src/pages`, shared browser logic in `src/scripts/shared`, and CSS in `src/styles`.
- FastAPI uses `src/backend/api/schema.sql` and stores its SQLite database beside the API module by default.
- Academy auth/course data is generated in `src/backend/academy/data/`.
- Additional documentation lives in `docs/academy-backend.md` and `docs/frontend-audit.md`.
