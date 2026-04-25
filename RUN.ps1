# OMS (Order Management System) Run Script
# Usage: .\RUN.ps1 [option]
# Options: docker, backend, frontend, both

param(
    [string]$Option = "docker"
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

function Run-Docker {
    Write-Host "🐳 Starting OMS with Docker Compose..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    if (!(Test-Path ".env")) {
        Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    }
    
    docker-compose up -d
    Write-Host "✅ Docker services started (PostgreSQL on 5432, Backend on 5000, Frontend on 3000)" -ForegroundColor Green
    Write-Host "📊 PostgreSQL: localhost:5432" -ForegroundColor Gray
    Write-Host "🔧 Backend:    http://localhost:5000" -ForegroundColor Gray
    Write-Host "🌐 Frontend:   http://localhost:3000" -ForegroundColor Gray
}

function Run-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
    Set-Location $BackendDir
    
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    npm start
}

function Run-Frontend {
    Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
    Set-Location $FrontendDir
    
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    npm start
}

function Run-Both {
    Write-Host "🚀 Starting Both Services (Backend and Frontend)..." -ForegroundColor Cyan
    
    $backendCmd = "cd '$BackendDir'; npm install; npm start"
    $frontendCmd = "cd '$FrontendDir'; npm install; npm start"
    
    # Start backend in a new window
    Write-Host "Backend window opening..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
    
    Start-Sleep -Seconds 3
    
    # Start frontend in a new window
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
        Write-Host "  frontend  - Run frontend server only (React)" -ForegroundColor Gray
        Write-Host "  both      - Run backend and frontend in separate terminal windows" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\RUN.ps1 docker" -ForegroundColor White
        Write-Host "  .\RUN.ps1 both" -ForegroundColor White
    }
}
