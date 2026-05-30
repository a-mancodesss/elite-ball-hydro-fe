# PS4 Hydropower Compliance Platform

<img width="1635" height="936" alt="image" src="https://github.com/user-attachments/assets/3451d1af-17d5-4788-a2b8-3d7a4c88db0a" />


A web platform that digitizes IFC Performance Standard 4 (Community Health & Safety) compliance monitoring for Nepal's hydropower sector.

> **Problem:** 175 hydropower projects in Nepal. Zero centralized digital monitoring. All reports on paper. IFC/ADB financing is blocked because compliance cannot be verified.

Three core modules — **E-flow monitoring**, **GLOF risk assessment**, **Emergency plan gap checker** — unified in a single dashboard for regulators (DOED) and hydro company admins.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Map | Leaflet + react-leaflet |
| Charts | Recharts |
| Backend | Python 3.11 + FastAPI (async) |
| Database | PostgreSQL (Neon serverless) |
| ORM | SQLAlchemy 2.0 (async) + asyncpg |
| Auth | JWT (python-jose + bcrypt) |
| PDF | pdfplumber (parsing), reportlab (template generation) |
| AI | Anthropic Claude (claude-sonnet-4) with heuristic fallback |

---

## Quick start

### 1. Database

Create a free Neon Postgres database at https://neon.tech and copy the connection string.

### 2. Environment

```bash
cp .env.example .env
```

Then edit `.env` and set:
- `DATABASE_URL` (Neon async URL: `postgresql+asyncpg://...?sslmode=require`)
- `ANTHROPIC_API_KEY` (optional — heuristic fallback runs without it)
- `JWT_SECRET` (any long random string)

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed the database (creates tables, projects, lakes, users, GLOF scores)
python seed.py

# (Optional) generate demo-friendly sample uploads
python generate_sample_eflow.py
python generate_sample_plans.py

# Run the API
uvicorn main:app --reload --port 8000
```

API will be live at http://localhost:8000 and Swagger at http://localhost:8000/docs.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173.

---

## Demo logins (seeded by `python seed.py`)

| Role | Email | Password |
|---|---|---|
| Regulator (DOED) | `regulator@doed.gov.np` | `regulator123` |
| Hydro admin — Upper Trishuli-1 | `admin.upper@hydro.np` | `hydro123` |
| Hydro admin — Khimti | `admin.khimti@hydro.np` | `hydro123` |
| Hydro admin — Chilime | `admin.chilime@hydro.np` | `hydro123` |
| Hydro admin — Marsyangdi | `admin.marsyangdi@hydro.np` | `hydro123` |
| Hydro admin — Rasuwagadhi | `admin.rasuwagadhi@hydro.np` | `hydro123` |

---

## Demo walkthrough

1. **Login as the regulator** (`regulator@doed.gov.np`).
   - You land on the Regulator Dashboard with the Nepal map, 5 hydropower projects colored by overall PS4 status, and ICIMOD glacial lakes sized by volume.
   - The summary bar shows the compliant / partial / violation / not-submitted breakdown.
   - Click any project row → opens the project workspace with E-Flow chart, GLOF panel, and Emergency Plan Gap Report.

2. **Logout, login as a hydro admin** (e.g. `admin.khimti@hydro.np`).
   - You only see your own project.
   - Open the project workspace.
   - **Download the standardized e-flow template** (button on the upload card).
   - Use the pre-generated `backend/seed_data/sample_reports/khimti-hydropower-2024-02.pdf` to upload a clean monthly report → watch the chart populate, status flip to `COMPLIANT`.
   - Or upload `chilime-hydropower-2024-04.pdf` (15 forced violations) → status flips to `VIOLATION`, 15 red days appear on the chart.
   - Upload `backend/seed_data/sample_plans/good_plan.pdf` → AI scores it ~80–100/100.
   - Or `weak_plan.pdf` → AI flags ~6 critical missing items.

3. **Switch back to regulator.** The dashboard now reflects the new submissions immediately.

---

## Architecture

```
                        ┌───────────────────────┐
                        │   Regulator UI (DOED)  │
                        │  Map · Table · CSV     │
                        └───────────┬───────────┘
                                    │
┌──────────────────┐                │                ┌────────────────────────┐
│  Hydro Admin UI  │───────► Vite + React + TS ◄────│ Leaflet map (OSM tiles) │
│ Upload · Reports │                │                └────────────────────────┘
└──────────────────┘                │
                                    ▼
                            FastAPI (async)
            ┌────────┬──────────┬──────────┬──────────────┐
            │ /auth  │ /projects│ /eflow   │ /glof + /emergency-plan
            ▼        ▼          ▼          ▼
       JWT/bcrypt  PS4 summary  pdfplumber  Claude API + heuristic fallback
                                            (claude-sonnet-4-20250514)
                                    │
                                    ▼
                  Async SQLAlchemy + asyncpg → Neon Postgres
```

### Modules

| Module | Service | What it does |
|---|---|---|
| E-Flow | `services/eflow_parser.py` | Parses standardized monthly PDF, computes daily release %, flags days below 10% of upstream as violations, rolls up to monthly compliance summary. |
| GLOF | `services/glof_scorer.py` | For each project, picks the closest dangerous lake in the same river system. Score = ICIMOD base + lake volume bonus + downstream population bonus − distance penalty. Clamped 0–100. |
| Emergency Plan | `services/ai_checker.py` | Extracts PDF text and asks Claude to grade it against 10 PS4 mandatory items. Returns structured JSON. Falls back to a deterministic keyword scanner when no API key is configured (so the demo always runs). |

---

## API surface

```
POST   /api/auth/login                          # email/password → JWT
GET    /api/auth/me                             # current user

GET    /api/projects                            # role-aware list
GET    /api/projects/{id}                       # project detail
GET    /api/projects/{id}/ps4-summary           # combined PS4 status card
GET    /api/projects/ps4-summary-all            # all PS4 summaries (regulator)

POST   /api/eflow/upload                        # multipart: project_id + PDF
GET    /api/eflow/reports/{project_id}          # list of reports
GET    /api/eflow/reports/{project_id}/latest   # latest report

GET    /api/glof/lakes                          # all glacial lakes
GET    /api/glof/risk/{project_id}              # risk + closest lake
GET    /api/glof/risk/all                       # all risks (for map)
POST   /api/glof/recompute                      # regulator-only, rebuild risk scores

POST   /api/emergency-plan/upload               # multipart: project_id + PDF
GET    /api/emergency-plan/{project_id}         # latest plan + gap report

GET    /api/templates/eflow                     # download the blank PDF template
```

All protected routes require `Authorization: Bearer <JWT>`. HYDRO_ADMIN can only access their own `project_id`.

---

## Project structure

```
hydroPowerCompliance/
├── backend/
│   ├── main.py                 # FastAPI app + template generator
│   ├── config.py               # pydantic-settings, .env loader
│   ├── database.py             # async engine, get_db, init_db
│   ├── auth_utils.py           # JWT, bcrypt, get_current_user
│   ├── models/                 # SQLAlchemy 2.0 typed models
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # /auth, /projects, /eflow, /glof, /emergency-plan
│   ├── services/
│   │   ├── eflow_parser.py     # PDF table extraction + compliance maths
│   │   ├── glof_scorer.py      # 0–100 GLOF scoring formula
│   │   └── ai_checker.py       # Claude API call + heuristic fallback
│   ├── seed_data/              # projects.json, glof_lakes.json
│   ├── seed.py                 # one-shot DB seeder
│   ├── generate_sample_eflow.py# demo PDFs
│   ├── generate_sample_plans.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                # axios client + typed endpoints
│   │   ├── types/              # shared TS interfaces
│   │   ├── context/            # AuthContext
│   │   ├── components/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Dashboard/ComplianceCard.tsx
│   │   │   ├── Map/ProjectMap.tsx
│   │   │   ├── EFlow/{ReportUpload,EFlowChart}.tsx
│   │   │   ├── GLOF/GlofRiskPanel.tsx
│   │   │   └── EmergencyPlan/{PlanUpload,GapReport}.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── RegulatorView.tsx
│   │   │   ├── HydroAdminView.tsx
│   │   │   └── ProjectDetailView.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
└── README.md
```

---

## References

- IFC Performance Standards 2012 — https://www.ifc.org/performancestandards
- ICIMOD priority glacial lake inventory — https://www.icimod.org/himaldoc
- HydroSHEDS river network — https://www.hydrosheds.org
- DOED Nepal project list — https://www.doed.gov.np
- WorldPop Nepal population grid — https://www.worldpop.org

## License

Built for the Nepal hydropower compliance hackathon. MIT-licensed.
