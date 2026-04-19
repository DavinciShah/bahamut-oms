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

## Production Checklist

- [ ] Replace all `change-me-*` secrets with cryptographically random values
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `DB_PASSWORD`
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Enable HTTPS (terminate TLS at nginx or a load balancer)
- [ ] Configure database backups for the `postgres_data` volume
- [ ] Set up log aggregation (the backend uses Winston)
- [ ] Monitor `/health` endpoint for uptime checks
