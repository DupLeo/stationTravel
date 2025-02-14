# API de Gestion des Trajets et Véhicules

## Description
Cette API fournit des informations sur les véhicules et les trajets en intégrant des services SOAP et REST. Elle permet de récupérer la liste des véhicules, d'obtenir un itinéraire et d'estimer le temps de trajet entre deux points.

---

## Installation

### Prérequis
- Node.js
- Express
- GraphQL
- Python (pour le service SOAP)
- Spyne
- Requests

### Installation des dépendances
```bash
# Installation des dépendances Node.js
npm install

# Installation des dépendances Python
pip install spyne requests
```

### Configuration du fichier .env

Avant de démarrer l'API, assurez-vous de configurer un fichier `.env` à la racine du projet avec les clés suivantes :

```env
API_KEY=VOTRE_CLE_API_OPENROUTESERVICE
API_KEY_OPENCAGEDATA=VOTRE_CLE_API_OPENCAGEDATA
CLIENT_ID=VOTRE_CLIENT_ID
APP_ID=VOTRE_APP_ID
PORT=3000
```

- **API_KEY** : Clé API pour OpenRouteService (https://api.openrouteservice.org)
- **API_KEY_OPENCAGEDATA** : Clé API pour OpenCageData (https://api.opencagedata.com)
- **CLIENT_ID** : Identifiant client (si applicable)
- **APP_ID** : Identifiant d'application (si applicable)
- **PORT** : Port d'écoute du serveur

### Démarrage des serveurs

#### Lancer le serveur Node.js
```bash
node server.js
```

#### Lancer le serveur SOAP
```bash
python soap_server.py
```

---

## Endpoints de l'API REST

### 1. Obtenir un itinéraire
- **URL:** `/direction`
- **Méthode:** `GET`
- **Paramètres:**
  - `startLat` (float) : Latitude du point de départ
  - `startLon` (float) : Longitude du point de départ
  - `endLat` (float) : Latitude du point d'arrivée
  - `endLon` (float) : Longitude du point d'arrivée
  - `range` (int) : Portée du trajet
- **Réponse:**

L'API `/direction` retourne un itinéraire détaillé, comprenant des informations sur les distances, durées, instructions de navigation, et points de passage. Le format est directement compatible avec OpenRouteService et peut être utilisé pour afficher un trajet sur une carte.

```json
{
    "data": {
        "routes": [
            {
                "summary": {
                    "distance": 123916.9,
                    "duration": 6467.900000000001
                },
                "segments": [
                    {
                        "distance": 35193.8,
                        "duration": 1874.5,
                        "steps": [
                            {
                                "distance": 67.3,
                                "duration": 20.5,
                                "type": 11,
                                "instruction": "Head northwest",
                                "name": "-",
                                "way_points": [
                                    0,
                                    4
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "metadata": {
            "attribution": "openrouteservice.org | OpenStreetMap contributors",
            "service": "routing",
            "timestamp": 1739448332049,
            "query": {
                "coordinates": [
                    [5.9203636, 45.5662672],
                    [5.607645, 45.587038],
                    [5.212795, 45.611787],
                    [4.8714907962786, 45.755291069953],
                    [4.8320114, 45.7578137]
                ],
                "profile": "driving-car",
                "profileName": "driving-car",
                "format": "json"
            },
            "engine": {
                "version": "9.0.0",
                "build_date": "2025-01-27T14:56:02Z",
                "graph_date": "2025-01-28T09:38:16Z"
            }
        }
    }
}
```

### 2. Obtenir la liste des véhicules
- **URL:** `/vehicules`
- **Méthode:** `GET`
- **Réponse:**
```json
{
  "data": [
    {
      "name": "Tesla Model 3",
      "image": "https://image.url",
      "range": 450
    }
  ]
}
```

### 3. Obtenir le temps de trajet
- **URL:** `/time_route`
- **Méthode:** `GET`
- **Paramètres:**
  - `from` (string) : Coordonnées de départ (lat,lon)
  - `to` (string) : Coordonnées d'arrivée (lat,lon)
- **Réponse:**
```json
{
  "data": 3600 // en secondes
}
```

---

## API SOAP

### Endpoint
- **URL:** `http://127.0.0.1:8000`
- **Méthode:** `POST`
- **SOAPAction:** `""`

### Requête SOAP
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spy="spyne.examples.hello">
    <soapenv:Header/>
    <soapenv:Body>
        <spy:get_travel_time>
            <spy:city1>45.8992348,6.1288847</spy:city1>
            <spy:city2>45.7578137,4.8320114</spy:city2>
        </spy:get_travel_time>
    </soapenv:Body>
</soapenv:Envelope>
```

### Réponse SOAP
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <tns:get_travel_timeResult>3600</tns:get_travel_timeResult>
    </soapenv:Body>
</soapenv:Envelope>
```

---

## Structure du Projet
```
/project_root
│── controllers/
│── models/
│── services/
│── routes/
│── soap_server.py
│── server.js
│── README.md
```

---

## Exemple site
https://stationtravel.azurewebsites.net/

