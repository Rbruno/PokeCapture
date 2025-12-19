// Vercel Serverless Function para hacer proxy de la API de Pokémon TCG
// Este archivo debe estar en la carpeta /api para que Vercel lo reconozca

// Vercel soporta ambos formatos, pero module.exports es más compatible
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
        // Obtener parámetros de la query
        const { q, page, pageSize } = req.query;
        
        if (!q) {
            res.status(400).json({ error: 'Missing required parameter: q' });
            return;
        }
        
        // Construir URL de la API de Pokémon TCG
        const apiKey = '3ca5dcd8-ef83-472a-92a8-e9d0155cdeb2';
        let apiUrl = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}`;
        
        if (page) {
            apiUrl += `&page=${page}`;
        }
        if (pageSize) {
            apiUrl += `&pageSize=${pageSize}`;
        }
        
        // Hacer solicitud a la API con la API key
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
        
        // Devolver los datos con CORS habilitado
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from API',
            message: error.message 
        });
    }
};

