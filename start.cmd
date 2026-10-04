@echo off
cd /d "%~dp0"
echo Catalog: http://localhost:3000/catalog
call npm.cmd run dev
pause
