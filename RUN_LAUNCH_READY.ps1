param(
    [string]$ProjectRef = "dfztgprnryutbtqnnjqz",
    [switch]$SkipDesktopBuild,
    [switch]$SkipSupabaseCheck
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "[launch-ready] $msg" -ForegroundColor Cyan
}

function Assert-Success($code, $message) {
    if ($code -ne 0) {
        throw $message
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$desktop = Join-Path $root "desktop"

Write-Step "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"

$bstr = [IntPtr]::Zero

try {
    if ($SkipSupabaseCheck) {
        Write-Step "Skipping Supabase verification (SkipSupabaseCheck enabled)."
    }
    else {
        Write-Step "Collecting Supabase Postgres password (secure prompt)..."
        $securePass = Read-Host "Supabase Postgres password (for user postgres)" -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
        $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        $env:SUPABASE_DB_URL = "postgresql://postgres:$password@db.$ProjectRef.supabase.co:5432/postgres?sslmode=require&uselibpqcompat=true"

        Write-Step "Running backend Supabase verification marker insert..."
        Set-Location $backend
        npm run verify:supabase
        Assert-Success $LASTEXITCODE "Supabase verification failed. Check password/DB access."
    }

    Write-Step "Running backend smoke tests..."
    Set-Location $backend
    npm run test:smoke -- --runInBand
    Assert-Success $LASTEXITCODE "Backend smoke tests failed."

    Write-Step "Running frontend production build..."
    Set-Location $frontend
    npm run build
    Assert-Success $LASTEXITCODE "Frontend build failed."

    if (-not $SkipDesktopBuild) {
        Write-Step "Running desktop Windows packaging..."
        Set-Location $desktop
        npm run dist:win
        Assert-Success $LASTEXITCODE "Desktop packaging failed."
    }

    Write-Step "Generating desktop hotlinks..."
    Set-Location $desktop
    npm run create:hotlink
    Assert-Success $LASTEXITCODE "Hotlink generation failed."

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
finally {
    if ($bstr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}
