# 🔧 Solución para Problemas de CORS

La API de Pokémon TCG bloquea solicitudes desde `localhost` debido a políticas de CORS. Aquí tienes varias soluciones:

## ✅ Solución Recomendada: Proxy Local

### Opción 1: Usar el Proxy Python (Más Simple)

1. **Abre una terminal** en la carpeta del proyecto
2. **Ejecuta el proxy**:
   ```bash
   python proxy_server.py
   ```
3. **Abre tu aplicación** en el navegador (Live Server o servidor local)
4. El código detectará automáticamente el proxy local

### Opción 2: Usar Extensión del Navegador (Solo para Desarrollo)

**Chrome/Edge:**
1. Instala la extensión "CORS Unblock" o "Allow CORS"
2. Actívala cuando desarrolles
3. ⚠️ **Solo para desarrollo**, desactívala después

**Firefox:**
1. Ve a `about:config`
2. Busca `security.fileuri.strict_origin_policy`
3. Cambia el valor a `false`
4. ⚠️ **Solo para desarrollo**

### Opción 3: Desplegar en GitHub Pages

Cuando subas tu proyecto a GitHub Pages, CORS no será un problema porque se servirá desde `https://tu-usuario.github.io` en lugar de `localhost`.

## 🚀 Cómo Usar el Proxy Python

1. Asegúrate de tener Python instalado
2. Ejecuta en una terminal:
   ```bash
   python proxy_server.py
   ```
3. Verás: `🚀 Servidor proxy CORS ejecutándose en http://localhost:8080`
4. Mantén esta terminal abierta mientras desarrollas
5. Tu aplicación funcionará normalmente

## 📝 Notas

- El proxy solo es necesario durante el desarrollo local
- En producción (GitHub Pages, Netlify, etc.) no necesitarás el proxy
- El proxy escucha en el puerto 8080 por defecto
- Puedes cambiar el puerto editando `proxy_server.py`

