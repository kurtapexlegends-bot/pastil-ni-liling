# Start Backend
Write-Host "Starting Laravel Backend..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "php" -ArgumentList "artisan serve" -WorkingDirectory "./backend"

# Start Frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Cyan
cd frontend
npm run dev
