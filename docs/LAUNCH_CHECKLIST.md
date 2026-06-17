# Launch Checklist – De Vibe OMS v1.0.0

Work through every item below before going live. Check off each item as it is completed.

---

## 1. Backend

- [ ] All environment variables set in production:
  - `NODE_ENV=production`
  - `PORT`
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET` (random, ≥ 48 bytes each)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `SENDGRID_API_KEY` (or SMTP vars)
  - `CORS_ORIGIN` (comma-separated list of allowed origins)
- [ ] Database migrations applied (`backend/src/migrations/001_*.sql` → `003_*.sql`)
- [ ] Health endpoint responding: `GET /health` → `200 OK`
- [ ] Backend smoke tests passing: `npm run test:smoke`
- [ ] HTTPS / reverse-proxy configured (Nginx, Caddy, or cloud LB)
- [ ] Database backups scheduled and tested

## 2. Frontend (Web)

- [ ] `VITE_API_URL` set to production backend URL
- [ ] `npm run build` succeeds with no errors
- [ ] GitHub Pages deployment workflow (`deploy-frontend-pages.yml`) completed successfully
- [ ] App loads at <https://devibe.github.io/devibe-oms/> and login works
- [ ] Stripe publishable key configured in frontend env

## 3. Windows Desktop Client

- [ ] `desktop/package.json` version bumped to release version
- [ ] Icon files present: `desktop/assets/icon.ico`, `desktop/assets/msix/`
- [ ] NSIS installer builds: `npm run dist:win` → `De-Vibe-OMS-Setup-1.0.0.exe`
- [ ] Installer tested on a clean Windows 10/11 machine
- [ ] `De-Vibe-OMS-Setup-1.0.0.exe` attached to the `v1.0.0` GitHub Release
- [ ] Winget manifest SHA-256 updated in `desktop/winget/manifest.yaml`
- [ ] Winget PR opened against `microsoft/winget-pkgs` *(optional at launch)*

### Windows Store (MSIX)

- [ ] Partner Center developer account created
- [ ] App name **De Vibe OMS** reserved in Partner Center
- [ ] `$env:MSIX_PUBLISHER` set to Partner Center publisher string
- [ ] `desktop/package.json` → `build.appx.publisher` and `build.appx.identityName` updated
- [ ] MSIX builds: `npm run dist:msix` → `De-Vibe-OMS-1.0.0.msix`
- [ ] MSIX signed with Partner Center certificate
- [ ] Store listing complete (description, screenshots, icons, age rating, privacy policy)
- [ ] Package uploaded and validated in Partner Center
- [ ] Submission approved and published

## 4. Android Mobile Client

- [ ] `android/native/app/build.gradle` version code and name match release version
- [ ] Signing keystore configured (`android/native/keystore.properties` or env vars)
- [ ] Release APK/AAB builds without errors
- [ ] App tested on Android 13+ device / emulator
- [ ] Google Play Console app created (if publishing to Play Store)
- [ ] AAB uploaded to Play Store Internal Testing track
- [ ] App promoted through Closed Testing → Open Testing → Production

## 5. Billing & Payments

- [ ] Stripe account in **live mode** (not test mode)
- [ ] Live Stripe keys set in production environment
- [ ] Stripe webhook endpoint registered: `POST /payments/webhook`
- [ ] Webhook secret (`STRIPE_WEBHOOK_SECRET`) matches Stripe dashboard
- [ ] Payment intent flow tested end-to-end with a real card
- [ ] Subscription upgrade / downgrade / cancel flow tested
- [ ] Invoice generation and retrieval tested
- [ ] All three currency tiers (USD / INR / AED) verified

## 6. Security

- [ ] No secrets committed to the repository (run `git log --all -S "password"` to verify)
- [ ] `JWT_SECRET` rotated to a fresh random value for production
- [ ] Database not publicly accessible (private network / VPC)
- [ ] HTTPS enforced (HTTP → HTTPS redirect)
- [ ] Content-Security-Policy header set on frontend
- [ ] `SECURITY.md` updated with real contact information

## 7. Documentation & Legal

- [ ] `LICENSE` file present (MIT)
- [ ] `README.md` updated with production URLs and install instructions
- [ ] `CHANGELOG.md` v1.0.0 entry complete
- [ ] `SECURITY.md` contact email replaced with a real address
- [ ] Privacy policy page published and linked from Store listing

## 8. Monitoring & Operations

- [ ] Error tracking configured (Sentry, Rollbar, or similar)
- [ ] Uptime monitoring configured (e.g. UptimeRobot)
- [ ] Log aggregation set up for production backend
- [ ] On-call runbook documented for common failure scenarios
- [ ] Database connection pooling configured appropriately for expected load

## 9. GitHub Release

- [ ] All launch PRs merged to `main`
- [ ] `desktop/package.json` version = `1.0.0`
- [ ] Git tag `v1.0.0` created and pushed
- [ ] GitHub Release created from tag with:
  - [ ] `De-Vibe-OMS-Setup-1.0.0.exe` (Windows NSIS installer)
  - [ ] `De-Vibe-OMS-1.0.0.msix` (Windows Store / sideload package)
  - [ ] Release notes copied from `CHANGELOG.md`

---

*Last updated: 2024-12-31*
