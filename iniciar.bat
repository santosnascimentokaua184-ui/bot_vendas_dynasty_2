@echo off
echo ========================================
echo       Vendas Zend - Iniciando Bot
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    npm install
    echo.
)

echo [INFO] Iniciando o bot...
node index.js
pause
