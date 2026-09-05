# Build a single contact sheet from the downloaded breed photos so they can be
# reviewed at a glance without opening 20 files.
#
# Run:  powershell -ExecutionPolicy Bypass -File research\make-contact-sheet.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root    = Split-Path -Parent $PSScriptRoot
$srcDir  = Join-Path $root 'assets\breed-photos'
$outFile = Join-Path $root 'research\contact-sheet.jpg'

$cellW    = 420
$cellH    = 320
$labelH   = 34
$cols     = 4
$pad      = 10
$bg       = [System.Drawing.Color]::FromArgb(12, 12, 12)
$fg       = [System.Drawing.Color]::FromArgb(235, 235, 235)

$files = Get-ChildItem -LiteralPath $srcDir -File |
         Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } |
         Sort-Object Name

if ($files.Count -eq 0) { throw "No images found in $srcDir" }

$rows    = [Math]::Ceiling($files.Count / $cols)
$sheetW  = $cols * ($cellW + $pad) + $pad
$sheetH  = $rows * ($cellH + $labelH + $pad) + $pad

$sheet   = New-Object System.Drawing.Bitmap($sheetW, $sheetH)
$g       = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear($bg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$font    = New-Object System.Drawing.Font('Segoe UI', 9)
$brush   = New-Object System.Drawing.SolidBrush($fg)
$idxFont = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)

$i = 0
foreach ($f in $files) {
    $col = $i % $cols
    $row = [Math]::Floor($i / $cols)
    $x   = $pad + $col * ($cellW + $pad)
    $y   = $pad + $row * ($cellH + $labelH + $pad)

    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)

        # fit inside the cell, preserving aspect ratio
        $scale = [Math]::Min($cellW / $img.Width, $cellH / $img.Height)
        $w     = [int]($img.Width  * $scale)
        $h     = [int]($img.Height * $scale)
        $ox    = $x + [int](($cellW - $w) / 2)
        $oy    = $y + [int](($cellH - $h) / 2)

        $g.DrawImage($img, $ox, $oy, $w, $h)
        $img.Dispose()
    }
    catch {
        $g.DrawString("failed: $($f.Name)", $font, $brush, $x, $y)
    }

    $g.DrawString("$($i + 1)", $idxFont, $brush, $x + 4, $y + 4)

    $label = $f.Name
    if ($label.Length -gt 52) { $label = $label.Substring(0, 49) + '...' }
    $g.DrawString($label, $font, $brush, $x, $y + $cellH + 4)

    $i++
}

$g.Dispose()
$sheet.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$sheet.Dispose()

Write-Host "Contact sheet written to $outFile ($($files.Count) images, ${sheetW}x${sheetH})"
