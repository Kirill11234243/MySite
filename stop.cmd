@echo off
cd /d "%~dp0"
echo First press Ctrl+C in the window running the website.
docker compose stop
pause
