# Bahamut OMS Android Track

## Scope
This folder is the Android-first track for Bahamut OMS.

The website remains maintenance-only while Android and Windows app delivery are prioritized.

## Direction
Current Android direction is a WebView-based app shell with native packaging and release controls.

## MVP Feature Parity Targets
- Authentication (login/register/profile)
- Orders list and order detail
- Product + inventory visibility
- Billing overview and BI dashboard summary
- Support ticket visibility

## Environment Contract
Copy `runtime-config.example.json` to `runtime-config.json` and set:
- `apiBaseUrl`
- `socketBaseUrl`
- `authStorageKey`
- `requestTimeoutMs`

## Milestones
1. **MVP Alpha**: auth + dashboard + orders + inventory read paths
2. **Internal Pilot**: billing + BI + support visibility, error/offline baseline
3. **Rollout**: telemetry hardening, staged Play internal testing
