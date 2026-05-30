# Order Management System (OMS)

## Overview
This project is a full-stack Order Management System built with Node.js, Express, React, and PostgreSQL.

## Current Delivery Priority

- Website/static pages and the web frontend are maintenance-only.
- Active feature delivery is focused on:
  - Windows desktop app (`desktop/`)
  - Android app track (`android/`)

See `docs/APP_IMPLEMENTATION_BACKLOG.md` for the app-first rollout checklist.

## Getting Started

### Prerequisites
- Node.js (v20.x recommended)
- PostgreSQL (v15 or higher recommended)
- npm (Node Package Manager)
- Docker Desktop with Docker Compose v2 support (optional)

### Installation

1. Clone the repository:
	```bash
	git clone https://github.com/DavinciShah/devibe-oms.git
	cd devibe-oms
	```
2. Navigate to the backend folder and install dependencies:
	```bash
	cd backend
	npm install
	```
3. Create `backend/.env` from `backend/.env.example` and update configuration values.
   - For Supabase, set `DATABASE_URL` to your Supabase Postgres connection string and set `DB_SSL=true`.
4. Run database migrations:
	```bash
	npm run migrate
	```
   - This now runs the unified versioned migration runner (`backend/src/migrations/run-latest.js`).
   - It applies all `backend/migrations/<number>_*.sql` files in order and records applied versions in `schema_migrations`.
   - Core migration `001_core_tables.sql` creates the `users` table used for people/user data persistence.
5. Start the backend server:
	```bash
	npm start
	```
6. Navigate to the frontend folder and install dependencies:
	```bash
	cd ../frontend
	npm install
	```
7. Start the frontend app:
	```bash
	npm run dev
	```

## Folder Structure

- backend/
  - src/
	 - config/
	 - controllers/
	 - models/
	 - routes/
	 - migrations/
	 - server.js
  - package.json

- frontend/
  - src/
	 - components/
	 - services/
	 - App.jsx
	 - main.jsx
  - package.json

- desktop/
  - Electron Windows app shell
  - Packaging and installer scripts

- android/
  - Android app track kickoff docs
  - Runtime config contract

## Publish Readiness Checklist

Before publishing:

1. Configure production environment values from `backend/.env.example` with strong secrets.
2. Regenerate lockfiles after dependency changes:
	```bash
	cd backend && rm -f package-lock.json && npm install
	cd ../desktop/backend-bundle && rm -f package-lock.json && npm install
	```
3. Run backend migrations:
	```bash
	cd backend && npm run migrate
	```
   - Verify latest migration state:
	```bash
	cd backend && node -e "const {query,pool}=require('./src/config/database');query('select filename,applied_at from schema_migrations order by filename').then(r=>{console.table(r.rows);pool.end();}).catch(e=>{console.error(e);pool.end();process.exit(1);});"
	```
4. Run backend tests:
	```bash
	cd backend && npm test && npm run test:smoke
	```
5. Run dependency audits:
	```bash
	cd backend && npm audit
	cd ../frontend && npm audit
	cd ../desktop && npm audit
	cd ../desktop/backend-bundle && npm audit
	```
6. Build and test the frontend for production:
	```bash
	cd frontend && npm run build && npm test
	```
7. Build desktop renderer/package checks:
	```bash
	cd desktop && npm install && npm run build:renderer
	```
8. Validate Docker deployment:
	```bash
	docker compose up --build
	docker compose ps
	docker compose logs backend
	docker compose logs frontend
	docker compose logs postgres
	```
9. Verify health endpoints after deployment:
	- `GET /health`
	- `GET /api/health`
 	- `GET /api/health/database`

CI workflows:

- `.github/workflows/backend-smoke-test.yml` runs backend smoke tests.
- `.github/workflows/release-readiness.yml` runs backend smoke tests and frontend build checks.
- `.github/workflows/ui-evidence.yml` builds the frontend and captures UI evidence.
- `.github/workflows/deploy-frontend-pages.yml` deploys the frontend to GitHub Pages for trial testing.
- `.github/workflows/windows-desktop-pilot.yml` builds Windows installer artifacts on demand for pilot distribution.
- `docs/ANDROID_WINDOWS_PILOT_RUNBOOK.md` defines the Android/Windows pilot release path and go/no-go checks.

## GitHub Pages Trial Deployment

1. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. (Recommended) Add repository variables:
   - `VITE_API_URL` (public API base URL, e.g. `https://api.example.com/api`)
   - `VITE_SOCKET_URL` (public socket URL, e.g. `https://api.example.com`)
3. Push to `main`/`master` (or run **Deploy Frontend to GitHub Pages** manually from the Actions tab).
	- Any commit that touches `frontend/**` or this workflow file will also retrigger the Pages deploy.
4. The trial site will be published at:
   - `https://<owner>.github.io/<repository-name>/`

### GitHub Free Domain (No Custom Domain)

- This repository is configured to use the default GitHub Pages domain.
- Public URL: `https://davincishah.github.io/devibe-oms/`
- In **GitHub → Settings → Pages**, leave **Custom domain** empty.
