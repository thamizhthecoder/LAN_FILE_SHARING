$ErrorActionPreference = "Stop"

Write-Host "========================================="
Write-Host " Building LAN File Share Executable      "
Write-Host "========================================="

# Step 1: Build Frontend
Write-Host "`n[1/3] Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 2: Copy Frontend to Backend static folder
Write-Host "`n[2/3] Copying Frontend to Backend..."
$staticDir = "backend\src\main\resources\static"
If (Test-Path $staticDir) {
    Remove-Item -Recurse -Force "$staticDir\*"
} Else {
    New-Item -ItemType Directory -Force -Path $staticDir | Out-Null
}
Copy-Item -Path "frontend\dist\*" -Destination $staticDir -Recurse -Force

# Step 3: Build Backend and Generate Executable
Write-Host "`n[3/3] Building Spring Boot Backend & Executable..."
cd backend
.\mvnw.cmd clean package
cd ..

Write-Host "`n========================================="
Write-Host " Build Complete! "
Write-Host " Your executable should be in backend\target\"
Write-Host "========================================="
