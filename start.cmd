@echo off
cd /d "%~dp0"
docker info >nul 2>&1
if errorlevel 1 (
  echo Open Docker Desktop and wait until it is running, then retry.
  pause
  exit /b 1
)
call docker compose up -d --wait
if errorlevel 1 (
  pause
  exit /b 1
)
echo Catalog: http://localhost:3000/catalog
call npm.cmd run dev
pause
