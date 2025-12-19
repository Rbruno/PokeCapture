// Estado de la aplicación
const state = {
    pokemon: [],
    filteredPokemon: [],
    collection: {},
    selectedPokemon: null,
    filterMode: 'all', // 'all' o 'captured'
    cardsPagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        hasMore: true,
        loading: false,
        pokemonName: ''
    },
    tcgdx: null // Instancia del SDK de TCGdx
};

// Inicializar TCGdx SDK
function initTCGdx() {
    // Intentar usar el SDK de TCGdx desde el CDN
    // El SDK se expone como TCGdex (con 'e') según la documentación
    let SDK = null;
    
    // Verificar diferentes formas en que el SDK puede estar expuesto
    if (typeof TCGdex !== 'undefined') {
        SDK = TCGdex;
    } else if (typeof TCGdx !== 'undefined') {
        SDK = TCGdx;
    } else if (window.TCGdex) {
        SDK = window.TCGdex;
    } else if (window.TCGdx) {
        SDK = window.TCGdx;
    }
    
    if (SDK) {
        try {
            // Inicializar el SDK con español
            const tcgdex = new SDK('es');
            
            // Crear wrapper con las funciones que necesitamos
            state.tcgdx = {
                sdk: tcgdex,
                lang: 'es',
                // Función para buscar cartas por nombre usando el SDK
                searchCards: async function(name, page = 1, pageSize = 10) {
                    try {
                        // Obtener todas las cartas usando el SDK
                        const allCards = await this.sdk.card.list();
                        
                        // Filtrar por nombre (case-insensitive)
                        const filtered = allCards.filter(card => 
                            card.name && card.name.toLowerCase().includes(name.toLowerCase())
                        );
                        
                        // Aplicar paginación
                        const startIndex = (page - 1) * pageSize;
                        const paginated = filtered.slice(startIndex, startIndex + pageSize);
                        
                        return {
                            data: paginated,
                            page: page,
                            pageSize: pageSize,
                            totalCount: filtered.length,
                            hasMore: (startIndex + pageSize) < filtered.length
                        };
                    } catch (error) {
                        console.error('Error buscando cartas con SDK:', error);
                        throw error;
                    }
                }
            };
            
            console.log('✅ TCGdx SDK inicializado correctamente');
            return;
        } catch (error) {
            console.error('Error inicializando SDK:', error);
        }
    }
    
    // Fallback: usar API REST directamente si el SDK no está disponible
    console.warn('⚠️ SDK no disponible, usando API REST como fallback');
    state.tcgdx = {
        lang: 'es',
        baseUrl: 'https://api.tcgdx.dev/v2',
        searchCards: async function(name, page = 1, pageSize = 10) {
            const urlsToTry = [
                `${this.baseUrl}/${this.lang}/cards`,
                `https://api.tcgdx.dev/v2/${this.lang}/cards`
            ];
            
            let lastError = null;
            
            for (const url of urlsToTry) {
                try {
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    const data = await response.json();
                    const allCards = Array.isArray(data) ? data : (data.data || []);
                    const filtered = allCards.filter(card => 
                        card.name && card.name.toLowerCase().includes(name.toLowerCase())
                    );
                    
                    const startIndex = (page - 1) * pageSize;
                    const paginated = filtered.slice(startIndex, startIndex + pageSize);
                    
                    return {
                        data: paginated,
                        page: page,
                        pageSize: pageSize,
                        totalCount: filtered.length,
                        hasMore: (startIndex + pageSize) < filtered.length
                    };
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }
            
            throw lastError || new Error('No se pudo conectar con la API de TCGdx');
        }
    };
    console.log('✅ TCGdx API REST inicializada (fallback)');
}

// Función de inicialización
async function initializeApp() {
    // Esperar un momento para que el SDK se cargue completamente
    await new Promise(resolve => setTimeout(resolve, 300));
    initTCGdx();
    await loadCollection();
    loadPokemon();
    setupEventListeners();
    setupSaveFileHandlers();
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);

// También intentar cuando la ventana se carga completamente (por si el SDK se carga después)
window.addEventListener('load', () => {
    if (!state.tcgdx) {
        setTimeout(() => {
            initTCGdx();
        }, 500);
    }
});

// Cargar colección desde localStorage
async function loadCollection() {
    // Cargar desde localStorage (siempre disponible)
    const saved = localStorage.getItem('pokemonCollection');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Si es el formato nuevo con metadata, extraer solo la colección
            if (parsed.collection) {
                state.collection = parsed.collection;
            } else {
                // Formato antiguo, usar directamente
                state.collection = parsed;
            }
            console.log('✅ Colección cargada desde localStorage');
        } catch (error) {
            console.error('Error cargando colección:', error);
            state.collection = {};
        }
    } else {
        console.log('No hay colección guardada, empezando nueva');
        state.collection = {};
    }
}

// Guardar colección en localStorage (siempre automático)
function saveCollection() {
    // Guardar en localStorage (respaldo automático - siempre funciona)
    localStorage.setItem('pokemonCollection', JSON.stringify(state.collection));
    
    // Si hay un file handle guardado (usuario ya dio permiso), guardar automáticamente en archivo
    if (window.saveFileHandle) {
        saveToFileHandle();
    }
}

// Guardar automáticamente en el archivo si hay permiso
async function saveToFileHandle() {
    try {
        const saveData = {
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            totalCaptured: Object.keys(state.collection).filter(id => state.collection[id].captured).length,
            collection: state.collection
        };
        const jsonString = JSON.stringify(saveData, null, 2);
        
        const writable = await window.saveFileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        console.log('✅ Guardado automático en archivo completado');
    } catch (error) {
        console.log('⚠️ Error en guardado automático, usando localStorage:', error);
        // Si falla, eliminar el handle para no seguir intentando
        window.saveFileHandle = null;
        localStorage.removeItem('saveFileHandle');
    }
}

// Exportar colección a archivo JSON
async function exportCollection() {
    const saveData = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalCaptured: Object.keys(state.collection).filter(id => state.collection[id].captured).length,
        collection: state.collection
    };
    
    const jsonString = JSON.stringify(saveData, null, 2);
    
    // Intentar usar File System Access API (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'pokeCapture_save.json',
                types: [{
                    description: 'Archivo JSON de guardado',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            // Guardar el handle para futuras exportaciones automáticas
            window.saveFileHandle = fileHandle;
            localStorage.setItem('saveFileHandle', JSON.stringify({ name: fileHandle.name }));
            
            const writable = await fileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            alert('✅ Colección guardada en archivo exitosamente');
        } catch (error) {
            if (error.name !== 'AbortError') {
                // Si falla, usar descarga tradicional
                downloadSaveFile(jsonString);
            }
        }
    } else {
        // Navegadores sin File System Access API - usar descarga tradicional
        downloadSaveFile(jsonString);
    }
}

// Descargar archivo de guardado (método tradicional)
function downloadSaveFile(jsonString) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokeCapture_save_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Importar colección desde archivo JSON
async function importCollection() {
    // Intentar usar File System Access API
    if ('showOpenFilePicker' in window) {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Archivo JSON de guardado',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            const file = await fileHandle.getFile();
            const text = await file.text();
            const saveData = JSON.parse(text);
            
            if (saveData.collection) {
                state.collection = saveData.collection;
                saveCollection(); // Guardar también en localStorage
                renderPokemon();
                updateStats();
                alert('✅ Colección cargada desde archivo exitosamente');
            } else {
                alert('❌ El archivo no tiene el formato correcto');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                // Si falla, usar input file tradicional
                importCollectionTraditional();
            }
        }
    } else {
        // Navegadores sin File System Access API
        importCollectionTraditional();
    }
}

// Importar colección usando input file tradicional
function importCollectionTraditional() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const saveData = JSON.parse(event.target.result);
                    if (saveData.collection) {
                        state.collection = saveData.collection;
                        saveCollection(); // Guardar también en localStorage
                        renderPokemon();
                        updateStats();
                        alert('✅ Colección cargada desde archivo exitosamente');
                    } else {
                        alert('❌ El archivo no tiene el formato correcto');
                    }
                } catch (error) {
                    alert('❌ Error al leer el archivo: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('filter-captured').addEventListener('click', () => setFilterMode('captured'));
    document.getElementById('filter-all').addEventListener('click', () => setFilterMode('all'));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('export-save').addEventListener('click', exportCollection);
    document.getElementById('import-save').addEventListener('click', importCollection);
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('cards-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Intentar restaurar file handle guardado (solo para referencia, no se puede restaurar directamente)
function restoreFileHandle() {
    try {
        const saved = localStorage.getItem('saveFileHandle');
        if (saved) {
            console.log('Se encontró referencia a archivo guardado anteriormente');
            // Nota: No podemos restaurar el handle directamente por seguridad del navegador
            // El usuario necesitará usar el botón de exportar nuevamente para activar el guardado automático
        }
    } catch (error) {
        console.log('No se pudo restaurar file handle');
    }
}

// Configurar handlers para guardado automático
function setupSaveFileHandlers() {
    // Intentar restaurar file handle si existe
    restoreFileHandle();
    
    // Guardar antes de cerrar la página
    window.addEventListener('beforeunload', () => {
        saveCollection();
    });
    
    // Guardar periódicamente cada 30 segundos si hay cambios
    setInterval(() => {
        if (Object.keys(state.collection).length > 0) {
            saveCollection();
        }
    }, 30000);
}

// Cargar lista de Pokémon desde PokeAPI
async function loadPokemon() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    
    try {
        // Cargar todos los Pokémon (hasta 1000 para incluir todas las generaciones)
        const limit = 1000;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
        const data = await response.json();
        
        // Cargar detalles de cada Pokémon (con manejo de formas alternas)
        const pokemonPromises = data.results.map(async (pokemon) => {
            try {
                const pokemonResponse = await fetch(pokemon.url);
                const pokemonData = await pokemonResponse.json();
                
                // Obtener formas alternas si existen
                let alternateForms = [];
                if (pokemonData.forms && pokemonData.forms.length > 1) {
                    const formPromises = pokemonData.forms.slice(1).map(async (form) => {
                        try {
                            const formResponse = await fetch(form.url);
                            const formData = await formResponse.json();
                            return {
                                id: `${pokemonData.id}-${form.name}`,
                                name: formData.name,
                                image: pokemonData.sprites.other['official-artwork'].front_default || 
                                       pokemonData.sprites.front_default,
                                isAlternateForm: true,
                                baseId: pokemonData.id
                            };
                        } catch (e) {
                            return null;
                        }
                    });
                    alternateForms = (await Promise.all(formPromises)).filter(f => f !== null);
                }
                
                return {
                    id: pokemonData.id,
                    name: pokemonData.name,
                    image: pokemonData.sprites.other['official-artwork'].front_default || 
                           pokemonData.sprites.front_default,
                    url: pokemon.url,
                    alternateForms: alternateForms
                };
            } catch (error) {
                console.error(`Error cargando ${pokemon.name}:`, error);
                return null;
            }
        });
        
        const pokemonList = await Promise.all(pokemonPromises);
        state.pokemon = pokemonList.filter(p => p !== null);
        
        // Agregar formas alternas como Pokémon separados para la colección
        const alternateFormsList = [];
        state.pokemon.forEach(pokemon => {
            if (pokemon.alternateForms && pokemon.alternateForms.length > 0) {
                alternateFormsList.push(...pokemon.alternateForms);
            }
        });
        state.pokemon.push(...alternateFormsList);
        
        // Ordenar por ID
        state.pokemon.sort((a, b) => {
            const aId = parseInt(a.id.toString().split('-')[0]);
            const bId = parseInt(b.id.toString().split('-')[0]);
            return aId - bId;
        });
        
        state.filteredPokemon = [...state.pokemon];
        
        renderPokemon();
        updateStats();
    } catch (error) {
        console.error('Error cargando Pokémon:', error);
        loading.innerHTML = '<p style="color: red;">Error al cargar los Pokémon. Por favor, recarga la página.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

// Renderizar lista de Pokémon
function renderPokemon() {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    
    if (state.filteredPokemon.length === 0) {
        grid.innerHTML = '<div class="empty-state">No se encontraron Pokémon</div>';
        return;
    }
    
    state.filteredPokemon.forEach(pokemon => {
        const isCaptured = state.collection[pokemon.id] && 
                          state.collection[pokemon.id].captured;
        
        const card = document.createElement('div');
        card.className = `pokemon-card ${isCaptured ? 'captured' : ''}`;
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image" 
                 onerror="this.src='https://via.placeholder.com/150?text=Pokemon'">
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        `;
        
        card.addEventListener('click', () => openCardsModal(pokemon));
        
        grid.appendChild(card);
    });
}

// Manejar búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    state.filteredPokemon = state.pokemon.filter(pokemon => {
        const matchesSearch = pokemon.name.includes(searchTerm) || 
                            String(pokemon.id).includes(searchTerm);
        
        if (state.filterMode === 'captured') {
            return matchesSearch && state.collection[pokemon.id]?.captured;
        }
        
        return matchesSearch;
    });
    
    renderPokemon();
}

// Establecer modo de filtro
function setFilterMode(mode) {
    state.filterMode = mode;
    
    document.getElementById('filter-captured').classList.toggle('active', mode === 'captured');
    document.getElementById('filter-all').classList.toggle('active', mode === 'all');
    
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (mode === 'captured') {
        state.filteredPokemon = state.pokemon.filter(pokemon => {
            const matchesSearch = pokemon.name.includes(searchTerm) || 
                                String(pokemon.id).includes(searchTerm);
            return matchesSearch && state.collection[pokemon.id]?.captured;
        });
    } else {
        state.filteredPokemon = state.pokemon.filter(pokemon => {
            return pokemon.name.includes(searchTerm) || 
                   String(pokemon.id).includes(searchTerm);
        });
    }
    
    renderPokemon();
}

// Abrir modal de cartas con paginación
async function openCardsModal(pokemon) {
    state.selectedPokemon = pokemon;
    const modal = document.getElementById('cards-modal');
    const modalTitle = document.getElementById('modal-title');
    const cardsGrid = document.getElementById('cards-grid');
    const modalLoading = document.getElementById('modal-loading');
    
    modal.style.display = 'block';
    modalTitle.textContent = `Cartas de ${pokemon.name}`;
    cardsGrid.innerHTML = '';
    modalLoading.style.display = 'block';
    
    if (!state.tcgdx) {
        alert('❌ TCGdx SDK no está disponible. Por favor, recarga la página.');
        return;
    }
    
    // Resetear paginación
    state.cardsPagination = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        hasMore: true,
        loading: false,
        pokemonName: pokemon.name
    };
    
    // Cargar primera página
    await loadCardsPage(pokemon, 1, true);
    
    // Configurar botón "Ver más"
    setupInfiniteScroll(pokemon);
}

// Cargar una página de cartas usando TCGdx
async function loadCardsPage(pokemon, page, isFirstLoad = false, retryCount = 0) {
    if (state.cardsPagination.loading || !state.cardsPagination.hasMore) {
        return;
    }
    
    state.cardsPagination.loading = true;
    const loadingMore = document.getElementById('loading-more');
    const modalLoading = document.getElementById('modal-loading');
    const cardsGrid = document.getElementById('cards-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (isFirstLoad) {
        modalLoading.style.display = 'block';
        loadMoreContainer.style.display = 'none';
    } else {
        loadingMore.style.display = 'block';
        loadMoreBtn.disabled = true;
    }
    
    try {
        if (!state.tcgdx) {
            throw new Error('TCGdx API no está disponible');
        }
        
        // Buscar cartas por nombre del Pokémon usando la API REST de TCGdx
        const pokemonName = state.cardsPagination.pokemonName || pokemon.name;
        
        // Usar la función searchCards que obtiene todas las cartas y filtra
        const searchResult = await state.tcgdx.searchCards(pokemonName, page, state.cardsPagination.pageSize);
        
        let fetchedCards = [];
        
        // La función searchCards devuelve { data, page, pageSize, totalCount, hasMore }
        if (searchResult.data && Array.isArray(searchResult.data)) {
            fetchedCards = searchResult.data;
            state.cardsPagination.totalCount = searchResult.totalCount || 0;
            state.cardsPagination.hasMore = searchResult.hasMore || false;
        } else if (Array.isArray(searchResult)) {
            fetchedCards = searchResult;
            state.cardsPagination.hasMore = fetchedCards.length === state.cardsPagination.pageSize;
        } else {
            fetchedCards = [];
            state.cardsPagination.hasMore = false;
        }
        
        // Actualizar información de paginación
        // Si recibimos menos cartas que el pageSize, no hay más páginas
        state.cardsPagination.hasMore = fetchedCards.length === state.cardsPagination.pageSize;
        
        // Si es 504 y es el primer intento, reintentar
        if (retryCount < 2 && fetchedCards.length === 0 && isFirstLoad) {
            console.log(`No se encontraron cartas, reintentando... (intento ${retryCount + 1}/2)`);
            state.cardsPagination.loading = false;
            modalLoading.style.display = 'none';
            loadingMore.style.display = 'none';
            
            // Esperar un poco antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return loadCardsPage(pokemon, page, isFirstLoad, retryCount + 1);
        }
        
        if (fetchedCards.length === 0 && isFirstLoad) {
            modalLoading.style.display = 'none';
            cardsGrid.innerHTML = '<div class="empty-state">No se encontraron cartas para este Pokémon.</div>';
            return;
        }
        
        // Renderizar cartas
        renderCards(fetchedCards, pokemon);
        
        modalLoading.style.display = 'none';
        loadingMore.style.display = 'none';
        state.cardsPagination.currentPage = page;
        state.cardsPagination.loading = false;
        
        // Mostrar/ocultar botón "Ver más"
        const loadMoreBtn = document.getElementById('load-more-btn');
        const loadMoreContainer = document.getElementById('load-more-container');
        if (state.cardsPagination.hasMore) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error cargando cartas:', error);
        modalLoading.style.display = 'none';
        loadingMore.style.display = 'none';
        state.cardsPagination.loading = false;
        
        if (isFirstLoad) {
            // Detectar tipo de error
            const isCorsError = error.message && (
                error.message.includes('CORS') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('blocked')
            );
            
            const isTimeoutError = error.message && (
                error.message.includes('504') ||
                error.message.includes('Gateway Timeout') ||
                error.message.includes('aborted') ||
                error.name === 'AbortError'
            ) || error.name === 'AbortError';
            
            if (isCorsError) {
                cardsGrid.innerHTML = `
                    <div class="empty-state">
                        <h3 style="color: #ff6b6b; margin-bottom: 15px;">⚠️ Problema de CORS detectado</h3>
                        <p style="margin-bottom: 10px;">La API de Pokémon TCG bloquea solicitudes desde localhost.</p>
                        <p style="margin-bottom: 15px;"><strong>Soluciones rápidas:</strong></p>
                        <ol style="text-align: left; max-width: 600px; margin: 0 auto 15px;">
                            <li style="margin-bottom: 10px;">
                                <strong>Opción 1 - Extensión Navegador (Más Rápido):</strong><br>
                                Instala "CORS Unblock" o "Allow CORS" en Chrome/Edge y actívala. Luego recarga esta página.
                            </li>
                            <li style="margin-bottom: 10px;">
                                <strong>Opción 2 - Proxy Local:</strong><br>
                                Ejecuta <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">python proxy_server.py</code> o <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">node proxy_server.js</code> en otra terminal
                            </li>
                            <li style="margin-bottom: 10px;">
                                <strong>Opción 3 - GitHub Pages:</strong><br>
                                Sube tu proyecto a GitHub Pages. CORS no será un problema en producción.
                            </li>
                        </ol>
                        <p style="font-size: 0.8em; color: #999;">Error: ${error.message || 'CORS bloqueado'}</p>
                    </div>
                `;
            } else if (isTimeoutError) {
                cardsGrid.innerHTML = `
                    <div class="empty-state">
                        <h3 style="color: #ff9800; margin-bottom: 15px;">⏱️ Timeout de la API</h3>
                        <p style="margin-bottom: 10px;">La API de Pokémon TCG está tardando demasiado en responder.</p>
                        <p style="margin-bottom: 15px;">Esto puede ser temporal. Intenta:</p>
                        <ol style="text-align: left; max-width: 500px; margin: 0 auto 15px;">
                            <li style="margin-bottom: 10px;">Esperar unos segundos y hacer clic de nuevo en el Pokémon</li>
                            <li style="margin-bottom: 10px;">Recargar la página (F5)</li>
                            <li style="margin-bottom: 10px;">Verificar tu conexión a internet</li>
                        </ol>
                        <button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1em; margin-top: 10px;">
                            Recargar Página
                        </button>
                        <p style="font-size: 0.8em; color: #999; margin-top: 15px;">Error: ${error.message || 'Timeout'}</p>
                    </div>
                `;
            } else {
                cardsGrid.innerHTML = `
                    <div class="empty-state">
                        <p style="color: red; margin-bottom: 10px;">Error al cargar las cartas.</p>
                        <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Por favor, intenta de nuevo más tarde.</p>
                        <button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1em;">
                            Recargar Página
                        </button>
                        <p style="font-size: 0.8em; color: #999; margin-top: 15px;">Error: ${error.message || 'Desconocido'}</p>
                    </div>
                `;
            }
        }
    }
}

// Renderizar cartas en el grid
function renderCards(cards, pokemon) {
    const cardsGrid = document.getElementById('cards-grid');
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        
        // TCGdx usa localId como identificador único (formato: "set-localId")
        const cardId = card.localId || 
                      card.id || 
                      `${pokemon.id}-${card.set?.id || 'unknown'}-${index}`;
        
        cardElement.dataset.cardId = cardId;
        
        // Verificar si esta carta está seleccionada
        const isSelected = state.collection[pokemon.id] && 
                          (state.collection[pokemon.id].selectedCard === cardId || 
                           state.collection[pokemon.id].selectedCard === card.localId ||
                           state.collection[pokemon.id].selectedCard === card.id);
        
        if (isSelected) {
            cardElement.classList.add('selected');
        }
        
        // Obtener URL de imagen de TCGdx
        // TCGdx usa localId para las imágenes (formato: set-localId, ej: "swsh3-136")
        let imageUrl = 'https://via.placeholder.com/200?text=Carta';
        
        if (card.localId) {
            // Construir URL de imagen de TCGdx usando localId
            // Formato: https://assets.tcgdx.dev/images/cards/{localId}.png
            imageUrl = `https://assets.tcgdx.dev/images/cards/${card.localId}.png`;
        } else if (card.image) {
            imageUrl = card.image;
        } else if (card.images) {
            imageUrl = card.images.large || card.images.small || card.images.normal;
        } else if (card.id) {
            // Intentar usar el ID como localId
            imageUrl = `https://assets.tcgdx.dev/images/cards/${card.id}.png`;
        }
        
        const cardName = card.name || 'Carta sin nombre';
        
        // TCGdx: set puede ser objeto con nombre o string
        let setName = 'Sin set';
        if (card.set) {
            if (typeof card.set === 'string') {
                setName = card.set;
            } else if (card.set.name) {
                setName = card.set.name;
            }
        } else if (card.setName) {
            setName = card.setName;
        }
        
        cardElement.innerHTML = `
            <img src="${imageUrl}" alt="${cardName}" class="card-image" 
                 onerror="this.src='https://via.placeholder.com/200?text=Carta'">
            <div class="card-name">${cardName}</div>
            <div class="card-set">${setName}</div>
        `;
        
        cardElement.addEventListener('click', () => {
            selectCard(pokemon, { 
                ...card, 
                id: cardId,
                uniqueId: cardId
            });
        });
        
        cardsGrid.appendChild(cardElement);
    });
}

// Configurar botón "Ver más" en lugar de scroll infinito
function setupInfiniteScroll(pokemon) {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    // Remover listener anterior si existe
    if (state.cardsPagination.loadMoreHandler) {
        loadMoreBtn.removeEventListener('click', state.cardsPagination.loadMoreHandler);
    }
    
    // Crear nuevo handler
    const handleLoadMore = () => {
        if (state.cardsPagination.hasMore && !state.cardsPagination.loading) {
            const nextPage = state.cardsPagination.currentPage + 1;
            loadCardsPage(pokemon, nextPage, false);
        }
    };
    
    // Guardar referencia para poder removerla después
    state.cardsPagination.loadMoreHandler = handleLoadMore;
    
    // Agregar listener al botón
    loadMoreBtn.addEventListener('click', handleLoadMore);
    
    // Mostrar botón si hay más cartas
    if (state.cardsPagination.hasMore) {
        loadMoreContainer.style.display = 'block';
    }
}

// Función auxiliar para capitalizar primera letra
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Seleccionar una carta
function selectCard(pokemon, card) {
    if (!state.collection[pokemon.id]) {
        state.collection[pokemon.id] = {};
    }
    
    state.collection[pokemon.id].captured = true;
    state.collection[pokemon.id].selectedCard = card.id;
    state.collection[pokemon.id].cardName = card.name;
    // Obtener imagen de la carta usando TCGdx
    if (card.getImageURL) {
        state.collection[pokemon.id].cardImage = card.getImageURL('high', 'png') || card.getImageURL('low', 'webp');
    } else {
        state.collection[pokemon.id].cardImage = card.image || card.images?.small || card.images?.large || 
                                                 (card.localId ? `https://assets.tcgdx.dev/images/cards/${card.localId}.png` : '');
    }
    
    saveCollection();
    renderPokemon();
    updateStats();
    
    // Actualizar visualización en el modal
    const cardElements = document.querySelectorAll('.card-item');
    cardElements.forEach(el => {
        el.classList.remove('selected');
        // Usar el cardId almacenado en el dataset para comparación precisa
        const elementCardId = el.dataset.cardId;
        if (elementCardId === card.id || elementCardId === card.uniqueId) {
            el.classList.add('selected');
        }
    });
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('cards-modal');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Limpiar listener del botón si existe
    if (state.cardsPagination.loadMoreHandler) {
        loadMoreBtn.removeEventListener('click', state.cardsPagination.loadMoreHandler);
    }
    
    modal.style.display = 'none';
    state.selectedPokemon = null;
    state.cardsPagination = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        hasMore: true,
        loading: false,
        query: '',
        baseUrl: '',
        loadMoreHandler: null
    };
}

// Actualizar estadísticas
function updateStats() {
    const total = state.pokemon.length;
    const captured = Object.values(state.collection).filter(p => p.captured).length;
    const percentage = total > 0 ? Math.round((captured / total) * 100) : 0;
    
    document.getElementById('total-pokemon').textContent = `Total: ${total}`;
    document.getElementById('captured-pokemon').textContent = `Capturados: ${captured}`;
    document.getElementById('percentage').textContent = `${percentage}%`;
}

