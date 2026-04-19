# Bahamut OMS - Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (included with Docker Desktop)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/DavinciShah/bahamut-oms.git
cd bahamut-oms
```

### Step 2: Create .env File
```bash
cp backend/.env.example backend/.env
```

### Step 3: Edit .env (Optional - Use defaults for local testing)
```bash
# On Linux/Mac
nano backend/.env

# On Windows (PowerShell)
notepad backend\.env
```

**Key settings for local development:**
- DB_HOST=postgres (already set for Docker)
- DB_USER=bahamut_user
- DB_PASSWORD=CHANGE_ME_IN_PRODUCTION
- JWT_SECRET=REPLACE_WITH_RANDOM_STRING_MIN_32_CHARS

### Step 4: Start Application
```bash
# Start all services (backend, frontend, database)
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 5: Access Application
- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000
- **Database Admin (PgAdmin):** http://localhost:5050

**Default Credentials:**
- PgAdmin Email: admin@example.com
- PgAdmin Password: admin

### Step 6: Create Test User (Optional)
```bash
# Access backend container
docker-compose exec backend sh

# Run seed script (if available)
npm run seed

# Or curl register endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

## Production Deployment

### Using docker-compose.prod.yml

```bash
# Create .env.prod file with production values
cp backend/.env.example backend/.env.prod

# Edit with production values
nano backend/.env.prod

# Deploy using production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| DB_HOST | Database hostname | your-db.example.com |
| DB_USER | Database user | prod_user |
| DB_PASSWORD | Database password | ComplexPassword123!@#$% |
| JWT_SECRET | JWT signing secret | long-random-string-min-32-chars |
| STRIPE_SECRET_KEY | Stripe API key | sk_live_... |
| API_URL | Backend URL | https://api.example.com |
| FRONTEND_URL | Frontend URL | https://example.com |

## Docker Commands Reference

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v

# Rebuild images
docker-compose up --build

# Access backend shell
docker-compose exec backend sh

# Run migrations
docker-compose exec backend npm run migrate

# View database
docker-compose exec postgres psql -U bahamut_user -d bahamut_oms
```

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Frontend: 80 -> 8080
# Backend: 5000 -> 5001
```

### Database Connection Failed
```bash
# Ensure postgres is running
docker-compose logs postgres

# Verify credentials in .env match docker-compose.yml
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
docker-compose exec frontend curl http://backend:5000/api/health

# Verify CORS settings in backend
```

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend (should return HTML)
curl http://localhost
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U bahamut_user bahamut_oms > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U bahamut_user bahamut_oms < backup.sql
```

## Next Steps

1. **User Management** - Create admin user and set up teams
2. **Configure Integrations** - Connect accounting software (Tally, Zoho, etc.)
3. **Setup Notifications** - Configure email and SMS
4. **Enable SSL** - Setup HTTPS with Let's Encrypt
5. **Monitor Performance** - Setup monitoring and alerts

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review documentation: See README.md
3. Open an issue: https://github.com/DavinciShah/bahamut-oms/issues
