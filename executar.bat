@echo off
title BurguerSync - Iniciando Servidor Local
echo ========================================================
echo        BURGUERSYNC - CARDAPIO & COZINHA REALTIME
echo        Tecnologia: Google Antigravity & Firebase
echo ========================================================
echo.
cd /d "%~dp0frontend"
echo [1/2] Verificando dependencias...
if not exist node_modules (
    echo Instalando modulos do projeto...
    call npm install
)
echo.
echo [2/2] Iniciando servidor Vite em http://localhost:3000...
echo.
start "" http://localhost:3000
call npm run dev
pause
