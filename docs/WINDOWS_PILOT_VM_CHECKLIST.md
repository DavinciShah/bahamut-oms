# Windows Pilot VM — Go/No-Go Test Execution Checklist

Use this checklist when running the Windows pilot QA session in your VM.
Fill in every field, then submit results via the **Windows Pilot Go/No-Go Gate** workflow in GitHub Actions.

---

## 1. Environment

| Field | Value |
|---|---|
| Tester | <!-- e.g. @devibe --> |
| Test date | <!-- YYYY-MM-DD --> |
| VM type | <!-- Hyper-V / VirtualBox / Azure / GCP / other --> |
| Guest OS | <!-- e.g. Windows 11 22H2 --> |
| VM snapshot taken before install | <!-- Yes / No --> |
| Installer artifact | `De-Vibe-OMS-Setup-1.0.0.exe` |
| GitHub Actions run ID | `25987376181` |
| Artifact ID | `7041324141` (expires 2026-08-15) |
| Installer SHA-256 | <!-- run `certutil -hashfile De-Vibe-OMS-Setup-1.0.0.exe SHA256` and paste result --> |

---

## 2. Installation

- [ ] Downloaded `windows-desktop-installer` artifact from Actions run `25987376181`
- [ ] Transferred installer into clean VM
- [ ] Ran `De-Vibe-OMS-Setup-1.0.0.exe` — install completed without error
- [ ] App launched on first run — no startup crash
- [ ] App title bar / About shows version **1.0.0**
- [ ] Screenshot captured: install success

---

## 3. Flow 1 — Login / Register / Profile

Steps:
1. Open app (unauthenticated state).
2. Navigate to Register, create a new test account, verify redirect to dashboard.
3. Log out, navigate to Login, sign in with the test account.
4. Navigate to Profile page, verify user details display.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Register page renders | | | |
| New account creation succeeds | | | |
| Redirect to dashboard after register | | | |
| Login page renders | | | |
| Login with valid credentials succeeds | | | |
| Profile page renders with correct user info | | | |

**Flow 1 result:** PASS / FAIL <!-- circle one -->

---

## 4. Flow 2 — Orders

Steps:
1. Navigate to Orders list.
2. Confirm order rows load.
3. Click an order row to open Order Detail.
4. Confirm order detail fields render.
5. Click **+ New Order** button and confirm the creation form opens.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Orders list renders with data | | | |
| Order detail page renders | | | |
| + New Order form opens | | | |

**Flow 2 result:** PASS / FAIL <!-- circle one -->

---

## 5. Flow 3 — Products / Inventory

Steps:
1. Navigate to Inventory.
2. Confirm product/inventory rows display.
3. Confirm filtering or search (if available) responds without error.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Inventory page renders with data | | | |
| No console errors or blank states | | | |

**Flow 3 result:** PASS / FAIL <!-- circle one -->

---

## 6. Flow 4 — Billing / BI Dashboard

Steps:
1. Navigate to Billing.
2. Click Invoices, Payment History, and Subscription tabs.
3. Navigate to BI dashboard (`/bi`).
4. Confirm charts/data load without error.
5. Navigate to Analytics and Reports.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Billing page and all three tabs render | | | |
| BI dashboard renders without error | | | |
| Analytics page renders | | | |
| Reports page renders | | | |

**Flow 4 result:** PASS / FAIL <!-- circle one -->

---

## 7. Flow 5 — Support Tickets

Steps:
1. Navigate to Support.
2. Confirm ticket list renders.
3. Click a ticket row to open ticket detail.
4. Click **+ New Ticket** and confirm the form opens.
5. Click Knowledge Base tab and confirm it renders.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Support page and ticket list render | | | |
| Ticket detail renders | | | |
| + New Ticket form opens | | | |
| Knowledge Base tab renders | | | |

**Flow 5 result:** PASS / FAIL <!-- circle one -->

---

## 8. Auth / Session Persistence

Steps:
1. Sign in with test account.
2. Fully close the app (File → Quit or taskbar right-click → Close window).
3. Relaunch app from Start menu.
4. Confirm user is still signed in (dashboard loads, no redirect to login).
5. Reboot the VM.
6. Relaunch app after reboot.
7. Confirm user is still signed in.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| Session persists after app close + relaunch | | | |
| Session persists after VM reboot | | | |

**Persistence result:** PASS / FAIL <!-- circle one -->

---

## 9. API Stability (Soak — ~20 min)

Steps:
1. With the app open and signed in, navigate through all 5 flows once more at a relaxed pace (~20 minutes total).
2. Monitor for: network errors displayed in app UI, authentication loops (unexpected logouts), or blank/failed data loads.
3. Open Electron DevTools (`Ctrl+Shift+I`) and check the Console and Network tabs for persistent errors.

| Check | Pass | Fail | Notes |
|---|---|---|---|
| No 5xx errors in Network tab | | | |
| No auth/session loop observed | | | |
| No persistent blank data states | | | |
| Real-time / live-update features stable | | | |

**API stability result:** PASS / FAIL <!-- circle one -->

---

## 10. Defect Log

Record any defect found during testing. P0 = crash/data loss/security. P1 = core flow broken. P2 = degraded UX. P3 = cosmetic.

| # | Severity | Flow | Description | Repro Steps | Status |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**P0/P1 blockers found:** YES / NO <!-- circle one -->

---

## 11. Final Go/No-Go Decision

All five conditions must be YES to approve broader distribution:

| Gate | Result |
|---|---|
| All 5 core flows PASS | YES / NO |
| Auth/session persistence PASS | YES / NO |
| API stability PASS (no P0/P1) | YES / NO |
| No P0/P1 blocker defects | YES / NO |
| Installer installs and launches cleanly | YES / NO |

**Decision: GO / NO-GO** <!-- circle one -->

Tester signature: ___________________________  Date: ____________

---

## 12. Next Step (if GO)

Submit the completed results via the **Windows Pilot Go/No-Go Gate** workflow in GitHub Actions:

1. Go to **Actions → Windows Pilot Go/No-Go Gate**
2. Click **Run workflow**
3. Fill in each input field with your results from this checklist
4. The workflow will run automated backend + frontend checks and upload a signed-off report artifact

If **NO-GO**: file a GitHub Issue for each P0/P1 defect with severity label, screenshots, and exact repro steps before re-testing.
