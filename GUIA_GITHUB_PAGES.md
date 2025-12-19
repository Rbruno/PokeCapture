# 🚀 Guía: Subir PokeCapture a GitHub Pages

## Paso a Paso Completo

### Paso 1: Crear una cuenta en GitHub (si no tienes una)

1. Ve a: https://github.com/
2. Haz clic en "Sign up" (Registrarse)
3. Completa el formulario con tu email, contraseña y nombre de usuario
4. Verifica tu email

---

### Paso 2: Instalar Git (si no lo tienes)

1. Descarga Git desde: https://git-scm.com/download/win
2. Ejecuta el instalador
3. Durante la instalación, deja todas las opciones por defecto
4. Verifica la instalación abriendo PowerShell y escribiendo:
   ```bash
   git --version
   ```
   Deberías ver algo como: `git version 2.x.x`

---

### Paso 3: Configurar Git (solo la primera vez)

Abre PowerShell o Terminal y ejecuta:

```bash
git config --global user.name "Rodrigo"
git config --global user.email "rodrigobruno74@gmail.com"
```

Reemplaza con tu nombre y email real.

---

### Paso 4: Inicializar el repositorio Git en tu proyecto

1. Abre PowerShell o Terminal
2. Navega a la carpeta de tu proyecto:
   ```bash
   cd D:\PokeCapture
   ```
3. Inicializa Git:
   ```bash
   git init
   ```

---

### Paso 5: Crear el archivo .gitignore (opcional pero recomendado)

Ya tienes un archivo `.gitignore` en tu proyecto, así que este paso está cubierto.

---

### Paso 6: Agregar todos los archivos al repositorio

```bash
git add .
```

Este comando agrega todos los archivos de tu proyecto a Git.

---

### Paso 7: Hacer el primer commit (guardar los cambios)

```bash
git commit -m "Initial commit - PokeCapture app"
```

---

### Paso 8: Crear un repositorio en GitHub

1. Ve a: https://github.com/
2. Inicia sesión
3. Haz clic en el botón **"+"** en la esquina superior derecha
4. Selecciona **"New repository"** (Nuevo repositorio)
5. Completa el formulario:
   - **Repository name**: `PokeCapture` (o el nombre que prefieras)
   - **Description**: "Colección de cartas Pokémon" (opcional)
   - **Visibility**: Selecciona **Public** (necesario para GitHub Pages gratuito)
   - **NO marques** "Initialize this repository with a README" (ya tienes archivos)
6. Haz clic en **"Create repository"** (Crear repositorio)

---

### Paso 9: Conectar tu proyecto local con GitHub

GitHub te mostrará comandos. Usa estos:

```bash
git branch -M main
git remote add origin https://github.com/Rbruno/PokeCapture.git
```

**⚠️ IMPORTANTE**: Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

Por ejemplo, si tu usuario es `rodrigo123`, sería:
```bash
git remote add origin https://github.com/rodrigo123/PokeCapture.git
```

---

### Paso 10: Subir tu código a GitHub

```bash
git push -u origin main
```

Te pedirá tu usuario y contraseña de GitHub. Si tienes autenticación de dos factores, necesitarás un token de acceso personal.

**Si te pide autenticación:**
1. Ve a: https://github.com/settings/tokens
2. Haz clic en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre como "PokeCapture"
4. Selecciona el scope `repo`
5. Haz clic en "Generate token"
6. **Copia el token** (solo se muestra una vez)
7. Cuando Git te pida la contraseña, usa el token en lugar de tu contraseña

---

### Paso 11: Activar GitHub Pages

1. Ve a tu repositorio en GitHub: `https://github.com/TU-USUARIO/PokeCapture`
2. Haz clic en **"Settings"** (Configuración) en el menú superior
3. En el menú lateral izquierdo, busca **"Pages"** (Páginas)
4. En **"Source"** (Fuente), selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
5. Haz clic en **"Save"** (Guardar)

---

### Paso 12: Esperar y acceder a tu aplicación

1. Espera 1-2 minutos mientras GitHub procesa tu sitio
2. Verás un mensaje verde: "Your site is live at..."
3. Tu aplicación estará disponible en:
   ```
   https://Rbruno.github.io/PokeCapture/
   ```

**¡Listo!** 🎉 Tu aplicación está en línea y CORS no será un problema.

---

## 🔄 Actualizar tu sitio después de hacer cambios

Cada vez que hagas cambios en tu código:

```bash
cd D:\PokeCapture
git add .
git commit -m "Descripción de los cambios"
git push
```

GitHub Pages se actualizará automáticamente en 1-2 minutos.

---

## ❓ Solución de Problemas

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/PokeCapture.git
```

### Error: "failed to push"
Asegúrate de que tu usuario y token sean correctos.

### El sitio no carga
- Espera 2-3 minutos más
- Verifica que el repositorio sea público
- Revisa la pestaña "Actions" en GitHub para ver si hay errores

---

## 📝 Notas Importantes

- **GitHub Pages es GRATIS** para repositorios públicos
- Tu sitio se actualiza automáticamente cuando haces `git push`
- La URL será: `https://Rbruno.github.io/PokeCapture/`
- **CORS no será un problema** porque se sirve desde `https://` en lugar de `localhost`

