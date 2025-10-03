# XAMPP Log Monitor Script
# Run this in PowerShell as Administrator

Write-Host "🔍 XAMPP Log Monitor Started" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""


# Paths
$laravelLog = "F:\PRO-PROJECTS\aquabill\storage\logs\laravel.log"
$apacheAccessLog = "C:\xampp\apache\logs\access.log"
$apacheErrorLog = "C:\xampp\apache\logs\error.log"

# Check if files exist
if (-not (Test-Path $laravelLog)) {
    Write-Host "❌ Laravel log not found: $laravelLog" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $apacheAccessLog)) {
    Write-Host "❌ Apache access log not found: $apacheAccessLog" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Monitoring Laravel logs: $laravelLog" -ForegroundColor Green
Write-Host "✅ Monitoring Apache access logs: $apacheAccessLog" -ForegroundColor Green
Write-Host ""

# Function to display Laravel API requests
function Show-LaravelRequest {
    param($line)
    
    if ($line -match "API Request Debug") {
        Write-Host "📱 Laravel API Request:" -ForegroundColor Cyan
        Write-Host "   $line" -ForegroundColor White
        Write-Host ""
    }
}

# Function to display Apache requests
function Show-ApacheRequest {
    param($line)
    
    if ($line -match "10\.103\.26\.43" -or $line -match "api/") {
        Write-Host "🌐 Apache Request:" -ForegroundColor Yellow
        Write-Host "   $line" -ForegroundColor White
        Write-Host ""
    }
}

# Monitor Laravel logs
Get-Content $laravelLog -Wait -Tail 0 | ForEach-Object {
    Show-LaravelRequest $_
}

# Monitor Apache logs (run in separate process)
Start-Job -ScriptBlock {
    Get-Content "C:\xampp\apache\logs\access.log" -Wait -Tail 0 | ForEach-Object {
        if ($_ -match "10\.103\.26\.43" -or $_ -match "api/") {
            Write-Host "🌐 Apache Request: $_" -ForegroundColor Yellow
        }
    }
}
