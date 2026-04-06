#!/usr/bin/env powershell
# Restart backend and test messaging

Write-Host "🔄 Restarting Backend..." -ForegroundColor Cyan
Write-Host ""

$backendPath = "c:\Users\DELL\OneDrive\Desktop\mysports\backend"

# Kill any existing uvicorn processes
Write-Host "Stopping existing backend processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*python*" -and $_.ProcessName -notlike "*idle*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to backend
Set-Location $backendPath

# Activate venv and start uvicorn
Write-Host "Starting backend with uvicorn..." -ForegroundColor Cyan
Write-Host ""

& ".\venv\Scripts\activate.ps1"
uvicorn main:app --reload --log-level info

Write-Host ""
Write-Host "✓ Backend running!" -ForegroundColor Green
Write-Host "Uvicorn is available at: http://127.0.0.1:8000"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
