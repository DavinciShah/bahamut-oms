# Deployment Guide

## Docker Deployment (recommended)

### Development

```bash
docker compose up --build
```

### Production

1. Create `.env.prod` in the repo root:

```env
DB_NAME=bahamut_oms
DB_USER=postgres
DB_PASSWORD=<strong-password>
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
CORS_ORIGIN=https://yourdomain.com
```

2. Start the stack:

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## GitHub Pages Frontend + Free-tier Backend (testing)

Use this mode to test with free hosting:
- Frontend: GitHub Pages (this repo now includes `.github/workflows/deploy-frontend-pages.yml`)
- Backend: a Node.js host (Render/Railway/Fly/Cloud Run free tier)
- Database: managed Postgres (Neon/Supabase/Render Postgres free tier)

### 1) Configure GitHub Pages

- In GitHub repo settings, set **Pages source** to **GitHub Actions**
- Run the **Deploy Frontend to GitHub Pages** workflow

### 2) Add frontend build variables in GitHub (Settings → Secrets and variables → Actions → Variables)

- `VITE_API_URL=https://<your-backend-domain>/api`
- `VITE_SOCKET_URL=https://<your-backend-domain>`
- `VITE_GOOGLE_CLIENT_ID=<your-client-id>`
- Optional: `VITE_BASE_PATH=/your-repo-name/` (defaults to `/<repo-name>/`)

For project Pages sites, keep `VITE_BASE_PATH` as the repository path.

### 3) Configure backend environment

Set at least:
- `NODE_ENV=production`
- `DATABASE_URL` (or DB host/user/password vars)
- `JWT_SECRET` and `JWT_REFRESH_SECRET` (strong random values)
- `CORS_ORIGIN=https://<username>.github.io` (or your custom Pages domain)
- `FRONTEND_URL=https://<username>.github.io/<repository-name>/` (or your custom domain)

If you attach a custom domain to Pages, update `CORS_ORIGIN` and `FRONTEND_URL` to that domain.

---

## Production Checklist

- [ ] Replace all `change-me-*` secrets with cryptographically random values
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `DB_PASSWORD`
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Enable HTTPS (terminate TLS at nginx or a load balancer)
- [ ] Configure database backups for the `postgres_data` volume
- [ ] Set up log aggregation (the backend uses Winston)
- [ ] Monitor `/health` endpoint for uptime checks
