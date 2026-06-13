# Generates placeholder desktop icons on Windows without Python.
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path (Join-Path $PSScriptRoot '..') 'assets'
$msixDir = Join-Path $assetsDir 'msix'
New-Item -ItemType Directory -Force -Path $assetsDir, $msixDir | Out-Null

function New-BrandBitmap([int]$size) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle 0, 0, $size, $size),
        [System.Drawing.Color]::FromArgb(15, 23, 42),
        [System.Drawing.Color]::FromArgb(30, 41, 59),
        90
    )
    $graphics.FillRectangle($brush, 0, 0, $size, $size)

    $shieldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
    $shieldPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(71, 85, 105)), 1
    $cx = $size / 2
    $cy = $size / 2
    $s = $size
    $shield = @(
        [System.Drawing.PointF]::new($cx, $cy - $s * 0.42),
        [System.Drawing.PointF]::new($cx + $s * 0.34, $cy - $s * 0.20),
        [System.Drawing.PointF]::new($cx + $s * 0.34, $cy + $s * 0.05),
        [System.Drawing.PointF]::new($cx, $cy + $s * 0.42),
        [System.Drawing.PointF]::new($cx - $s * 0.34, $cy + $s * 0.05),
        [System.Drawing.PointF]::new($cx - $s * 0.34, $cy - $s * 0.20)
    )
    $graphics.FillPolygon($shieldBrush, $shield)
    $graphics.DrawPolygon($shieldPen, $shield)

    $flameBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(239, 68, 68))
    $flame = @(
        [System.Drawing.PointF]::new($cx + $s * 0.10, $cy - $s * 0.28),
        [System.Drawing.PointF]::new($cx - $s * 0.06, $cy - $s * 0.18),
        [System.Drawing.PointF]::new($cx + $s * 0.05, $cy - $s * 0.18),
        [System.Drawing.PointF]::new($cx - $s * 0.12, $cy + $s * 0.02),
        [System.Drawing.PointF]::new($cx, $cy + $s * 0.20),
        [System.Drawing.PointF]::new($cx + $s * 0.02, $cy + $s * 0.04),
        [System.Drawing.PointF]::new($cx + $s * 0.16, $cy + $s * 0.12),
        [System.Drawing.PointF]::new($cx + $s * 0.09, $cy - $s * 0.02),
        [System.Drawing.PointF]::new($cx + $s * 0.18, $cy - $s * 0.18)
    )
    $graphics.FillPolygon($flameBrush, $flame)

    $graphics.Dispose()
    return $bitmap
}

function Save-PngBitmap([System.Drawing.Bitmap]$bitmap, [string]$path) {
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  $path"
}

$sizes = @(16, 32, 48, 64, 128, 256)
$bitmaps = @{}
foreach ($size in $sizes) {
    $bitmaps[$size] = New-BrandBitmap $size
    Save-PngBitmap $bitmaps[$size] (Join-Path $assetsDir "icon-$size.png")
}

Save-PngBitmap $bitmaps[256] (Join-Path $assetsDir 'icon.png')

$iconStream = New-Object System.IO.MemoryStream
$bitmaps[256].Save($iconStream, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBytes = $iconStream.ToArray()
$iconStream.Dispose()

$icoPath = Join-Path $assetsDir 'icon.ico'
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]1)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([int32]$iconBytes.Length)
$bw.Write([int32]22)
$bw.Write($iconBytes)
$bw.Close()
$fs.Close()
Write-Host "  $icoPath"

function Save-MsixAsset([string]$name, [int]$width, [int]$height) {
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle 0, 0, $width, $height),
        [System.Drawing.Color]::FromArgb(15, 23, 42),
        [System.Drawing.Color]::FromArgb(30, 41, 59),
        90
    )
    $graphics.FillRectangle($brush, 0, 0, $width, $height)
    $side = [Math]::Min($width, $height)
    $logo = $bitmaps[[int]($sizes | Where-Object { $_ -ge $side } | Select-Object -First 1)]
    if (-not $logo) { $logo = $bitmaps[256] }
  $resized = New-Object System.Drawing.Bitmap $logo, $side, $side
    $graphics.DrawImage($resized, [int](($width - $side) / 2), [int](($height - $side) / 2), $side, $side)
    $path = Join-Path $msixDir $name
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  $path"
    $graphics.Dispose()
}

Save-MsixAsset 'Square44x44Logo.png' 44 44
Save-MsixAsset 'Square150x150Logo.png' 150 150
Save-MsixAsset 'Wide310x150Logo.png' 310 150
Save-MsixAsset 'StoreLogo.png' 50 50
Save-MsixAsset 'SplashScreen.png' 620 300

foreach ($bitmap in $bitmaps.Values) {
    $bitmap.Dispose()
}

Write-Host "Done. Icons written to $assetsDir"
