param(
    [string]$OutputDir = [Environment]::GetFolderPath('Desktop'),
    [string]$WebUrl = 'http://localhost:3000',
    [string]$ApiHealthUrl = 'http://localhost:5000/health'
)

$ErrorActionPreference = 'Stop'

function New-InternetShortcut {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    $content = @(
        '[InternetShortcut]',
        "URL=$Url",
        'IconFile=%SystemRoot%\system32\SHELL32.dll',
        'IconIndex=220'
    )

    Set-Content -Path $Path -Value $content -Encoding ASCII
}

function New-FileShortcut {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Target,
        [string]$Arguments = '',
        [string]$WorkingDirectory = ''
    )

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($Path)
    $shortcut.TargetPath = $Target
    if ($Arguments) { $shortcut.Arguments = $Arguments }
    if ($WorkingDirectory) { $shortcut.WorkingDirectory = $WorkingDirectory }
    $shortcut.Save()
}

if (!(Test-Path -Path $OutputDir)) {
    New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null
}

$webShortcutPath = Join-Path $OutputDir 'De Vibe OMS Web.url'
$healthShortcutPath = Join-Path $OutputDir 'De Vibe OMS API Health.url'

New-InternetShortcut -Path $webShortcutPath -Url $WebUrl
New-InternetShortcut -Path $healthShortcutPath -Url $ApiHealthUrl

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$desktopDir = Join-Path $repoRoot 'desktop'
$distDir = Join-Path $desktopDir 'dist'

$msixShortcutPath = Join-Path $OutputDir 'De Vibe OMS MSIX.lnk'
$msixPattern = Join-Path $distDir 'De-Vibe-OMS-*.msix'
$msixPackage = Get-ChildItem -Path $msixPattern -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($msixPackage) {
    New-FileShortcut -Path $msixShortcutPath -Target $msixPackage.FullName -WorkingDirectory $distDir
    Write-Host "Created MSIX shortcut: $msixShortcutPath"
}
else {
    Write-Host "MSIX package not found yet (expected pattern: $msixPattern)."
}

$installerShortcutPath = Join-Path $OutputDir 'De Vibe OMS Installer Win32.lnk'
$installerPattern = Join-Path $distDir 'De-Vibe-OMS-Setup-*.exe'
$installer = Get-ChildItem -Path $installerPattern -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($installer) {
    New-FileShortcut -Path $installerShortcutPath -Target $installer.FullName -WorkingDirectory $distDir
    Write-Host "Created installer shortcut: $installerShortcutPath"
}
else {
    Write-Host "Installer package not found yet (expected pattern: $installerPattern)."
}

$electronExePath = Join-Path $desktopDir 'dist\win-unpacked\De Vibe OMS.exe'
$desktopShortcutPath = Join-Path $OutputDir 'De Vibe OMS Desktop.lnk'

if (Test-Path $electronExePath) {
    New-FileShortcut -Path $desktopShortcutPath -Target $electronExePath -WorkingDirectory (Split-Path $electronExePath -Parent)
    Write-Host "Created desktop app shortcut: $desktopShortcutPath"
} else {
    $devShortcutPath = Join-Path $OutputDir 'De Vibe OMS Dev Launch.lnk'
    $command = "-NoExit -Command `"Set-Location '$repoRoot'; .\RUN.ps1 both`""
    New-FileShortcut -Path $devShortcutPath -Target 'powershell.exe' -Arguments $command -WorkingDirectory $repoRoot
    Write-Host "Desktop build not found. Created dev launcher shortcut: $devShortcutPath"
}

Write-Host "Created web shortcut: $webShortcutPath"
Write-Host "Created API health shortcut: $healthShortcutPath"
