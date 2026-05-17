# Bahamut OMS Android Track

## Scope
This folder is the Android-first track for Bahamut OMS.

The website remains maintenance-only while Android and Windows app delivery are prioritized.

## Direction
Current Android direction is a WebView-based app shell with native packaging and release controls.

The shell is implemented with Capacitor and packages the existing `frontend/` build into a native Android project under `android/native/`.

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
1. Install Android shell dependencies:
   - `cd android && npm install`
2. Activate staging or production profile and sync web assets:
   - `npm run sync:staging`
   - `npm run sync:production`
3. Open the native Android project in Android Studio:
   - `npm run open`

If `runtime-config.json` does not exist, the sync step falls back to `runtime-config.example.json` (local emulator defaults).

## Milestones
1. **MVP Alpha**: auth + dashboard + orders + inventory read paths
2. **Internal Pilot**: billing + BI + support visibility, error/offline baseline
3. **Rollout**: telemetry hardening, staged Play internal testing
