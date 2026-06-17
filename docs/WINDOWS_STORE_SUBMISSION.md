# Windows Store Submission Guide

This document walks through the end-to-end process of submitting **De Vibe OMS** to the
Microsoft Store via **Partner Center**.

---

## 1. Pre-requisites

| Item | Detail |
|------|--------|
| Microsoft account | Used to sign in to Partner Center |
| Partner Center developer account | Enrol at <https://partner.microsoft.com/dashboard> (one-time ~$19 USD registration fee for individuals) |
| Windows SDK | Includes `makeappx.exe` and `signtool.exe` (auto-downloaded by electron-builder) |
| Code-signing certificate | Obtained from Partner Center (free) after app registration |
| `PFX_PASSWORD` secret | Set in GitHub repository secrets (Settings → Secrets → Actions) |

---

## 2. Register the App in Partner Center

1. Go to <https://partner.microsoft.com/dashboard/windows/overview>.
2. Click **Create a new app**.
3. Reserve the name **De Vibe OMS**.
4. Note the **Package/Identity Name** (e.g. `12345Publisher.DeVibeOMS`) and
   **Publisher** identity string (e.g. `CN=12345Publisher, O=..., L=..., C=US`).

> **Update these values before packaging:**
> - `desktop/scripts/build-msix.ps1` → set `$env:MSIX_PUBLISHER` to the Publisher string.
> - `desktop/package.json` → `build.appx.publisher` and `build.appx.identityName`.

---

## 3. Build the MSIX Package

```powershell
# From the desktop\ directory:
$env:MSIX_PUBLISHER = "CN=<your-partner-center-publisher-string>"
npm run dist:win          # produces dist\win-unpacked\
npm run dist:msix         # produces dist\De-Vibe-OMS-1.0.0.msix
```

For **signed** packages (required for sideload and recommended before Store upload):

```powershell
$env:PFX_PATH     = "C:\path\to\partner-center.pfx"
$env:PFX_PASSWORD = "<pfx-password>"
$env:MSIX_PUBLISHER = "CN=<partner-center-publisher>"
npm run dist:msix
```

For CI/CD via GitHub Actions, set `PFX_PATH`, `PFX_PASSWORD`, and `MSIX_PUBLISHER` as
repository secrets.

---

## 4. Store Listing Requirements

Fill these in Partner Center → **Store listing** tab:

| Field | Value |
|-------|-------|
| App name | De Vibe OMS |
| Short description (≤ 200 chars) | Manage orders, inventory, suppliers and billing in a single Windows app. |
| Description | See `README.md` → project overview section |
| Category | Business > Productivity |
| Sub-category | Business Management Software |
| Keywords | OMS, order management, inventory, ERP, warehouse |
| Privacy policy URL | Your hosted privacy policy page |
| Website URL | <https://github.com/devibe/devibe-oms> |
| Support contact | devibe70@gmail.com |

### Screenshots

Provide at least **3 screenshots** at 1366 × 768 or larger (PNG or JPEG):
- Dashboard / order list view
- Inventory management view
- Billing / subscription page

The QA-evidence screenshots in `docs/qa-evidence/` may be used as a starting point.

### Icons (already generated at `desktop/assets/`)

| Asset | Size | File |
|-------|------|------|
| Store logo | 50 × 50 | `assets/msix/StoreLogo.png` |
| Square tile | 150 × 150 | `assets/msix/Square150x150Logo.png` |
| Small tile | 44 × 44 | `assets/msix/Square44x44Logo.png` |
| Wide tile | 310 × 150 | `assets/msix/Wide310x150Logo.png` |
| Splash screen | 620 × 300 | `assets/msix/SplashScreen.png` |

---

## 5. Age Ratings

Complete the **Age ratings questionnaire** in Partner Center.  
De Vibe OMS is a business app with no user-generated content, violence, or mature themes.
Expected rating: **Everyone (3+)** / **PEGI 3**.

---

## 6. Upload the Package

1. In Partner Center → **Packages** → **Upload packages**.
2. Upload `desktop/dist/De-Vibe-OMS-<version>.msix`.
3. Partner Center validates the manifest automatically.
4. Fix any validation errors shown in the portal.

Common validation issues:

| Error | Fix |
|-------|-----|
| Publisher mismatch | Update `$env:MSIX_PUBLISHER` to match Partner Center exactly |
| Version already exists | Bump `version` in `desktop/package.json` |
| Missing capability declaration | Add required capabilities in `AppxManifest.xml` within `build-msix.ps1` |

---

## 7. Certification & Publishing

After submission Partner Center runs automated and manual review (typically 1–3 business days).
Upon approval, the app becomes available in the Microsoft Store.

---

## 8. Winget Community Repo Submission

After the `.exe` installer is built:

1. Calculate the SHA-256 of the NSIS installer:
   ```powershell
   CertUtil -hashfile De-Vibe-OMS-Setup-1.0.0.exe SHA256
   ```
2. Update `desktop/winget/manifest.yaml`:
   - Set `InstallerUrl` to a direct hot-link URL that starts download immediately (**HTTP 200, no redirect**).
   - Example: `https://downloads.devibe-oms.com/windows/v1.0.0/De-Vibe-OMS-Setup-1.0.0.exe`
   - Verify with:
     ```bash
     curl -I https://downloads.devibe-oms.com/windows/v1.0.0/De-Vibe-OMS-Setup-1.0.0.exe
     ```
     The response should be `200 OK` with no `Location` redirect header.
   - Replace `InstallerSha256` with the real hash.
   - Set `PackageUrl` to the same direct Win32 `.exe` package URL.
   - Update `InstallerUrl` if the release tag differs.
3. Fork [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs) and open a PR
   adding the manifest under `manifests/d/devibe/DeVibeOMS/1.0.0/`.

---

## 9. Environment Variables Reference

| Variable | Purpose | Required for |
|----------|---------|-------------|
| `PFX_PATH` | Path to code-signing PFX file | Signed local builds |
| `PFX_PASSWORD` | Password for the PFX file | Signed local builds |
| `MSIX_PUBLISHER` | Partner Center Publisher string | Store submission |

Set these as **GitHub Actions repository secrets** for CI signing.
