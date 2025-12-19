@echo off
echo ========================================
echo   Proxy CORS para Pokemon TCG API
echo ========================================
echo.
echo Iniciando servidor proxy en http://localhost:8080
echo Manten esta ventana abierta mientras desarrollas
echo Presiona Ctrl+C para detener el servidor
echo.
cd /d "%~dp0"
python proxy_server.py
pause

