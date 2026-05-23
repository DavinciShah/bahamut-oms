# Desktop Icon Assets

This directory contains all icon and image assets for the Bahamut OMS desktop app.

## Files

| File | Purpose |
|------|---------|
| `icon.ico` | Multi-resolution Windows application icon (16–256 px). Used by NSIS installer and the `.exe` taskbar / title-bar icon. Referenced in `build.win.icon` and `build.nsis.installerIcon` in `package.json`. |
| `icon.png` | 256 × 256 PNG master icon. |
| `icon-16.png` – `icon-256.png` | Individual resolution PNG files. |
| `msix/` | MSIX / Windows Store logo assets (see below). |

## MSIX Store Assets (`msix/`)

| File | Size | Windows Store requirement |
|------|------|--------------------------|
| `StoreLogo.png` | 50 × 50 | Store listing tile |
| `Square44x44Logo.png` | 44 × 44 | Start menu small tile |
| `Square150x150Logo.png` | 150 × 150 | Start menu medium tile |
| `Wide310x150Logo.png` | 310 × 150 | Start menu wide tile |
| `SplashScreen.png` | 620 × 300 | App splash screen |

These are used by `scripts/build-msix.ps1` when assembling the MSIX package.

## Replacing with Production-Quality Artwork

The current icons are auto-generated from the SVG brand mark in `assets/img/`.
For a polished Store listing, replace the files in this directory with
professionally designed assets before submitting to the Microsoft Store.

Microsoft Store icon guidelines:
<https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design>

To regenerate placeholder icons (requires Python ≥ 3.9 and Pillow):

```bash
pip install Pillow
python3 desktop/scripts/generate-icons.py
```
