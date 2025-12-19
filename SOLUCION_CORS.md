# 🔧 Solución Rápida para CORS

## ⚡ Solución Más Rápida (Sin Instalar Nada)

### Para Chrome/Edge:

1. **Instala una extensión de CORS** (solo para desarrollo):
   - Ve a Chrome Web Store
   - Busca "CORS Unblock" o "Allow CORS: Access-Control-Allow-Origin"
   - Instálala y actívala
   - Recarga tu aplicación
   - ✅ **¡Listo!** Las cartas deberían cargarse

2. **⚠️ IMPORTANTE**: Desactiva la extensión cuando termines de desarrollar por seguridad.

---

## 🐍 Solución con Python (Recomendada para Desarrollo)

### Paso 1: Instalar Python

1. Descarga Python desde: https://www.python.org/downloads/
2. Durante la instalación, **marca la casilla "Add Python to PATH"** (muy importante)
3. Completa la instalación

### Paso 2: Ejecutar el Proxy

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   python proxy_server.py
   ```
   O haz doble clic en `iniciar_proxy.bat`

3. Verás: `🚀 Servidor proxy CORS ejecutándose en http://localhost:8080`
4. **Mantén esa ventana abierta** mientras desarrollas
5. Recarga tu aplicación web
6. ✅ Las cartas deberían cargarse correctamente

---

## 📦 Solución con Node.js (Alternativa)

Si prefieres Node.js:

1. Instala Node.js desde: https://nodejs.org/
2. Ejecuta:
   ```bash
   node proxy_server.js
   ```
   O haz doble clic en `iniciar_proxy_node.bat`

---

## 🌐 Solución Definitiva: GitHub Pages

Cuando subas tu proyecto a GitHub Pages, **CORS no será un problema** porque:
- Se servirá desde `https://tu-usuario.github.io` 
- No es `localhost`, así que CORS funciona normalmente
- No necesitarás proxy ni extensiones

### Cómo subir a GitHub Pages:

1. Crea un repositorio en GitHub
2. Sube tus archivos
3. Ve a Settings > Pages
4. Selecciona la rama `main`
5. Tu app estará en `https://tu-usuario.github.io/PokeCapture`

---

## ❓ ¿Por qué pasa esto?

La API de Pokémon TCG bloquea solicitudes desde `localhost` y `127.0.0.1` por seguridad (política CORS). Esto es normal y se soluciona fácilmente con cualquiera de las opciones arriba.

---

## 🎯 Recomendación

- **Para desarrollo rápido**: Usa la extensión del navegador
- **Para desarrollo profesional**: Usa el proxy Python
- **Para producción**: Sube a GitHub Pages (CORS no será problema)

