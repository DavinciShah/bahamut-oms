# De Vibe OMS Desktop

## Purpose
This folder contains the Electron wrapper used to run De Vibe OMS as a Windows desktop application.

## Development
1. Start the frontend dev server:
   - `cd ../frontend && npm run dev`
2. In a separate terminal, start the desktop shell:
   - `cd desktop && npm install`
   - `npm run dev`

The Electron main process launches the local backend automatically on port `5000`.

## Launch Readiness Notes
- Desktop packaging bundles backend runtime files and production dependencies.
- On first launch, the app writes `%APPDATA%/De Vibe OMS/runtime-config.json`.
- If your local PostgreSQL configuration differs, edit that file before relaunch.

Default runtime config values:
- DB host: `localhost`
- DB port: `5432`
- DB name: `devibe_oms`
- DB user: `postgres`
- DB password: `password`
- CORS origins: `http://localhost:3000,http://127.0.0.1:3000,app://local,capacitor://localhost`

## Windows Build
1. Build the renderer for desktop API endpoints:
   - `npm run build:renderer`
2. Prepare backend bundle:
   - `npm run prepare:backend`
3. Create the Windows installer:
   - `npm run dist:win`

`npm run dist:win` already executes both preparation steps automatically.

## Pilot Distribution

- Manual CI packaging is available via **Windows Desktop Pilot Build** workflow:
  - `.github/workflows/windows-desktop-pilot.yml`
- Run it from the GitHub Actions tab and download the `windows-desktop-installer` artifact for pilot users.

## Required Environment
Most runtime values are read from `%APPDATA%/De Vibe OMS/runtime-config.json`.
You usually do not need shell environment variables for the packaged app.
