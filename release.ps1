# Release script to update version query parameters in HTML file and display
# Default version format: DIA.MES.ANIO (e.g., 13.01.2026)
param([string]$Version = (Get-Date).ToString("dd.MM.yyyy"))
Write-Host "Deploying version: $Version" -ForegroundColor Green

$htmlFile = "index.html"
if (-not (Test-Path $htmlFile)) {
    Write-Host "Error: $htmlFile not found" -ForegroundColor Red
    exit 1
}

# Read file
$content = Get-Content $htmlFile -Raw

# Update main.css and main.js query parameters to force reload
$patternCss = 'href="([^"]*main\.css)(\?v=[^"]*)?"'
$replacementCss = 'href="$1?v=' + $Version + '"'
$content = [regex]::Replace($content, $patternCss, $replacementCss)

$patternJs = 'src="([^"]*main\.js)(\?v=[^"]*)?"'
$replacementJs = 'src="$1?v=' + $Version + '"'
$content = [regex]::Replace($content, $patternJs, $replacementJs)

# Update the version display if present, otherwise insert it above the totem
if ($content -match '<div\s+id="site-version"[^>]*>.*?</div>') {
    $content = [regex]::Replace(
        $content,
        '(<div\s+id="site-version"[^>]*>)(.*?)(</div>)',
        ('$1v' + $Version + '$3'),
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
}

# Write back
$content | Set-Content $htmlFile -Encoding UTF8
Write-Host "HTML updated with version v$Version" -ForegroundColor Green