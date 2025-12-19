# 🔴 PokeCapture - Colección de Cartas Pokémon

Una aplicación web moderna para gestionar tu colección de cartas Pokémon. Marca qué Pokémon tienes y selecciona la carta específica de cada uno en tu colección.

## ✨ Características

- 📋 **Lista completa de Pokémon**: Visualiza todos los Pokémon con sus imágenes oficiales
- ✅ **Marcado de posesión**: Marca qué Pokémon tienes en tu colección
- 🎴 **Visualización de cartas**: Al hacer clic en un Pokémon, verás todas las cartas disponibles de ese Pokémon
- 🎯 **Selección de carta específica**: Marca qué carta específica tienes de cada Pokémon
- 🔄 **Formas alternas**: Soporte para formas alternas de Pokémon (Mega Evoluciones, Formas Regionales, etc.)
- 💾 **Almacenamiento local**: Tu colección se guarda automáticamente en tu navegador
- 🔍 **Búsqueda y filtros**: Busca Pokémon por nombre o ID, filtra por capturados
- 📊 **Estadísticas**: Ve el progreso de tu colección en tiempo real

## 🚀 Cómo usar

### Opción 1: Ejecutar localmente

1. **Clona o descarga este repositorio**
   ```bash
   git clone https://github.com/tu-usuario/PokeCapture.git
   cd PokeCapture
   ```

2. **Abre el archivo `index.html` en tu navegador**
   - Simplemente haz doble clic en `index.html`
   - O arrastra el archivo a tu navegador
   - O usa un servidor local:
     ```bash
     # Con Python 3
     python -m http.server 8000
     
     # Con Node.js (si tienes http-server instalado)
     npx http-server
     
     # Con PHP
     php -S localhost:8000
     ```
   - Luego abre `http://localhost:8000` en tu navegador

### Opción 2: GitHub Pages

1. **Sube el proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/PokeCapture.git
   git push -u origin main
   ```

2. **Habilita GitHub Pages**
   - Ve a Settings > Pages en tu repositorio
   - Selecciona la rama `main` como fuente
   - Tu app estará disponible en `https://tu-usuario.github.io/PokeCapture`

## 📖 Instrucciones de uso

1. **Ver la lista de Pokémon**: Al cargar la página, verás todos los Pokémon disponibles
2. **Buscar Pokémon**: Usa la barra de búsqueda para encontrar un Pokémon específico
3. **Ver cartas de un Pokémon**: Haz clic en cualquier tarjeta de Pokémon para abrir el modal con sus cartas
4. **Seleccionar una carta**: Haz clic en la carta que tienes en tu colección
5. **Marcar como capturado**: Al seleccionar una carta, el Pokémon se marca automáticamente como capturado
6. **Filtrar colección**: Usa el botón "Mostrar solo capturados" para ver solo los Pokémon que tienes

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Diseño moderno y responsive con gradientes y animaciones
- **JavaScript (Vanilla)**: Lógica de la aplicación sin dependencias externas
- **PokeAPI**: API gratuita para obtener información de Pokémon
- **TCGdx API**: API gratuita y de código abierto para obtener información de cartas Pokémon TCG

## 📡 APIs utilizadas

- **PokeAPI** (`https://pokeapi.co`): Para obtener la lista de Pokémon, imágenes y formas alternas
- **Pokémon TCG API** (`https://api.pokemontcg.io`): API oficial para obtener información de las cartas del TCG de Pokémon
  - Es gratuita pero puede requerir una API key para uso en producción
  - Obtén tu API key gratuita en: https://pokemontcg.io/

## 💾 Almacenamiento

La aplicación guarda tu colección en el **LocalStorage** de tu navegador. Esto significa que:
- ✅ Tu colección se guarda automáticamente
- ✅ No necesitas crear una cuenta
- ✅ Los datos son privados y solo están en tu navegador
- ⚠️ Si limpias los datos del navegador, perderás tu colección

## 🎨 Características del diseño

- Diseño moderno con gradientes y efectos visuales
- Interfaz responsive que funciona en móviles y tablets
- Animaciones suaves y transiciones
- Indicadores visuales claros para Pokémon capturados
- Modal elegante para visualizar cartas

## 🔧 Personalización

Puedes personalizar la aplicación editando los archivos:

- `index.html`: Estructura y contenido
- `styles.css`: Estilos y diseño visual
- `app.js`: Lógica y funcionalidad

### Cambiar el número de Pokémon a cargar

En `app.js`, línea ~47, puedes cambiar el límite:
```javascript
const limit = 1000; // Cambia este número
```

## 📝 Notas

- La aplicación carga hasta 1000 Pokémon por defecto (incluye todas las generaciones)
- Las cartas se obtienen de la API de TCGdx, que puede tener limitaciones de velocidad
- Si no encuentras cartas para un Pokémon, puede ser que no existan cartas oficiales de ese Pokémon
- La aplicación funciona completamente offline después de la primera carga (los datos se cachean)

## 🐛 Solución de problemas

**Las cartas no se cargan:**
- ⚠️ **IMPORTANTE**: Si abres `index.html` directamente desde el explorador de archivos (file://), las cartas NO funcionarán debido a restricciones CORS del navegador.
- **Solución**: Debes usar un servidor local. Ejecuta `servidor.bat` o usa Python:
  ```bash
  python -m http.server 8000
  ```
  Luego abre `http://localhost:8000` en tu navegador.
- Verifica tu conexión a internet
- La API de TCGdx puede estar temporalmente no disponible
- Algunos Pokémon pueden no tener cartas oficiales
- Abre la consola del navegador (F12) para ver mensajes de error detallados

**Los Pokémon no se cargan:**
- Verifica tu conexión a internet
- La API de PokeAPI puede estar temporalmente no disponible
- Intenta recargar la página

**La colección se perdió:**
- Si limpiaste los datos del navegador, la colección se perdió
- Considera hacer una copia de seguridad periódica exportando los datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 🙏 Agradecimientos

- [PokeAPI](https://pokeapi.co/) por proporcionar la API de Pokémon
- [TCGdx](https://tcgdx.dev/) por proporcionar la API de cartas Pokémon TCG
- A todos los contribuyentes de estas APIs de código abierto

---

¡Disfruta gestionando tu colección de cartas Pokémon! 🎴✨

