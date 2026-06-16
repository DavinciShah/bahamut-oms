#Requires -Version 5.1
<#
.SYNOPSIS
  Build a Windows Store MSIX package for De Vibe OMS.
  Uses makeappx.exe / signtool.exe from the electron-builder winCodeSign cache.

.NOTES
  Run from the desktop\ directory:
    powershell -ExecutionPolicy Bypass -File scripts\build-msix.ps1

  Publisher must match Partner Center Publisher identity exactly.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
$DesktopDir  = Split-Path $PSScriptRoot -Parent
$DistDir     = Join-Path $DesktopDir 'dist'
$Unpacked    = Join-Path $DistDir 'win-unpacked'
$StagingDir  = Join-Path $DistDir 'msix-staging'

$PackageJsonPath = Join-Path $DesktopDir 'package.json'
$PackageJson     = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
$AppVersion      = "$($PackageJson.version).0"
$OutputMsix      = Join-Path $DistDir "De-Vibe-OMS-$($PackageJson.version).msix"

$PfxPath     = if ($env:PFX_PATH)     { $env:PFX_PATH }     else { Join-Path $DesktopDir 'devibe-oms-dev.pfx' }
$PfxPassword = if ($env:PFX_PASSWORD) { $env:PFX_PASSWORD } else { 'DeVibeOMS2024!' }

# ---------------------------------------------------------------------------
# Locate makeappx + signtool from electron-builder winCodeSign cache
# ---------------------------------------------------------------------------
$CacheBase = Join-Path $env:LOCALAPPDATA 'electron-builder\Cache\winCodeSign'
$MakeAppx  = Get-ChildItem $CacheBase -Recurse -Filter 'makeappx.exe' -ErrorAction SilentlyContinue |
              Where-Object { $_.FullName -like '*x64*' } |
              Select-Object -First 1 -ExpandProperty FullName
$SignTool   = Get-ChildItem $CacheBase -Recurse -Filter 'signtool.exe' -ErrorAction SilentlyContinue |
              Where-Object { $_.FullName -like '*x64*' } |
              Select-Object -First 1 -ExpandProperty FullName

if (-not $MakeAppx) {
    Write-Warning 'makeappx.exe not found in electron-builder cache. Trying Windows SDK...'
    $MakeAppx = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter 'makeappx.exe' -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName -like '*x64*' } |
                Select-Object -First 1 -ExpandProperty FullName
}
if (-not $SignTool) {
    $SignTool = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter 'signtool.exe' -ErrorAction SilentlyContinue |
               Where-Object { $_.FullName -like '*x64*' } |
               Select-Object -First 1 -ExpandProperty FullName
}

if (-not $MakeAppx) { throw 'makeappx.exe not found. Run npm run dist:win once to populate the electron-builder cache, or install Windows SDK.' }

Write-Host "[build-msix] makeappx : $MakeAppx"
if ($SignTool) { Write-Host "[build-msix] signtool : $SignTool" }

# ---------------------------------------------------------------------------
# Validate that win-unpacked exists
# ---------------------------------------------------------------------------
if (-not (Test-Path $Unpacked)) {
    throw "dist\win-unpacked not found. Run 'npm run dist:win' first."
}

# ---------------------------------------------------------------------------
# Create staging directory
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Setting up staging directory...'
if (Test-Path $StagingDir) { Remove-Item $StagingDir -Recurse -Force }
New-Item $StagingDir -ItemType Directory | Out-Null

Copy-Item -Path "$Unpacked\*" -Destination $StagingDir -Recurse -Force

# ---------------------------------------------------------------------------
# Copy MSIX store assets
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Copying branded MSIX assets...'
$AssetsDir    = Join-Path $StagingDir 'Assets'
$SourceAssets = Join-Path $DesktopDir 'assets\msix'
New-Item $AssetsDir -ItemType Directory -Force | Out-Null

if (Test-Path $SourceAssets) {
    Copy-Item -Path "$SourceAssets\*" -Destination $AssetsDir -Recurse -Force
    Write-Host "[build-msix] Assets copied from $SourceAssets"
} else {
    Write-Warning "assets\msix not found - generating placeholder logos."
    Add-Type -AssemblyName System.Drawing

    function New-PlaceholderPng {
        param([string]$Path, [int]$Width, [int]$Height)
        $bmp = [System.Drawing.Bitmap]::new($Width, $Height)
        $g   = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::FromArgb(30, 41, 59))
        $font  = [System.Drawing.Font]::new('Segoe UI', [Math]::Max(8, $Height * 0.4), [System.Drawing.FontStyle]::Bold)
        $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
        $sf    = [System.Drawing.StringFormat]::new()
        $sf.Alignment     = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect  = [System.Drawing.RectangleF]::new(0, 0, $Width, $Height)
        $g.DrawString('D', $font, $brush, $rect, $sf)
        $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose(); $bmp.Dispose()
    }

    New-PlaceholderPng (Join-Path $AssetsDir 'Square44x44Logo.png')    44  44
    New-PlaceholderPng (Join-Path $AssetsDir 'Square150x150Logo.png') 150 150
    New-PlaceholderPng (Join-Path $AssetsDir 'Wide310x150Logo.png')   310 150
    New-PlaceholderPng (Join-Path $AssetsDir 'StoreLogo.png')          50  50
    New-PlaceholderPng (Join-Path $AssetsDir 'SplashScreen.png')      620 300
}

# ---------------------------------------------------------------------------
# Write AppxManifest.xml
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Writing AppxManifest.xml...'
$AppExe    = 'De Vibe OMS.exe'
$Publisher = if ($env:MSIX_PUBLISHER) { $env:MSIX_PUBLISHER } else { 'CN=020DEFAD-B148-45DF-98CA-18B2743203E6' }
$PublisherDisplayName = if ($PackageJson.build.appx.publisherDisplayName) { $PackageJson.build.appx.publisherDisplayName } else { 'De Vibe' }

$Manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">

  <Identity
    Name="DeVibeOMS.OMS"
    Publisher="$Publisher"
    Version="$AppVersion"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>De Vibe OMS</DisplayName>
    <PublisherDisplayName>$PublisherDisplayName</PublisherDisplayName>
    <Description>De Vibe Order Management System</Description>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>

  <Resources>
    <Resource Language="en-us" />
  </Resources>

  <Applications>
    <Application Id="DeVibeOMS" Executable="$AppExe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="De Vibe OMS"
        Description="De Vibe Order Management System"
        BackgroundColor="#1e293b"
        Square150x150Logo="Assets\Square150x150Logo.png"
        Square44x44Logo="Assets\Square44x44Logo.png">
        <uap:SplashScreen Image="Assets\SplashScreen.png" />
      </uap:VisualElements>
    </Application>
  </Applications>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>

</Package>
"@

$Manifest | Set-Content (Join-Path $StagingDir 'AppxManifest.xml') -Encoding UTF8

# ---------------------------------------------------------------------------
# Package with makeappx
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Running makeappx pack...'
if (Test-Path $OutputMsix) { Remove-Item $OutputMsix -Force }

& $MakeAppx pack /d $StagingDir /p $OutputMsix /o
if ($LASTEXITCODE -ne 0) { throw "makeappx failed with exit code $LASTEXITCODE" }

# ---------------------------------------------------------------------------
# Sign with signtool (best effort - Store will re-sign anyway)
# ---------------------------------------------------------------------------
$Signed = $false
if ($SignTool -and (Test-Path $PfxPath)) {
    Write-Host '[build-msix] Signing MSIX...'
    & $SignTool sign /fd SHA256 /a /f $PfxPath /p $PfxPassword $OutputMsix
    if ($LASTEXITCODE -eq 0) { $Signed = $true }
    else { Write-Warning 'SignTool failed. Keeping unsigned MSIX for Store upload (Store will sign it).' }
} else {
    Write-Host '[build-msix] No local PFX found - MSIX will be unsigned (Microsoft Store signs it during submission).'
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
$SizeMB = [Math]::Round((Get-Item $OutputMsix).Length / 1MB, 1)
Write-Host ''
Write-Host "[build-msix] SUCCESS: $OutputMsix ($SizeMB MB)"
if ($Signed) {
    Write-Host '[build-msix] Package is signed.'
} else {
    Write-Host '[build-msix] Package is unsigned - upload to Partner Center and Microsoft will sign it.'
}
Write-Host ''
Write-Host "Upload this file to Partner Center -> Packages:"
Write-Host "  $OutputMsix"
