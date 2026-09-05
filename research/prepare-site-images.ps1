# Resize the shortlisted breed photos into web-sized copies for the site.
# Originals stay untouched in assets/breed-photos/.
#
# Run:  powershell -ExecutionPolicy Bypass -File research\prepare-site-images.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root   = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'assets\breed-photos'
$outDir = Join-Path $root 'site\img'

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# Only the four the site actually uses. Keep this list in sync with
# site/data.js -> PHOTOS.
$wanted = @(
    'Argo-Jack_von_Nora_s_Nizina.JPG',
    'Polish_Lowland_Sheepdog_puppy_Bruno_by_Vetulani.JPG',
    'Polski_owczarek_nizinny_rybnik-kamien_pl.jpg',
    'Storalvare.JPG',
    'PolishLowland1.jpg',
    'Polski_Owczarek_Nizinny_Leni.jpg',
    'Storalvens_Dione.JPG',
    'Oowczarek_polski_nizinny_pl.jpg',
    'PON_BrunobyVetulani.jpg'
)

$maxWidth = 1400
$quality  = 82

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

foreach ($name in $wanted) {
    $src = Join-Path $srcDir $name
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "missing: $name"
        continue
    }

    $img = [System.Drawing.Image]::FromFile($src)

    $scale = [Math]::Min(1.0, $maxWidth / $img.Width)
    $w = [int]($img.Width * $scale)
    $h = [int]($img.Height * $scale)

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()

    # normalise the extension so the site never has a .JPG/.jpg mismatch
    $outName = [System.IO.Path]::GetFileNameWithoutExtension($name) + '.jpg'
    $dest    = Join-Path $outDir $outName

    $bmp.Save($dest, $codec, $params)
    $bmp.Dispose()
    $img.Dispose()

    $kb = [math]::Round((Get-Item -LiteralPath $dest).Length / 1KB)
    Write-Host ("  {0}  ->  {1}x{2}  {3} KB" -f $outName, $w, $h, $kb)
}

Write-Host ''
Write-Host "Web images written to $outDir"
