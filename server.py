from spyne import Application, rpc, ServiceBase, Unicode, Float
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
import requests

class HelloWorldService(ServiceBase):
    @rpc(Unicode, Unicode, _returns=Float)
    def get_travel_time(ctx, city1, city2):
        try:
            # Conversion des coordonnées en format API (longitude, latitude)
            coords = [city1.split(','), city2.split(',')]
            coords = [[float(lat), float(lon)] for lat, lon in coords]

            # Appel à l'API Node.js
            params = {"from": f"{coords[0][0]},{coords[0][1]}", "to": f"{coords[1][0]},{coords[1][1]}"}
            response = requests.get("http://127.0.0.1:3000/api/time_route", params=params)
            response_json = response.json()
            return response_json["data"]
        
        except Exception as e:
            print("Erreur SOAP :", str(e))
            return -1.0  # Retourne -1 en cas d'erreur

application = Application(
    [HelloWorldService],
    tns='spyne.examples.hello',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)


# Middleware pour gérer les CORS
class CORSMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        def custom_start_response(status, headers, exc_info=None):
            headers.append(('Access-Control-Allow-Origin', '*'))
            headers.append(('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'))
            headers.append(('Access-Control-Allow-Headers', 'Content-Type, SOAPAction'))
            return start_response(status, headers, exc_info)

        if environ['REQUEST_METHOD'] == 'OPTIONS':
            start_response('200 OK', [
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, SOAPAction'),
            ])
            return [b'']

        return self.app(environ, custom_start_response)

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('127.0.0.1', 8000, CORSMiddleware(WsgiApplication(application)))
    print("Listening to http://127.0.0.1:8000")
    server.serve_forever()

