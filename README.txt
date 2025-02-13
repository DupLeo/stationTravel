# API de gestion des trajets et des véhicules

## Description
Cette API permet de récupérer des informations sur les trajets et les véhicules disponibles. Elle fournit trois endpoints principaux :
- Calcul de l'itinéraire et récupération des stations sur le trajet
- Liste des véhicules disponibles
- Calcul du temps de trajet entre deux points

## Installation

### Prérequis
- Node.js
- npm ou yarn

### Étapes
1. Cloner le dépôt :
   ```sh
   git clone <URL_DU_REPO>
   cd <NOM_DU_PROJET>
   ```
2. Installer les dépendances :
   ```sh
   npm install
   ```
3. Démarrer le serveur :
   ```sh
   npm start
   ```

## Endpoints

### 1. Récupérer un itinéraire avec les stations
**URL:** `/direction`

**Méthode:** `GET`

**Paramètres requis:**
- `startLat` : Latitude du point de départ
- `startLon` : Longitude du point de départ
- `endLat` : Latitude du point d'arrivée
- `endLon` : Longitude du point d'arrivée
- `range` (optionnel) : Distance maximale d'autonomie pour rechercher des stations

**Exemple de requête:**
```sh
curl "http://localhost:3000/direction?startLat=45.75&startLon=4.85&endLat=45.76&endLon=4.86"
```

**Réponse:**
```json
{
    "data": {
        "route": [...],
        "stations": [...]
    }
}
```

### 2. Récupérer la liste des véhicules
**URL:** `/vehicules`

**Méthode:** `GET`

**Exemple de requête:**
```sh
curl "http://localhost:3000/vehicules"
```

**Réponse:**
```json
{
    "data": [
        { "id": 1, "type": "voiture", "disponible": true },
        { "id": 2, "type": "vélo", "disponible": false }
    ]
}
```

### 3. Calculer le temps de trajet entre deux points
**URL:** `/time_route`

**Méthode:** `GET`

**Paramètres requis:**
- `from` : Coordonnées du point de départ
- `to` : Coordonnées du point d'arrivée

**Exemple de requête:**
```sh
curl "http://localhost:3000/time_route?from=45.75,4.85&to=45.76,4.86"
```

**Réponse:**
```json
{
    "data": 4322.6  // Temps en secondes
}
```

## Notes
- Les requêtes doivent être correctement formatées avec tous les paramètres requis.
- Assurez-vous que le serveur est en cours d'exécution avant d'envoyer des requêtes.
- Le temps de trajet est retourné en secondes. Vous pouvez le convertir en heures et minutes dans votre application.

## Auteur
Léo

## Licence
Ce projet est sous licence MIT.

