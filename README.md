# Ecommerce AI Showcase MVP

An ecommerce analytics dashboard showcasing AI-powered insights, KPI tracking, and operational intelligence.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Analytics:** Pandas
- **Data:** Local CSV seed data (BigQuery planned)

## Project Structure

```
├── frontend/          # React + Vite app
├── backend/           # FastAPI server
│   ├── main.py        # API routes
│   ├── services/      # Data & analytics services
│   └── seed_data/     # CSV seed data files
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.10+

### 1. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at **http://127.0.0.1:8000**

API docs (Swagger): http://127.0.0.1:8000/docs

### 2. Start the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

### Verify Everything Works

- Backend health check: http://127.0.0.1:8000/health
- Dashboard KPIs: http://127.0.0.1:8000/api/dashboard/kpis?range=last_7_days
- Frontend: http://localhost:5173

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Backend health check |
| `GET /api/dashboard/kpis?range=` | KPI cards data |
| `GET /api/dashboard/sales-over-time?range=` | Revenue trend chart data |
| `GET /api/dashboard/sales-by-category?range=` | Category breakdown data |
| `GET /api/dashboard/top-priority` | Top priority warning |
| `GET /api/dashboard/business-health` | Business health status |

Valid `range` values: `last_7_days`, `last_30_days`, `last_90_days`