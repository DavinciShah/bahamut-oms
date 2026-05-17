# Android + Windows Pilot Runbook

This runbook implements the pilot release path for both launch tracks.

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
npm run open
```

`npm run open` opens the native project in Android Studio.
From Android Studio, generate signed APK/AAB and distribute through Play Internal Testing.

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

Then proceed:
- Android: Play Internal Testing track
- Windows: broader installer distribution
