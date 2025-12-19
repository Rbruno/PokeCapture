// Vercel Serverless Function para hacer proxy de APIs de Pokémon TCG
// Soporta tanto la API oficial de Pokémon TCG como TCGdx

module.exports = async (req, res) => {
    // Configurar CORS para permitir solicitudes desde cualquier origen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Solo permitir GET
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { q, page, pageSize, api, lang, name } = req.query;
        
        // Determinar qué API usar
        const useTCGdx = api === 'tcgdx' || req.url.includes('tcgdx');
        
        if (useTCGdx) {
            // Proxy para TCGdx
            const tcgdxLang = lang || 'es';
            let apiUrl = `https://tcgdx.dev/v2/${tcgdxLang}/cards`;
            
            // Si hay un nombre, obtener todas las cartas (la API se filtrará en el cliente)
            // TCGdx no tiene parámetros de búsqueda en la URL según la documentación
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('TCGdx API Error:', response.status, errorText);
                res.status(response.status).json({ 
                    error: `TCGdx API error: ${response.status}`,
                    details: errorText
                });
                return;
            }
            
            const data = await response.json();
            res.status(200).json(data);
            
        } else {
            // Proxy para la API oficial de Pokémon TCG (código original)
            if (!q) {
                res.status(400).json({ error: 'Missing required parameter: q' });
                return;
            }
            
            const apiKey = '3ca5dcd8-ef83-472a-92a8-e9d0155cdeb2';
            let apiUrl = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}`;
            
            if (page) {
                apiUrl += `&page=${page}`;
            }
            if (pageSize) {
                apiUrl += `&pageSize=${pageSize}`;
            }
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Api-Key': apiKey
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                res.status(response.status).json({ 
                    error: `API error: ${response.status}`,
                    details: errorText
                });
                return;
            }
            
            const data = await response.json();
            res.status(200).json(data);
        }
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from API',
            message: error.message
        });
    }
};

