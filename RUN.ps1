# OMS (Order Management System) Run Script
# Usage: .\RUN.ps1 [option]
# Options: docker, backend, frontend, both

param(
    [string]$Option = "docker"
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

function Invoke-Compose {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    if (Get-Command docker -ErrorAction SilentlyContinue) {
        try {
            & docker compose @Args
            return $LASTEXITCODE
        }
        catch {
        }
    }

    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        & docker-compose @Args
        return $LASTEXITCODE
    }

    throw "Neither 'docker compose' nor 'docker-compose' is available on PATH."
}

function Run-Docker {
    Write-Host "🐳 Starting OMS with Docker Compose..." -ForegroundColor Cyan
    Set-Location $ProjectRoot

    if (!(Test-Path "backend/.env") -and (Test-Path "backend/.env.example")) {
        Write-Host "⚠️  backend/.env file not found. Creating from backend/.env.example..." -ForegroundColor Yellow
        Copy-Item "backend/.env.example" "backend/.env"
    }

    Invoke-Compose up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Docker compose failed to start services."
    }

    Write-Host "✅ Docker services started (PostgreSQL on 5432, Backend on 5000, Frontend on 80)" -ForegroundColor Green
    Write-Host "📊 PostgreSQL: localhost:5432" -ForegroundColor Gray
    Write-Host "🔧 Backend:    http://localhost:5000" -ForegroundColor Gray
    Write-Host "🌐 Frontend:   http://localhost" -ForegroundColor Gray
}

function Run-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
    Set-Location $BackendDir

    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed." }
    }

    npm start
}

function Run-Frontend {
    Write-Host "🌐 Starting Frontend Dev Server..." -ForegroundColor Cyan
    Set-Location $FrontendDir

    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
    }

    npm run dev
}

function Run-Both {
    Write-Host "🚀 Starting Both Services (Backend and Frontend)..." -ForegroundColor Cyan

    $backendCmd = "cd '$BackendDir'; npm install; if (`$LASTEXITCODE -ne 0) { exit `$LASTEXITCODE }; npm start"
    $frontendCmd = "cd '$FrontendDir'; npm install; if (`$LASTEXITCODE -ne 0) { exit `$LASTEXITCODE }; npm run dev"

    Write-Host "Backend window opening..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

    Start-Sleep -Seconds 3

    Write-Host "Frontend window opening..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

    Write-Host "Services started in separate windows" -ForegroundColor Green
}

switch ($Option.ToLower()) {
    "docker" { Run-Docker }
    "backend" { Run-Backend }
    "frontend" { Run-Frontend }
    "both" { Run-Both }
    default {
        Write-Host "OMS Run Script" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\RUN.ps1 [option]" -ForegroundColor White
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Yellow
        Write-Host "  docker    - Run all services using Docker Compose (recommended)" -ForegroundColor Gray
        Write-Host "  backend   - Run backend server only (Node.js)" -ForegroundColor Gray
        Write-Host "  frontend  - Run frontend dev server only (Vite)" -ForegroundColor Gray
        Write-Host "  both      - Run backend and frontend in separate terminal windows" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\RUN.ps1 docker" -ForegroundColor White
        Write-Host "  .\RUN.ps1 both" -ForegroundColor White
    }
}
