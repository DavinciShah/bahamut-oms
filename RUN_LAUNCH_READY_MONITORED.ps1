param(
    [string]$ProjectRef = "dfztgprnryutbtqnnjqz",
    [switch]$SkipDesktopBuild,
    [switch]$SkipSupabaseCheck,
    [string]$SupabasePassword
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "[launch-ready-monitored] $msg" -ForegroundColor Cyan
}

function Stop-ProcessTree {
    param([int]$ParentPid)
    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentPid" -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        Stop-ProcessTree -ParentPid $child.ProcessId
    }
    try {
        Stop-Process -Id $ParentPid -Force -ErrorAction SilentlyContinue
    } catch {}
}

function Invoke-MonitoredTask {
    param(
        [string]$TaskName,
        [string]$Command,
        [string]$WorkingDirectory,
        [int]$TimeoutSec,
        [int]$MaxRetries = 2
    )

    $retryCount = 0
    $success = $false

    while (-not $success -and $retryCount -le $MaxRetries) {
        if ($retryCount -gt 0) {
            Write-Host "[monitor] RETRYING task '$TaskName' (Attempt $($retryCount + 1)/$($MaxRetries + 1))..." -ForegroundColor Yellow
        } else {
            Write-Host "[monitor] Starting task '$TaskName'..." -ForegroundColor Cyan
        }

        $startTime = Get-Date
        $fullCommand = "$Command; exit `$LASTEXITCODE"
        $proc = Start-Process powershell -ArgumentList "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", $fullCommand -WorkingDirectory $WorkingDirectory -PassThru -NoNewWindow
        
        $taskPid = $proc.Id
        $hasTimedOut = $false

        while (-not $proc.HasExited) {
            Start-Sleep -Seconds 1
            $elapsed = (Get-Date) - $startTime
            if ($elapsed.TotalSeconds -gt $TimeoutSec) {
                $hasTimedOut = $true
                break
            }
        }

        if ($hasTimedOut) {
            Write-Host "[monitor] ERROR: Task '$TaskName' timed out after $TimeoutSec seconds. Terminating process tree..." -ForegroundColor Red
            Stop-ProcessTree -ParentPid $taskPid
            $retryCount++
            continue
        }

        $proc.Refresh()
        $exitCode = $proc.ExitCode
        if ($null -eq $exitCode) {
            $exitCode = 0
        }
        if ($exitCode -ne 0) {
            Write-Host "[monitor] ERROR: Task '$TaskName' failed with exit code $exitCode." -ForegroundColor Red
            $retryCount++
            continue
        }

        Write-Host "[monitor] SUCCESS: Task '$TaskName' completed successfully." -ForegroundColor Green
        $success = $true
    }

    if (-not $success) {
        throw "Task '$TaskName' failed after $($MaxRetries + 1) attempts."
    }
}

function Ensure-Dependencies {
    param([string]$dir, [string]$name)
    if (-not (Test-Path (Join-Path $dir "node_modules"))) {
        Write-Host "[monitor] Installing dependencies for $name..." -ForegroundColor Yellow
        Invoke-MonitoredTask -TaskName "$name npm install" -Command "npm install" -WorkingDirectory $dir -TimeoutSec 300
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$desktop = Join-Path $root "desktop"

Write-Step "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"

try {
    # 0. Ensure node_modules exist
    Ensure-Dependencies -dir $backend -name "backend"
    Ensure-Dependencies -dir $frontend -name "frontend"
    Ensure-Dependencies -dir $desktop -name "desktop"

    # 1. Supabase Check
    if ($SkipSupabaseCheck) {
        Write-Step "Skipping Supabase verification (SkipSupabaseCheck enabled)."
    } elseif (-not $SupabasePassword -and -not $env:SUPABASE_PASS) {
        Write-Step "Skipping Supabase verification (No password provided via parameter or SUPABASE_PASS)."
    } else {
        $pass = if ($SupabasePassword) { $SupabasePassword } else { $env:SUPABASE_PASS }
        $env:SUPABASE_DB_URL = "postgresql://postgres:$pass@db.$ProjectRef.supabase.co:5432/postgres?sslmode=require&uselibpqcompat=true"
        Write-Step "Running backend Supabase verification..."
        Invoke-MonitoredTask -TaskName "Supabase Verification" -Command "npm run verify:supabase" -WorkingDirectory $backend -TimeoutSec 120
    }

    # 2. Backend smoke tests
    Write-Step "Running backend smoke tests..."
    Invoke-MonitoredTask -TaskName "Backend Smoke Tests" -Command "npm run test:smoke -- --runInBand" -WorkingDirectory $backend -TimeoutSec 300

    # 3. Frontend production build
    Write-Step "Running frontend production build..."
    Invoke-MonitoredTask -TaskName "Frontend Build" -Command "npm run build" -WorkingDirectory $frontend -TimeoutSec 600

    # 4. Desktop packaging
    if ($SkipDesktopBuild) {
        Write-Step "Skipping desktop build."
    } else {
        Write-Step "Running desktop Windows packaging..."
        Invoke-MonitoredTask -TaskName "Desktop Build" -Command "npm run dist:all" -WorkingDirectory $desktop -TimeoutSec 1200
    }

    # 5. Hotlinks
    Write-Step "Generating desktop hotlinks..."
    Invoke-MonitoredTask -TaskName "Generate Hotlinks" -Command "npm run create:hotlink" -WorkingDirectory $desktop -TimeoutSec 120

    # 6. Verify Shortcuts
    Write-Step "Verifying Desktop shortcuts..."
    $desktopPath = [Environment]::GetFolderPath('Desktop')
    $shortcuts = Get-ChildItem $desktopPath -Filter "De Vibe OMS*" -ErrorAction SilentlyContinue
    if (-not $shortcuts) {
        throw "No De Vibe OMS shortcuts were found on Desktop ($desktopPath)."
    }

    Write-Step "All launch checks passed."
    Write-Host "GO FOR LAUNCH" -ForegroundColor Green
    Write-Host "Shortcuts found:" -ForegroundColor Green
    $shortcuts | Select-Object Name, FullName, LastWriteTime | Format-Table -AutoSize
}
catch {
    Write-Host "[monitor] FATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
