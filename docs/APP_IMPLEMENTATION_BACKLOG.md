# App-First Implementation Backlog

## Scope Freeze
- Keep website/static pages and frontend site as maintenance-only.
- Route new feature delivery to Windows (`desktop/`) and Android (`android/`) tracks.

## Milestone A — Windows Stabilization + Pilot
- [ ] Validate packaged runtime config editing workflow (`%APPDATA%/Bahamut OMS/runtime-config.json`).
- [ ] Run installer smoke checks on clean Windows VM.
- [x] Add CI workflow to build Windows installer artifacts on demand.
- [ ] Pilot distribution checklist (install, launch, auth, order workflow, uninstall).

## Milestone B — Android MVP Alpha
- [x] Initialize Android track folder and runtime config contract.
- [ ] Create Android shell app project and wire runtime-config values.
- [ ] Implement auth/session flow and secure token storage.
- [ ] Implement core read workflows (dashboard, orders, inventory, products).
- [ ] Add baseline offline/error handling for network failures.

## Milestone C — Shared Backend Hardening
- [x] Enable multi-origin CORS strategy for desktop + Android client origins.
- [x] Add smoke checks for app client health and CORS preflight.
- [ ] Add client-aware telemetry labels for web/windows/android traffic.
- [ ] Add staged QA matrix for web + windows + android parity verification.
