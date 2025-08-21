# BRM Renewal Calendar

## Architecture
- **Backend**: Flask API (Python)
- **Frontend**: React SPA (JavaScript)
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Quick Start
1. Backend: `cd server && pip install -r requirements.txt && python run.py`
2. Frontend: `cd client && npm install && npm start`
3. Visit: http://127.0.0.1:5000

## API Endpoints
- GET /health
- POST /upload
- GET /agreements
- GET /calendar
- GET /calendar/upcoming