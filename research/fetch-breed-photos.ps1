# Fetch Polish Lowland Sheepdog (PON) photos from Wikimedia Commons.
# Downloads only files whose license permits reuse, and records the exact
# attribution string each file legally requires.
#
# Run:  powershell -ExecutionPolicy Bypass -File research\fetch-breed-photos.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

$root    = Split-Path -Parent $PSScriptRoot
$outDir  = Join-Path $root 'assets\breed-photos'
$api     = 'https://commons.wikimedia.org/w/api.php'
$ua      = @{ 'User-Agent' = 'PON-breed-research/1.0 (https://commons.wikimedia.org/; breed reference image collection)' }

# Wikimedia returns 429 if hit too fast. Be a polite client.
$requestDelayMs = 1500
$maxRetries     = 5

function Invoke-Polite {
    param([scriptblock]$Action)

    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            return & $Action
        }
        catch {
            $isRateLimit = $_.Exception.Message -match '429|Too many requests'
            if (-not $isRateLimit -or $attempt -eq $maxRetries) { throw }
            $backoff = [Math]::Pow(2, $attempt) * 2
            Write-Host "    rate limited, waiting $backoff s (attempt $attempt/$maxRetries)"
            Start-Sleep -Seconds $backoff
        }
    }
}

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# Licenses we are willing to ship. Anything else gets reported, not downloaded.
$allowedLicense = @(
    'cc0', 'cc-by-1.0', 'cc-by-2.0', 'cc-by-2.5', 'cc-by-3.0', 'cc-by-4.0',
    'cc-by-sa-1.0', 'cc-by-sa-2.0', 'cc-by-sa-2.5', 'cc-by-sa-3.0', 'cc-by-sa-4.0',
    'pd', 'public domain'
)

function Get-CategoryFiles {
    param([string]$Category, [int]$Depth = 1)

    $enc  = [uri]::EscapeDataString($Category)
    $url  = "$api`?action=query&list=categorymembers&cmtitle=$enc&cmlimit=500&format=json"
    $resp = Invoke-Polite { Invoke-RestMethod $url -Headers $ua -TimeoutSec 30 }

    $files = @()
    foreach ($m in $resp.query.categorymembers) {
        if ($m.title -like 'File:*') {
            $files += $m.title
        }
        elseif ($m.title -like 'Category:*' -and $Depth -gt 0) {
            $files += Get-CategoryFiles -Category $m.title -Depth ($Depth - 1)
        }
    }
    return $files
}

function Get-ImageMeta {
    param([string[]]$Titles)

    $results = @()
    for ($i = 0; $i -lt $Titles.Count; $i += 20) {
        $batch = $Titles[$i..([Math]::Min($i + 19, $Titles.Count - 1))]
        $enc   = [uri]::EscapeDataString(($batch -join '|'))
        $url   = "$api`?action=query&titles=$enc&prop=imageinfo" +
                 "&iiprop=url|size|mime|extmetadata&format=json"
        $resp  = Invoke-Polite { Invoke-RestMethod $url -Headers $ua -TimeoutSec 60 }
        Start-Sleep -Milliseconds $requestDelayMs

        foreach ($p in $resp.query.pages.PSObject.Properties) {
            $page = $p.Value
            $ii   = $page.imageinfo
            if (-not $ii) { continue }
            $info = $ii[0]
            $em   = $info.extmetadata

            $results += [pscustomobject]@{
                Title       = $page.title
                Url         = $info.url
                DescPage    = $info.descriptionurl
                Width       = $info.width
                Height      = $info.height
                Mime        = $info.mime
                License     = if ($em.LicenseShortName) { $em.LicenseShortName.value } else { '' }
                LicenseCode = if ($em.License)          { $em.License.value }          else { '' }
                LicenseUrl  = if ($em.LicenseUrl)       { $em.LicenseUrl.value }       else { '' }
                Artist      = if ($em.Artist)           { $em.Artist.value }           else { '' }
                Credit      = if ($em.Credit)           { $em.Credit.value }           else { '' }
                Restrictions= if ($em.Restrictions)     { $em.Restrictions.value }     else { '' }
            }
        }
    }
    return $results
}

function Remove-Html {
    param([string]$Text)
    if (-not $Text) { return '' }
    $t = $Text -replace '<[^>]+>', ' '
    $t = $t -replace '&amp;', '&' -replace '&quot;', '"' -replace '&#39;', "'" -replace '&nbsp;', ' '
    return ($t -replace '\s+', ' ').Trim()
}

Write-Host 'Collecting file list from Wikimedia Commons...'
$titles = @()
$titles += Get-CategoryFiles -Category 'Category:Polski Owczarek Nizinny' -Depth 2
$titles  = $titles | Sort-Object -Unique
Write-Host "  found $($titles.Count) files"

Write-Host 'Fetching license metadata...'
$meta = Get-ImageMeta -Titles $titles

$kept    = @()
$skipped = @()

foreach ($m in $meta) {
    $code = ($m.LicenseCode + ' ' + $m.License).ToLower()
    $ok   = $false
    foreach ($lic in $allowedLicense) {
        if ($code -like "*$lic*") { $ok = $true; break }
    }

    if (-not $ok) {
        $skipped += $m
        continue
    }

    $safeName = ($m.Title -replace '^File:', '') -replace '[^\w\.\-]', '_'
    $dest     = Join-Path $outDir $safeName

    if (-not (Test-Path -LiteralPath $dest)) {
        Write-Host "  downloading $safeName"
        $url = $m.Url
        Invoke-Polite { Invoke-WebRequest -Uri $url -Headers $ua -OutFile $dest -TimeoutSec 120 }
        Start-Sleep -Milliseconds $requestDelayMs
    }

    $kept += [pscustomobject]@{
        File        = $safeName
        Title       = $m.Title
        Dimensions  = "$($m.Width)x$($m.Height)"
        License     = $m.License
        LicenseUrl  = $m.LicenseUrl
        Author      = Remove-Html $m.Artist
        Credit      = Remove-Html $m.Credit
        Source      = $m.DescPage
        Restrictions= Remove-Html $m.Restrictions
    }
}

# ---- write attribution file -------------------------------------------------

$lines = @()
$lines += '# Breed photo credits'
$lines += ''
$lines += 'Every image in `assets/breed-photos/` is listed here with the license it'
$lines += 'ships under and the attribution that license requires. If an image is used'
$lines += 'on a public page, the Author and License below must be visible on that page'
$lines += 'or in a credits page linked from it.'
$lines += ''
$lines += 'Generated by `research/fetch-breed-photos.ps1` on ' + (Get-Date -Format 'yyyy-MM-dd') + '.'
$lines += ''
$lines += "Downloaded: $($kept.Count)  |  Skipped for license: $($skipped.Count)"
$lines += ''

foreach ($k in $kept) {
    $lines += "## $($k.File)"
    $lines += ''
    $lines += "- Dimensions: $($k.Dimensions)"
    $lines += "- License: $($k.License)"
    if ($k.LicenseUrl)   { $lines += "- License URL: $($k.LicenseUrl)" }
    $lines += "- Author: $(if ($k.Author) { $k.Author } else { 'UNKNOWN - do not publish until resolved' })"
    if ($k.Credit)       { $lines += "- Credit: $($k.Credit)" }
    if ($k.Restrictions) { $lines += "- Restrictions: $($k.Restrictions)" }
    $lines += "- Source: $($k.Source)"
    $lines += ''
}

if ($skipped.Count -gt 0) {
    $lines += '## Skipped (license not cleared for reuse)'
    $lines += ''
    foreach ($s in $skipped) {
        $lines += "- $($s.Title) - license: '$($s.License)' - $($s.DescPage)"
    }
    $lines += ''
}

$creditsPath = Join-Path $outDir 'CREDITS.md'
Set-Content -LiteralPath $creditsPath -Value ($lines -join "`r`n") -Encoding UTF8

Write-Host ''
Write-Host "Downloaded $($kept.Count) images to $outDir"
Write-Host "Skipped $($skipped.Count) for license reasons"
Write-Host "Attribution written to $creditsPath"

