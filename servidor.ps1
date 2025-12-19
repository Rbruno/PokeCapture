# Script para iniciar servidor local
Write-Host "Iniciando servidor local en http://localhost:8000" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio del script
Set-Location $PSScriptRoot

# Intentar iniciar servidor con Python
try {
    python -m http.server 8000
} catch {
    Write-Host "Error: Python no encontrado. Intentando con otras opciones..." -ForegroundColor Red
    
    # Intentar con Node.js si está disponible
    try {
        npx http-server -p 8000
    } catch {
        Write-Host "Error: No se encontró Python ni Node.js" -ForegroundColor Red
        Write-Host "Por favor, instala Python desde https://www.python.org/" -ForegroundColor Yellow
        Write-Host "O abre index.html directamente en tu navegador" -ForegroundColor Yellow
        pause
    }
}

