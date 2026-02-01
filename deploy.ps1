# Deploy Script - Run this to push changes to production

cd c:\Users\reidb\qoder\lpg-tank-management

# Add all changes
git add .

# Commit with message
git commit -m "Fix Excel import: handle DROP PONT typo, multiple TANKSIZE columns, and enhanced column detection"

# Push to GitHub (which will trigger Render deployment)
git push origin main

Write-Host "`n✅ Changes pushed to GitHub!" -ForegroundColor Green
Write-Host "🚀 Render will automatically deploy the new version" -ForegroundColor Cyan
Write-Host "⏱️  Check deployment status at: https://dashboard.render.com" -ForegroundColor Yellow
