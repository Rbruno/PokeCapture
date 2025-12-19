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
            // Según la documentación: https://tcgdx.dev/
            // La API REST está en: https://api.tcgdx.dev/v2/{lang}/cards
            // Pero si ese dominio no funciona, probar: https://tcgdx.dev/v2/{lang}/cards
            const tcgdxLang = lang || 'es';
            
            // Probar diferentes URLs base
            const urlsToTry = [
                `https://api.tcgdx.dev/v2/${tcgdxLang}/cards`,
                `https://tcgdx.dev/v2/${tcgdxLang}/cards`,
                `https://tcgdx.dev/api/v2/${tcgdxLang}/cards`
            ];
            
            let lastError = null;
            let success = false;
            
            for (const apiUrl of urlsToTry) {
                try {
                    console.log(`Intentando TCGdx URL: ${apiUrl}`);
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'PokeCapture/1.0'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ TCGdx conectado exitosamente: ${apiUrl}`);
                        res.status(200).json(data);
                        success = true;
                        break;
                    } else {
                        console.warn(`TCGdx URL ${apiUrl} retornó: ${response.status}`);
                        lastError = new Error(`HTTP ${response.status}`);
                    }
                } catch (error) {
                    console.warn(`Error con TCGdx URL ${apiUrl}:`, error.message);
                    lastError = error;
                    continue;
                }
            }
            
            if (!success) {
                console.error('Todas las URLs de TCGdx fallaron');
                res.status(500).json({ 
                    error: 'No se pudo conectar con la API de TCGdx',
                    message: lastError ? lastError.message : 'Todas las URLs fallaron',
                    triedUrls: urlsToTry
                });
            }
            
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

