#Requires -Version 5.1
<#
.SYNOPSIS
  Build a Windows Store MSIX package for Bahamut OMS.
  Uses makeappx.exe / signtool.exe from the electron-builder winCodeSign cache.

.NOTES
  Run from the desktop\ directory:
    powershell -ExecutionPolicy Bypass -File scripts\build-msix.ps1

  For Microsoft Store submission:
    - Replace $PfxPath / $PfxPassword with your Partner Center cert.
    - Update $Publisher to match your Partner Center Publisher identity.
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
$OutputMsix  = Join-Path $DistDir 'Bahamut-OMS-1.0.0.msix'

$PfxPath     = Join-Path $DesktopDir 'bahamut-oms-dev.pfx'
$PfxPassword = 'BahamutOMS2024!'

# ---------------------------------------------------------------------------
# Locate makeappx + signtool from electron-builder winCodeSign cache
# ---------------------------------------------------------------------------
$CacheBase = Join-Path $env:LOCALAPPDATA 'electron-builder\Cache\winCodeSign'
$MakeAppx  = Get-ChildItem $CacheBase -Recurse -Filter 'makeappx.exe' |
              Where-Object { $_.FullName -like '*x64*' } |
              Select-Object -First 1 -ExpandProperty FullName
$SignTool   = Get-ChildItem $CacheBase -Recurse -Filter 'signtool.exe' |
              Where-Object { $_.FullName -like '*x64*' } |
              Select-Object -First 1 -ExpandProperty FullName

if (-not $MakeAppx) { throw 'makeappx.exe not found in electron-builder cache. Run npm run dist:winstore once to populate it.' }
if (-not $SignTool)  { throw 'signtool.exe not found in electron-builder cache.' }

Write-Host "[build-msix] makeappx : $MakeAppx"
Write-Host "[build-msix] signtool : $SignTool"

# ---------------------------------------------------------------------------
# Validate that win-unpacked exists
# ---------------------------------------------------------------------------
if (-not (Test-Path $Unpacked)) {
  throw "dist\win-unpacked not found. Run 'npm run dist:win' first to produce the unpacked app."
}

# ---------------------------------------------------------------------------
# Create staging directory
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Setting up staging directory…'
if (Test-Path $StagingDir) { Remove-Item $StagingDir -Recurse -Force }
New-Item $StagingDir -ItemType Directory | Out-Null

# Copy app files
Copy-Item -Path "$Unpacked\*" -Destination $StagingDir -Recurse -Force

# ---------------------------------------------------------------------------
# Create Assets (placeholder logo images using .NET System.Drawing)
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Generating logo assets…'
$AssetsDir = Join-Path $StagingDir 'Assets'
New-Item $AssetsDir -ItemType Directory -Force | Out-Null

Add-Type -AssemblyName System.Drawing

function New-PlaceholderPng {
  param([string]$Path, [int]$Width, [int]$Height)
  $bmp = [System.Drawing.Bitmap]::new($Width, $Height)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(30, 41, 59))   # #1e293b (dark blue)
  $font  = [System.Drawing.Font]::new('Segoe UI', [Math]::Max(8, $Height * 0.4), [System.Drawing.FontStyle]::Bold)
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $sf    = [System.Drawing.StringFormat]::new()
  $sf.Alignment     = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect  = [System.Drawing.RectangleF]::new(0, 0, $Width, $Height)
  $g.DrawString('B', $font, $brush, $rect, $sf)
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-PlaceholderPng (Join-Path $AssetsDir 'Square44x44Logo.png')    44  44
New-PlaceholderPng (Join-Path $AssetsDir 'Square150x150Logo.png') 150 150
New-PlaceholderPng (Join-Path $AssetsDir 'Wide310x150Logo.png')   310 150
New-PlaceholderPng (Join-Path $AssetsDir 'StoreLogo.png')          50  50
New-PlaceholderPng (Join-Path $AssetsDir 'SplashScreen.png')      620 300

# ---------------------------------------------------------------------------
# Write AppxManifest.xml
# ---------------------------------------------------------------------------
Write-Host '[build-msix] Writing AppxManifest.xml…'
$AppExe    = 'Bahamut OMS.exe'
$Publisher = 'CN=BahamutOMS'     # must match PFX subject for sideload; Partner Center sets this for Store

$Manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">

  <Identity
    Name="BahamutOMS.OMS"
    Publisher="$Publisher"
    Version="1.0.0.0"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>Bahamut OMS</DisplayName>
    <PublisherDisplayName>Bahamut OMS</PublisherDisplayName>
    <Description>Bahamut Order Management System</Description>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>

  <Resources>
    <Resource Language="en-us" />
  </Resources>

  <Applications>
    <Application Id="BahamutOMS" Executable="$AppExe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="Bahamut OMS"
        Description="Bahamut Order Management System"
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
Write-Host '[build-msix] Running makeappx pack…'
if (Test-Path $OutputMsix) { Remove-Item $OutputMsix -Force }

& $MakeAppx pack /d $StagingDir /p $OutputMsix /o
if ($LASTEXITCODE -ne 0) { throw "makeappx failed with exit code $LASTEXITCODE" }

# ---------------------------------------------------------------------------
# Sign with signtool + PFX (best effort for local/dev)
# ---------------------------------------------------------------------------
$Signed = $false
Write-Host '[build-msix] Signing MSIX (best effort)…'
& $SignTool sign /fd SHA256 /a /f $PfxPath /p $PfxPassword $OutputMsix
if ($LASTEXITCODE -eq 0) {
  $Signed = $true
} else {
  Write-Warning 'SignTool failed in this environment. Keeping unsigned MSIX for Store upload workflow.'
  Write-Warning 'Microsoft Partner Center will sign the package during Store submission.'
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
$SizeMB = [Math]::Round((Get-Item $OutputMsix).Length / 1MB, 1)
Write-Host ''
Write-Host "[build-msix] SUCCESS -- $OutputMsix ($SizeMB MB)"
if ($Signed) {
  Write-Host '[build-msix] Package is signed.'
} else {
  Write-Host '[build-msix] Package is unsigned (expected in some local environments).'
}
Write-Host ''
Write-Host 'To sideload on this machine:'
Write-Host "  Add-AppxPackage -Path '$OutputMsix'"
Write-Host '  (First trust the dev cert: Import-Certificate -FilePath bahamut-oms-dev.pfx -CertStoreLocation Cert:\LocalMachine\TrustedPeople)'
Write-Host ''
Write-Host 'For Microsoft Store submission, replace the PFX with your Partner Center certificate.'
