# Android + Windows Pilot Runbook

This runbook implements the pilot release path for both launch tracks.

## Prerequisites (must pass before gates)

- Node.js **20.x** and npm **9+** (CI uses Node 20).
- PostgreSQL **15+** running and reachable for backend migration/smoke checks.
- Android local toolchain:
  - Android Studio (latest stable)
  - Android SDK Platform **35**
  - Android SDK Build-Tools **35.x**
  - Android SDK Platform-Tools
  - JDK **17**

## 0) Backend DB baseline (required before app sync/build)

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/backend
npm ci
npm run migrate
```

`npm run migrate` executes the ordered, version-tracked migration runner and records applied files in `schema_migrations`.

Optional validation:

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/backend
node -e "const {query,pool}=require('./src/config/database');query('select filename,applied_at from schema_migrations order by filename').then(r=>{console.table(r.rows);pool.end();}).catch(e=>{console.error(e);pool.end();process.exit(1);});"
```

## 1) Android pilot path

### Runtime config profiles

Tracked profiles:
- `android/runtime-config.staging.json`
- `android/runtime-config.production.json`

Activate profile into `android/runtime-config.json`:

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/android
npm run use:config:staging
# or
npm run use:config:production
```

### Shell flow

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/android
npm install
npm run sync:staging
# or npm run sync:production
npm run doctor
npm run open
```

`npm run open` opens the native project in Android Studio.

### Signed production APK/AAB confirmation (Android Studio)

1. Configure release signing (local only, do not commit secrets):
   - Copy `/home/runner/work/bahamut-oms/bahamut-oms/android/native/keystore.properties.example` to `/home/runner/work/bahamut-oms/bahamut-oms/android/native/keystore.properties`
   - Fill `storeFile`, `storePassword`, `keyAlias`, `keyPassword`
2. In Android Studio, open `android/native/` and run:
   - **Build > Generate Signed Bundle / APK**
   - Generate **Android App Bundle (.aab)** for `release`
   - Generate **APK** for `release`
3. Confirm artifacts exist:
   - `android/native/app/release/app-release.aab`
   - `android/native/app/release/app-release.apk`
4. Verify APK signature:
   ```bash
   /path/to/android-sdk/build-tools/35.0.0/apksigner verify --print-certs /home/runner/work/bahamut-oms/bahamut-oms/android/native/app/release/app-release.apk
   ```
5. Capture SHA-256 certificate fingerprint from `apksigner` output and attach it to pilot release evidence.
6. Distribute the signed AAB to **Play Internal Testing**.

## 2) Windows pilot path

### Dependency hygiene

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/frontend && npm ci
cd /home/runner/work/bahamut-oms/bahamut-oms/desktop && npm ci
```

### Build and packaging

```bash
cd /home/runner/work/bahamut-oms/bahamut-oms/desktop
npm run dist:win
```

### CI pilot packaging

Trigger the manual workflow:
- `.github/workflows/windows-desktop-pilot.yml`

In GitHub Actions:
1. Open **Windows Desktop Pilot Build**
2. Click **Run workflow**
3. Download `windows-desktop-installer` artifact
4. Install on pilot Windows machines

## 3) Go/No-Go gate (both tracks)

Validate these flows before broader rollout:
- Login/register/profile
- Orders list and order detail
- Product/inventory visibility
- Billing overview and BI dashboard
- Support ticket visibility

Go only when:
- No P0/P1 blocker defects
- Auth/session persistence works after app restart
- API connectivity is stable for both tracks
- Signed production APK/AAB is generated and signature-verified

Then proceed:
- Android: Play Internal Testing track
- Windows: broader installer distribution
