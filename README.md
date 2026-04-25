# Order Management System (OMS)

## Overview
This project is a full-stack Order Management System built with Node.js, Express, React, and PostgreSQL.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
	```bash
	git clone https://github.com/DavinciShah/bahamut-oms.git
	cd bahamut-oms
	```
2. Navigate to the backend folder and install dependencies:
	```bash
	cd backend
	npm install
	```
3. Set up your PostgreSQL database and update configuration values in `.env`.
4. Run database migrations:
	```bash
	npm run migrate
	```
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

## Publish Readiness Checklist

Before publishing:

1. Configure production environment values from `backend/.env.example` with strong secrets.
2. Run backend migrations:
	```bash
	cd backend && npm run migrate
	```
3. Run backend smoke tests:
	```bash
	cd backend && npm run test:smoke
	```
4. Build frontend for production:
	```bash
	cd frontend && npm run build
	```
5. Verify health endpoints after deployment:
	- `GET /health`
	- `GET /api/health`

CI workflows:

- `.github/workflows/backend-smoke-test.yml` runs backend smoke tests.
- `.github/workflows/release-readiness.yml` runs backend smoke tests and frontend build checks.