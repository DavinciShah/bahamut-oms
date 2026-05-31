# De Vibe OMS Android Track

## Scope
This folder is the Android-first track for De Vibe OMS.

The website remains maintenance-only while Android and Windows app delivery are prioritized.

## Direction
Current Android direction is a WebView-based app shell with native packaging and release controls.

The shell is implemented with Capacitor and packages the existing `frontend/` build into a native Android project under `android/native/`.

## Required Android Toolchain
- Node.js **20.x**
- npm **9+**
- Android Studio (latest stable)
- Android SDK Platform **35**
- Android SDK Build-Tools **35.x**
- Android SDK Platform-Tools
- JDK **17**

## MVP Feature Parity Targets
- Authentication (login/register/profile)
- Orders list and order detail
- Product + inventory visibility
- Billing overview and BI dashboard summary
- Support ticket visibility

## Environment Contract
Use tracked runtime profiles and activate one into `runtime-config.json`:
- `runtime-config.staging.json`
- `runtime-config.production.json`

Activation commands:
- `npm run use:config:staging`
- `npm run use:config:production`

Each profile defines:
- `apiBaseUrl`
- `socketBaseUrl`
- `authStorageKey`
- `requestTimeoutMs`

When you run `npm run sync` from this folder, the selected runtime config is written into the generated frontend build as `runtime-config.js` before Capacitor syncs assets into the native shell.

## Local Setup
0. Ensure backend database is on latest migration format:
   - `cd /home/runner/work/devibe-oms/devibe-oms/backend && npm ci && npm run migrate`
1. Install Android shell dependencies:
   - `cd android && npm install`
2. Activate staging or production profile and sync web assets:
    - `npm run sync:staging`
    - `npm run sync:production`
3. Verify local Capacitor/Android setup:
   - `npm run doctor`
4. Open the native Android project in Android Studio:
     - `npm run open`

If `runtime-config.json` does not exist, the sync step falls back to `runtime-config.example.json` (local emulator defaults).

## Production signing (APK/AAB)
Release signing credentials are loaded from one of:
- `android/native/keystore.properties` (preferred for Android Studio)
- Environment variables: `BAHAMUT_UPLOAD_STORE_FILE`, `BAHAMUT_UPLOAD_STORE_PASSWORD`, `BAHAMUT_UPLOAD_KEY_ALIAS`, `BAHAMUT_UPLOAD_KEY_PASSWORD`

Setup:
1. Copy `android/native/keystore.properties.example` to `android/native/keystore.properties`.
2. Fill local keystore values (file is gitignored).
3. Open Android Studio (`npm run open`) and generate signed release artifacts:
   - **Build > Generate Signed Bundle / APK**
   - Build `release` AAB and APK
4. Verify output and signature:
   - `android/native/app/release/app-release.aab`
   - `android/native/app/release/app-release.apk`
   - `apksigner verify --print-certs android/native/app/release/app-release.apk`

## AdMob SDK
- Capacitor AdMob plugin is installed: `@capacitor-community/admob`.
- Android app ID is configured in `android/native/app/src/main/AndroidManifest.xml` using:
  - `ca-app-pub-3329711838881296~2281114793`

### Quick validation
1. Sync native project updates:
   - `cd android && npm run sync:production`
2. Open Android project:
   - `npm run open`
3. Build and run from Android Studio, then confirm startup is successful without AdMob manifest/app-id errors in Logcat.

## Milestones
1. **MVP Alpha**: auth + dashboard + orders + inventory read paths
2. **Internal Pilot**: billing + BI + support visibility, error/offline baseline
3. **Rollout**: telemetry hardening, staged Play internal testing
