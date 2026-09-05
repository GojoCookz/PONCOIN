# Source lookalike-breed photos from Wikimedia Commons for the "Spot the PON"
# game. Same license discipline as the breed photos: free licences only, and
# every file's required attribution is recorded.
#
# Downloads to research/game-candidates/<breed>/ for manual curation. The
# curated set is then moved into site/img/game/ by prepare-game-images.ps1.
#
# Run:  powershell -ExecutionPolicy Bypass -File research\fetch-game-photos.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

$root   = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'research\game-candidates'
$api    = 'https://commons.wikimedia.org/w/api.php'
$ua     = @{ 'User-Agent' = 'PON-game/1.0 (https://commons.wikimedia.org/; breed lookalike sourcing)' }

$requestDelayMs = 1400
$maxRetries     = 5
$perBreed       = 16

# Categories chosen because each is a shaggy herding breed that can plausibly
# be confused with a PON. Difficulty is how close the confusion actually is.
$BREEDS = @(
    @{ key = 'pon';       cat = 'Category:Polski Owczarek Nizinny'; label = 'Polish Lowland Sheepdog' },
    @{ key = 'oes';       cat = 'Category:Old English Sheepdog';    label = 'Old English Sheepdog' },
    @{ key = 'briard';    cat = 'Category:Briard';                  label = 'Briard' },
    @{ key = 'bergamasco'; cat = 'Category:Bergamasco Shepherd';    label = 'Bergamasco Shepherd' },
    @{ key = 'schapendoes'; cat = 'Category:Schapendoes';           label = 'Schapendoes' },
    @{ key = 'beardie';   cat = 'Category:Bearded Collie';          label = 'Bearded Collie' },
    @{ key = 'mixed';     cat = 'Category:Mixed-breed dogs';        label = 'Mixed-breed dog' }
)

$allowedLicense = @(
    'cc0', 'cc-by-1.0', 'cc-by-2.0', 'cc-by-2.5', 'cc-by-3.0', 'cc-by-4.0',
    'cc-by-sa-1.0', 'cc-by-sa-2.0', 'cc-by-sa-2.5', 'cc-by-sa-3.0', 'cc-by-sa-4.0',
    'pd', 'public domain'
)

function Invoke-Polite {
    param([scriptblock]$Action)
    for ($i = 1; $i -le $maxRetries; $i++) {
        try { return & $Action }
        catch {
            if ($_.Exception.Message -notmatch '429|Too many requests' -or $i -eq $maxRetries) { throw }
            $wait = [Math]::Pow(2, $i) * 2
            Write-Host "    rate limited, waiting $wait s"
            Start-Sleep -Seconds $wait
        }
    }
}

function Remove-Html {
    param([string]$Text)
    if (-not $Text) { return '' }
    $t = $Text -replace '<[^>]+>', ' '
    $t = $t -replace '&amp;', '&' -replace '&quot;', '"' -replace '&#39;', "'" -replace '&nbsp;', ' '
    return ($t -replace '\s+', ' ').Trim()
}

New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$manifest = @()

foreach ($b in $BREEDS) {
    Write-Host "`n=== $($b.label) ==="
    $breedDir = Join-Path $outDir $b.key
    New-Item -ItemType Directory -Path $breedDir -Force | Out-Null

    $enc = [uri]::EscapeDataString($b.cat)
    $list = Invoke-Polite {
        Invoke-RestMethod "$api`?action=query&list=categorymembers&cmtitle=$enc&cmtype=file&cmlimit=200&format=json" -Headers $ua -TimeoutSec 30
    }
    Start-Sleep -Milliseconds $requestDelayMs

    $titles = @($list.query.categorymembers | ForEach-Object { $_.title })
    if ($titles.Count -eq 0) { Write-Warning "no files in $($b.cat)"; continue }

    $taken = 0
    for ($i = 0; $i -lt $titles.Count -and $taken -lt $perBreed; $i += 20) {
        $batch = $titles[$i..([Math]::Min($i + 19, $titles.Count - 1))]
        $tEnc  = [uri]::EscapeDataString(($batch -join '|'))
        $resp  = Invoke-Polite {
            Invoke-RestMethod "$api`?action=query&titles=$tEnc&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json" -Headers $ua -TimeoutSec 60
        }
        Start-Sleep -Milliseconds $requestDelayMs

        foreach ($p in $resp.query.pages.PSObject.Properties) {
            if ($taken -ge $perBreed) { break }
            $page = $p.Value
            if (-not $page.imageinfo) { continue }
            $info = $page.imageinfo[0]
            $em   = $info.extmetadata

            # portrait-ish or landscape is fine, but skip tiny and skip panoramas
            if ($info.width -lt 700 -or $info.height -lt 500) { continue }
            if (($info.width / [double]$info.height) -gt 2.2) { continue }

            $lic  = ''
            if ($em.License) { $lic = $em.License.value }
            $licName = ''
            if ($em.LicenseShortName) { $licName = $em.LicenseShortName.value }
            $code = ($lic + ' ' + $licName).ToLower()

            $ok = $false
            foreach ($l in $allowedLicense) { if ($code -like "*$l*") { $ok = $true; break } }
            if (-not $ok) { continue }

            $author = Remove-Html $(if ($em.Artist) { $em.Artist.value } else { '' })
            if (-not $author) { continue }   # cannot attribute -> cannot ship

            $safe = ($page.title -replace '^File:', '') -replace '[^\w\.\-]', '_'
            $dest = Join-Path $breedDir $safe
            if (-not (Test-Path -LiteralPath $dest)) {
                $url = $info.url
                Write-Host "  + $safe"
                Invoke-Polite { Invoke-WebRequest -Uri $url -Headers $ua -OutFile $dest -TimeoutSec 120 }
                Start-Sleep -Milliseconds $requestDelayMs
            }

            $manifest += [pscustomobject]@{
                Breed      = $b.key
                BreedLabel = $b.label
                File       = $safe
                Author     = $author
                License    = $licName
                LicenseUrl = $(if ($em.LicenseUrl) { $em.LicenseUrl.value } else { '' })
                Source     = $info.descriptionurl
                Width      = $info.width
                Height     = $info.height
            }
            $taken++
        }
    }
    Write-Host "  kept $taken"
}

$manifest | ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $outDir 'manifest.json') -Encoding UTF8

Write-Host "`nCandidates in $outDir"
Write-Host "Manifest: $($manifest.Count) images across $($BREEDS.Count) breeds"
