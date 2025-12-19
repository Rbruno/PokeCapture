@echo off
echo Iniciando servidor local en http://localhost:8000
echo Presiona Ctrl+C para detener el servidor
echo.
cd /d "%~dp0"
python -m http.server 8000
pause

