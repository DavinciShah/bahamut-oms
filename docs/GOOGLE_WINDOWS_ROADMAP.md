# Google + Windows Rollout Roadmap

This project can move forward on two parallel tracks:

1. Free/low-cost web presence through Google services
2. Windows desktop application distribution

## 1) Website Through Google (Recommended Path)

Use:
- Frontend: Firebase Hosting (free tier available)
- Backend API: Google Cloud Run (free tier usage available)
- Database: keep existing PostgreSQL provider (you can use a free external PostgreSQL provider)

### A. Frontend deploy (Firebase Hosting)

From `frontend/`:

1. Install Firebase CLI:
   - `npm install -g firebase-tools`
2. Login:
   - `firebase login`
3. Set your project ID in `frontend/.firebaserc`
4. Build frontend using deployed API URL:
   - PowerShell:
     - `$env:VITE_API_URL="https://YOUR_CLOUD_RUN_URL/api"`
     - `$env:VITE_SOCKET_URL="https://YOUR_CLOUD_RUN_URL"`
     - `npm run build`
5. Deploy:
   - `firebase deploy --only hosting`

### B. Backend deploy (Cloud Run)

From `backend/`:

1. Install and auth gcloud CLI
2. Enable APIs in your GCP project:
   - Cloud Run Admin API
   - Cloud Build API
   - Artifact Registry API
3. Deploy with script:
   - `./deploy-cloudrun.ps1 -ProjectId "YOUR_PROJECT" -DatabaseUrl "YOUR_DATABASE_URL" -JwtSecret "..." -JwtRefreshSecret "..." -CorsOrigin "https://YOUR_FIREBASE_DOMAIN"`

### Required backend env values in Cloud Run

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`

Optional:
- `LOG_LEVEL`
- `STRIPE_SECRET_KEY`
- `SMTP_*`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 2) Windows App Track

Desktop scaffold is available under `desktop/`.

### Local desktop development

1. Start frontend dev server:
   - `cd frontend && npm run dev`
2. Run desktop shell:
   - `cd desktop && npm install && npm run dev`

### Build Windows installer

1. Build renderer for local API target:
   - `cd desktop && npm run build:renderer`
2. Package installer:
   - `npm run dist:win`

## Rollout order (practical)

1. Deploy backend API to Cloud Run
2. Deploy frontend to Firebase Hosting with correct `VITE_API_URL`
3. Smoke test auth, billing, BI, notifications
4. Build and test Windows installer
5. Distribute Windows installer to pilot users
