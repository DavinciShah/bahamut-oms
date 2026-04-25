# Bahamut OMS Desktop

## Purpose
This folder contains the Electron wrapper used to run Bahamut OMS as a Windows desktop application.

## Development
1. Start the frontend dev server:
   - `cd ../frontend && npm run dev`
2. In a separate terminal, start the desktop shell:
   - `cd desktop && npm install`
   - `npm run dev`

The Electron main process launches the local backend automatically on port `5000`.

## Launch Readiness Notes
- Desktop packaging bundles backend runtime files and production dependencies.
- On first launch, the app writes `%APPDATA%/Bahamut OMS/runtime-config.json`.
- If your local PostgreSQL configuration differs, edit that file before relaunch.

Default runtime config values:
- DB host: `localhost`
- DB port: `5432`
- DB name: `bahamut_oms`
- DB user: `postgres`
- DB password: `password`

## Windows Build
1. Build the renderer for desktop API endpoints:
   - `npm run build:renderer`
2. Prepare backend bundle:
   - `npm run prepare:backend`
3. Create the Windows installer:
   - `npm run dist:win`

`npm run dist:win` already executes both preparation steps automatically.

## Required Environment
Most runtime values are read from `%APPDATA%/Bahamut OMS/runtime-config.json`.
You usually do not need shell environment variables for the packaged app.
