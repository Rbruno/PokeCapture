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
        query: '',
        baseUrl: ''
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadCollection();
    loadPokemon();
    setupEventListeners();
});

// Cargar colección desde localStorage
function loadCollection() {
    const saved = localStorage.getItem('pokemonCollection');
    if (saved) {
        state.collection = JSON.parse(saved);
    }
}

// Guardar colección en localStorage
function saveCollection() {
    localStorage.setItem('pokemonCollection', JSON.stringify(state.collection));
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('filter-captured').addEventListener('click', () => setFilterMode('captured'));
    document.getElementById('filter-all').addEventListener('click', () => setFilterMode('all'));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('cards-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
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
    
    // Resetear paginación
    state.cardsPagination = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        hasMore: true,
        loading: false,
        query: '',
        baseUrl: ''
    };
    
    // Usar la API oficial de Pokémon TCG
    const API_KEY = '3ca5dcd8-ef83-472a-92a8-e9d0155cdeb2';
    const pokemonNameForSearch = pokemon.name.toLowerCase();
    const baseUrl = 'https://api.pokemontcg.io/v2/cards';
    const query = encodeURIComponent(`name:${pokemonNameForSearch}`);
    
    // Guardar información de paginación
    state.cardsPagination.query = query;
    state.cardsPagination.baseUrl = baseUrl;
    state.cardsPagination.apiKey = API_KEY;
    
    // Cargar primera página
    await loadCardsPage(pokemon, 1, query, baseUrl, API_KEY, true);
    
    // Configurar scroll infinito
    setupInfiniteScroll(pokemon, query, baseUrl, API_KEY);
}

// Cargar una página de cartas con reintentos
async function loadCardsPage(pokemon, page, query, baseUrl, apiKey, isFirstLoad = false, retryCount = 0) {
    if (state.cardsPagination.loading || !state.cardsPagination.hasMore) {
        return;
    }
    
    state.cardsPagination.loading = true;
    const loadingMore = document.getElementById('loading-more');
    const modalLoading = document.getElementById('modal-loading');
    const cardsGrid = document.getElementById('cards-grid');
    
    if (isFirstLoad) {
        modalLoading.style.display = 'block';
    } else {
        loadingMore.style.display = 'block';
    }
    
    try {
        // Detectar si estamos en localhost o en producción (GitHub Pages/Vercel)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        let url;
        
        if (isLocalhost) {
            // Usar la API directamente desde localhost (con extensión CORS)
            const queryParams = `q=${query}&page=${page}&pageSize=${state.cardsPagination.pageSize}`;
            url = `${baseUrl}?${queryParams}`;
        } else {
            // Usar proxy de Vercel desde GitHub Pages o Vercel
            const vercelProxy = 'https://poke-capture.vercel.app/api/proxy.js';
            url = `${vercelProxy}?q=${query}&page=${page}&pageSize=${state.cardsPagination.pageSize}`;
        }
        
        const headers = {
            'Accept': 'application/json'
        };
        
        // Solo agregar API key si estamos en localhost (el proxy la maneja internamente)
        if (isLocalhost) {
            headers['X-Api-Key'] = apiKey;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        });
        
        // Si es 504 y es el primer intento, reintentar
        if (response.status === 504 && retryCount < 2) {
            console.log(`Error 504, reintentando... (intento ${retryCount + 1}/2)`);
            state.cardsPagination.loading = false;
            modalLoading.style.display = 'none';
            loadingMore.style.display = 'none';
            
            // Esperar un poco antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return loadCardsPage(pokemon, page, query, baseUrl, apiKey, isFirstLoad, retryCount + 1);
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        
        const data = await response.json();
        let fetchedCards = [];
        
        if (data.data && Array.isArray(data.data)) {
            fetchedCards = data.data;
            // Actualizar información de paginación
            state.cardsPagination.totalCount = data.totalCount || 0;
            state.cardsPagination.hasMore = fetchedCards.length === state.cardsPagination.pageSize && 
                                            (data.page * data.pageSize < data.totalCount);
        }
        
        // La API oficial de Pokémon TCG ya devuelve las cartas paginadas
        // No necesitamos paginación manual, la API lo hace por nosotros
        // Actualizar información de paginación basada en la respuesta de la API
        if (data.totalCount) {
            state.cardsPagination.totalCount = data.totalCount;
            const currentPage = data.page || page;
            const pageSize = data.pageSize || state.cardsPagination.pageSize;
            state.cardsPagination.hasMore = (currentPage * pageSize) < data.totalCount;
        } else {
            // Si no hay información de paginación, asumir que hay más si recibimos el pageSize completo
            state.cardsPagination.hasMore = fetchedCards.length === state.cardsPagination.pageSize;
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
        
        // Generar ID único para cada carta
        const cardId = card.id || 
                      card.localId || 
                      card.tcgplayerId || 
                      `${pokemon.id}-${card.set?.id || 'unknown'}-${card.number || index}-${card.name}`;
        
        cardElement.dataset.cardId = cardId;
        
        const isSelected = state.collection[pokemon.id]?.selectedCard === cardId;
        
        if (isSelected) {
            cardElement.classList.add('selected');
        }
        
        // TCGdx estructura de imágenes
        let imageUrl = card.image || 
                      card.imageUrl ||
                      card.images?.large || 
                      card.images?.small ||
                      card.images?.normal ||
                      (card.localId && `https://assets.tcgdx.dev/images/cards/${card.localId}.png`) ||
                      'https://via.placeholder.com/200?text=Carta';
        
        const cardName = card.name || 'Carta sin nombre';
        // TCGdx: set puede ser objeto o string
        const setName = (typeof card.set === 'string' ? card.set : card.set?.name) || 
                      card.setName || 
                      'Sin set';
        
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

// Configurar scroll infinito
function setupInfiniteScroll(pokemon, query, baseUrl, apiKey) {
    const modalContent = document.querySelector('.modal-content');
    let scrollTimeout;
    
    // Guardar referencia para poder removerla después
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollTop = modalContent.scrollTop;
            const scrollHeight = modalContent.scrollHeight;
            const clientHeight = modalContent.clientHeight;
            
            // Cargar más cuando estemos cerca del final (100px antes)
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                if (state.cardsPagination.hasMore && !state.cardsPagination.loading) {
                    const nextPage = state.cardsPagination.currentPage + 1;
                    loadCardsPage(pokemon, nextPage, query, baseUrl, apiKey, false);
                }
            }
        }, 100);
    };
    
    // Remover listener anterior si existe (usando una función anónima que podemos referenciar)
    modalContent.removeEventListener('scroll', state.cardsPagination.scrollHandler);
    
    // Guardar referencia para poder removerla después
    state.cardsPagination.scrollHandler = handleScroll;
    
    modalContent.addEventListener('scroll', handleScroll);
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
    state.collection[pokemon.id].cardImage = card.image || card.images?.small || card.images?.large;
    
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
    const modalContent = document.querySelector('.modal-content');
    
    // Limpiar listener de scroll si existe
    if (state.cardsPagination.scrollHandler) {
        modalContent.removeEventListener('scroll', state.cardsPagination.scrollHandler);
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
        scrollHandler: null
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

