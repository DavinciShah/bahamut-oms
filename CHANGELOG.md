# Changelog

All notable changes to Bahamut OMS are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2024-12-31

### Added
- **Core OMS**: order management, customer and supplier records, inventory tracking.
- **Windows desktop client** (Electron + NSIS installer) with embedded Node.js backend.
- **Android mobile client** (Capacitor) targeting Android 13+ (API 33).
- **Web frontend** deployed to GitHub Pages at https://davincishah.github.io/bahamut-oms/.
- **Multi-tenant architecture**: tenant-scoped auth via JWT, row-level isolation.
- **Billing & subscription**: Free / Standard ($29) / Professional ($79) / Enterprise ($149) tiers with USD, INR, and AED pricing; Stripe payment-intent integration.
- **Payment invoices**: invoice model with PDF-ready fields; `/payments/invoices` API.
- **Accounting module**: GL, journal entries, trial balance, and income-statement endpoints.
- **Integration hub**: marketplace listings for Amazon, Shopify, WooCommerce, and custom webhooks.
- **MSIX / Windows Store package**: `build-msix.ps1` script with signed-package support and Partner-Center–ready AppxManifest.
- **Winget manifest** (`desktop/winget/manifest.yaml`) ready for community-repo submission after v1.0.0 release tag.
- **CI workflows**: backend smoke tests, frontend build check, Windows installer pilot, Android APK pilot, release-readiness gate, and UI-evidence capture.
- **Versioned database migrations**: `001_core_tables.sql`, `002_integration_tables.sql`, `003_accounting_tables.sql`.
- **Branded desktop icons**: multi-resolution ICO (16–256 px) and full MSIX asset set.

### Security
- JWT auth middleware attaches `tenant_id` from token claims to every request.
- `nodemailer` pinned to ≥ 7.0.11 (patches addressparser DoS and domain-confusion CVEs).
- PFX signing password read from `PFX_PASSWORD` environment variable; no hardcoded secrets.

---

[1.0.0]: https://github.com/DavinciShah/bahamut-oms/releases/tag/v1.0.0
