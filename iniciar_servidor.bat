@echo off
title Iniciar TaskManager Pro
echo ========================================================
echo   INICIANDO TASKMANAGER PRO (VANILLA JS ES6+)
echo ========================================================
echo.
echo Abriendo servidor local y navegador...
start http://localhost:8080
python -m http.server 8080
pause
