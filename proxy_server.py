#!/usr/bin/env python3
"""
Servidor proxy simple para evitar problemas de CORS con la API de Pokémon TCG
Ejecuta este script y luego usa http://localhost:8080 en lugar de la API directa
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import json

class CORSProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Manejar preflight requests de CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Api-Key, Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Proxificar solicitudes GET a la API de Pokémon TCG"""
        try:
            # Parsear la query string
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            
            # Construir URL de la API
            api_url = 'https://api.pokemontcg.io/v2/cards'
            if 'q' in query_params:
                api_url += f'?q={query_params["q"][0]}'
            
            # Crear solicitud a la API
            req = urllib.request.Request(api_url)
            
            # Pasar el header X-Api-Key si está presente
            if 'X-Api-Key' in self.headers:
                req.add_header('X-Api-Key', self.headers['X-Api-Key'])
            
            # Realizar solicitud
            with urllib.request.urlopen(req) as response:
                data = response.read()
                status_code = response.getcode()
                
                # Enviar respuesta con headers CORS
                self.send_response(status_code)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': str(e)}).encode()
            self.wfile.write(error_response)
    
    def log_message(self, format, *args):
        """Suprimir logs del servidor"""
        pass

def run(server_class=HTTPServer, handler_class=CORSProxyHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'🚀 Servidor proxy CORS ejecutándose en http://localhost:{port}')
    print(f'📡 Proxificando solicitudes a https://api.pokemontcg.io/v2/cards')
    print('Presiona Ctrl+C para detener el servidor')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 Deteniendo servidor...')
        httpd.shutdown()

if __name__ == '__main__':
    run()

