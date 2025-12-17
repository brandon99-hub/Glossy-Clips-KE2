# Load DATABASE_URL from .env file
$envFile = Get-Content .env -ErrorAction SilentlyContinue
foreach ($line in $envFile) {
    if ($line -match '^DATABASE_URL=(.+)$') {
        $env:DATABASE_URL = $matches[1]
        Write-Host "✓ Loaded DATABASE_URL from .env" -ForegroundColor Green
        break
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "✗ DATABASE_URL not found in .env file" -ForegroundColor Red
    Write-Host "Please make sure you have DATABASE_URL set in your .env file" -ForegroundColor Yellow
    exit 1
}

# List of migration scripts in order
$scripts = @(
    "scripts/001-create-tables.sql",
    "scripts/002-seed-products.sql",
    "scripts/003-seed-testimonials.sql",
    "scripts/004-add-bundles-and-stock.sql",
    "scripts/004-create-admin.sql",
    "scripts/005-add-reviews.sql",
    "scripts/006-add-wishlist.sql",
    "scripts/007-add-inventory-alerts.sql",
    "scripts/008-add-pickup-mtaani.sql",
    "scripts/009-seed-admin.sql"
)

Write-Host "`nRunning database migrations..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "Running: $script" -ForegroundColor Yellow
        
        try {
            psql $env:DATABASE_URL -f $script
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Success: $script`n" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "✗ Failed: $script`n" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host "✗ Error running $script : $_`n" -ForegroundColor Red
            $failCount++
        }
    }
    else {
        Write-Host "✗ File not found: $script`n" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "================================`n" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "✓ All migrations completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "⚠ Some migrations failed. Please check the errors above." -ForegroundColor Yellow
}
