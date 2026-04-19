# Setup Guide

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** v15 or higher (for local dev without Docker)
- **Docker** v24+ and **Docker Compose** v2+ (for containerised dev)
- **Git**

---

## Local Development (without Docker)

### 1. Clone the repository

```bash
git clone https://github.com/DavinciShah/bahamut-oms.git
cd bahamut-oms
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bahamut_oms
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3000
```

### 3. Database setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE bahamut_oms;"

# Run the init migration
psql -U postgres -d bahamut_oms -f backend/migrations/init.sql
```

### 4. Start the backend

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The API will be available at `http://localhost:5000`.

### 5. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Local Development (with Docker)

### Start all services

```bash
docker compose up --build
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:5000      |
| Postgres | localhost:5432             |

### Stop all services

```bash
docker compose down
```

### Stop and remove volumes (reset database)

```bash
docker compose down -v
```

---

## Environment Variables

### Backend

| Variable            | Default                        | Description                          |
|---------------------|--------------------------------|--------------------------------------|
| `NODE_ENV`          | `development`                  | Runtime environment                  |
| `PORT`              | `5000`                         | HTTP server port                     |
| `DB_HOST`           | `localhost`                    | PostgreSQL host                      |
| `DB_PORT`           | `5432`                         | PostgreSQL port                      |
| `DB_NAME`           | `bahamut_oms`                  | Database name                        |
| `DB_USER`           | `postgres`                     | Database user                        |
| `DB_PASSWORD`       | `password`                     | Database password                    |
| `JWT_SECRET`        | —                              | Secret for signing access tokens     |
| `JWT_REFRESH_SECRET`| —                              | Secret for signing refresh tokens    |
| `CORS_ORIGIN`       | `http://localhost:3000`        | Allowed CORS origin                  |

### Frontend

| Variable        | Default                        | Description          |
|-----------------|--------------------------------|----------------------|
| `VITE_API_URL`  | `http://localhost:5000/api`    | Backend API base URL |

---

## Running Tests

### Backend tests

```bash
cd backend
npm test
```

Coverage reports are written to `backend/coverage/`.

### Frontend tests

```bash
cd frontend
npm test
```

Coverage reports are written to `frontend/coverage/`.

---

## Useful Commands

```bash
# View backend logs (Docker)
docker compose logs -f backend

# Open a psql shell inside the running Postgres container
docker compose exec postgres psql -U postgres -d bahamut_oms

# Rebuild a single service
docker compose up --build backend
```
