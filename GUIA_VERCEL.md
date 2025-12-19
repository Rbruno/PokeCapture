# 🚀 Guía: Desplegar Proxy en Vercel (Gratis)

Para solucionar el problema de CORS desde GitHub Pages, necesitas desplegar un proxy en Vercel.

## Paso 1: Crear cuenta en Vercel

1. Ve a: https://vercel.com/
2. Haz clic en "Sign Up"
3. Regístrate con GitHub (es más fácil, conecta directamente con tu cuenta)

## Paso 2: Instalar Vercel CLI (Opcional - puedes usar la web)

```bash
npm install -g vercel
```

O simplemente usa la interfaz web de Vercel.

## Paso 3: Desplegar el proxy

### Opción A: Desde la Web (Más Fácil)

1. Ve a: https://vercel.com/new
2. Conecta tu repositorio de GitHub (PokeCapture)
3. Vercel detectará automáticamente el proyecto
4. En "Root Directory", asegúrate de que esté en la raíz
5. Haz clic en "Deploy"
6. Espera 1-2 minutos
7. Copia la URL que te da (algo como: `https://poke-capture.vercel.app`)

### Opción B: Desde la Terminal

```bash
cd D:\PokeCapture
vercel
```

Sigue las instrucciones en pantalla.

## Paso 4: Actualizar el código para usar el proxy

Una vez que tengas la URL de Vercel (por ejemplo: `https://poke-capture.vercel.app`), actualiza `app.js`:

```javascript
// En la función loadCardsPage, cambiar:
const url = `${baseUrl}?${queryParams}`;

// Por:
const vercelProxy = 'https://TU-PROYECTO.vercel.app/api/proxy';
const url = `${vercelProxy}?q=${query}&page=${page}&pageSize=${state.cardsPagination.pageSize}`;
```

## Paso 5: Subir los cambios a GitHub

```bash
git add .
git commit -m "Agregar proxy de Vercel para CORS"
git push
```

## ✅ Resultado

- Tu aplicación en GitHub Pages funcionará sin problemas de CORS
- El proxy en Vercel manejará las solicitudes a la API
- Todo es GRATIS

---

## 🔄 Actualizar después de cambios

Cada vez que hagas cambios en `api/proxy.js`:

1. Haz commit y push a GitHub
2. Vercel se actualizará automáticamente (si conectaste el repositorio)
3. O ejecuta `vercel --prod` desde la terminal

---

## 📝 Notas

- Vercel es GRATIS para proyectos personales
- El proxy solo maneja solicitudes GET a la API de Pokémon TCG
- La API key está en el código del proxy (seguro porque es solo lectura)

