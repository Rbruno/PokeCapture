/**
 * Servidor proxy simple para evitar problemas de CORS con la API de Pokémon TCG
 * Ejecuta: node proxy_server.js
 * Luego usa http://localhost:8080 en lugar de la API directa
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8080;

const server = http.createServer((req, res) => {
    // Manejar CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Api-Key, Content-Type',
            'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
    }

    // Solo manejar GET requests
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        // Parsear query parameters
        const parsedUrl = url.parse(req.url, true);
        const query = parsedUrl.query.q || '';
        
        // Construir URL de la API
        const apiUrl = `https://api.pokemontcg.io/v2/cards?q=${query}`;
        
        // Obtener API key del header
        const apiKey = req.headers['x-api-key'] || '';
        
        console.log(`📡 Proxificando: ${apiUrl}`);
        
        // Realizar solicitud a la API
        const options = {
            headers: {
                'X-Api-Key': apiKey,
                'Accept': 'application/json'
            }
        };
        
        https.get(apiUrl, options, (apiRes) => {
            let data = '';
            
            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            
            apiRes.on('end', () => {
                // Enviar respuesta con headers CORS
                res.writeHead(apiRes.statusCode, {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                });
                res.end(data);
            });
        }).on('error', (error) => {
            console.error('❌ Error:', error.message);
            res.writeHead(500, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ error: error.message }));
        });
        
    } catch (error) {
        res.writeHead(500, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ error: error.message }));
    }
});

server.listen(PORT, () => {
    console.log('🚀 Servidor proxy CORS ejecutándose en http://localhost:' + PORT);
    console.log('📡 Proxificando solicitudes a https://api.pokemontcg.io/v2/cards');
    console.log('Presiona Ctrl+C para detener el servidor');
});

