# Push LPG Tank Management System to GitHub
# Repository: https://github.com/ozzieboy26/lpgreading.git

# Navigate to project directory
cd c:\Users\reidb\qoder\lpg-tank-management

# Initialize git repository (if not already initialized)
if (-not (Test-Path .git)) {
    git init
}

# Add remote repository (if not already added)
try {
    git remote add origin https://github.com/ozzieboy26/lpgreading.git
} catch {
    Write-Host "Remote already exists, continuing..." -ForegroundColor Yellow
}

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - LPG Tank Management System with PostgreSQL"

# Pull and merge with remote (in case there's existing content)
git pull origin main --allow-unrelated-histories --no-rebase

# Push to GitHub
git branch -M main
git push -u origin main --force

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "Repository: https://github.com/ozzieboy26/lpgreading" -ForegroundColor Cyan
