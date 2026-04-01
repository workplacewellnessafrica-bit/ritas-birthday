# setup_project.ps1
$workspace = "C:\Users\T\.gemini\antigravity\playground\rapid-singularity"
$downloads = "C:\Users\T\Downloads"

Write-Host "Setting up Rita's Birthday project structure..." -ForegroundColor Cyan

# 1. Create assets directory
New-Item -ItemType Directory -Force -Path "$workspace\assets" | Out-Null

# 2. Move HTML and rename to index.html (better for GitHub Pages)
Copy-Item "$downloads\ritas-birthday.html" "$workspace\index.html" -Force

# 3. Move images to assets
Write-Host "Copying images r1 through r7..."
Copy-Item "$downloads\r*.jpeg" "$workspace\assets\" -Force
Copy-Item "$downloads\r*.jpg" "$workspace\assets\" -ErrorAction SilentlyContinue
Copy-Item "$downloads\r*.png" "$workspace\assets\" -ErrorAction SilentlyContinue

Write-Host "Copying background music and video..."
$mp3 = Get-ChildItem -Path $downloads -Filter "*.mp3" | Select-Object -First 1
if ($null -ne $mp3) { Copy-Item $mp3.FullName "$workspace\assets\music.mp3" -Force }

$mp4 = Get-ChildItem -Path $downloads -Filter "*.mp4" | Select-Object -First 1
if ($null -ne $mp4) { Copy-Item $mp4.FullName "$workspace\assets\video.mp4" -Force }

Write-Host "Files organized successfully!" -ForegroundColor Green

# 4. Initialize Git Repo
Set-Location $workspace
git init
git add .
git commit -m "Initial commit for Rita's Birthday ✨"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "Project is organized and Git is initialized!" -ForegroundColor White
Write-Host "To launch this on GitHub Pages, please do the following:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to GitHub and create a new repository (e.g., 'ritas-birthday')"
Write-Host "2. Copy your new repository's URL."
Write-Host "3. Run these commands in your terminal:"
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git remote add origin <YOUR_GITHUB_REPO_URL>" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host "4. On your GitHub repo page, go to Settings -> Pages."
Write-Host "   Under 'Build and deployment', set Source to 'Deploy from a branch'."
Write-Host "   Select the 'main' branch and click Save."
Write-Host "================================================================" -ForegroundColor Yellow
