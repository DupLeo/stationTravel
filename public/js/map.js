import { callSoapService } from './soap.js';

// Définition des icônes personnalisées
const startIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Icône verte pour le départ
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const endIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Icône rouge pour l'arrivée
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

async function suggestSearch(query, suggestionContainerId) {
    if (query.length < 3) return;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();

    let suggestions = data.slice(0, 3).map(place => ({
        name: place.display_name,
        lat: place.lat,
        lon: place.lon
    }));

    // Affichage des suggestions
    const container = document.getElementById(suggestionContainerId);
    container.innerHTML = "";

    suggestions.forEach(suggestion => {
        let div = document.createElement("div");
        div.className = "suggestion";
        div.textContent = suggestion.name;
        div.addEventListener("click", () => {
            document.getElementById(suggestionContainerId.replace("_suggestions", "")).value = suggestion.name;
            container.innerHTML = "";
        });
        container.appendChild(div);
    });
}




// Fonction pour décoder une polyline encodée (OpenRouteService utilise l'encodage Google)
function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
        let shift = 0, result = 0, byte;
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);
        let deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        shift = 0, result = 0;
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);
        let deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += deltaLng;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
}

/**
 * Récupère les coordonnées d'une ville via l'API Nominatim
 */
async function getCityCoordinates(city) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
    const data = await response.json();

    if (data.length === 0) return null;

    return {
        lat: data[0].lat,
        lon: data[0].lon
    };
}

/**
 * Charge et affiche l'itinéraire entre deux points sur la carte
 */
async function loadRoute(map, startCoords, endCoords, dataRange) {
    try {
        const response = await fetch(`http://localhost:3000/api/direction?startLat=${startCoords.lat}&startLon=${startCoords.lon}&endLat=${endCoords.lat}&endLon=${endCoords.lon}&range=${dataRange}`);
        const data = await response.json();

        insertHtmlDistance(data.data.routes[0].summary.distance/1000)

        if (!data.data || !data.data.routes || data.data.routes.length === 0) {
            throw new Error("Données de l'itinéraire manquantes !");
        }

        const encodedPolyline = data.data.routes[0].geometry;

        if (!encodedPolyline || typeof encodedPolyline !== "string") {
            throw new Error("Géométrie encodée invalide !");
        }

        const latLngs = decodePolyline(encodedPolyline);

        if (!Array.isArray(latLngs) || latLngs.length === 0) {
            throw new Error("Échec du décodage de la polyline !");
        }

        // Supprime les anciennes couches avant d'ajouter une nouvelle route
        map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {

                map.removeLayer(layer);
            }
        });

        // Ajouter la nouvelle polyline sur la carte
        L.polyline(latLngs, { color: 'blue' }).addTo(map);

        // Ajouter les marqueurs pour le départ et l'arrivée
        let bornes = data.data.metadata.query.coordinates;
        bornes.forEach(([lat, lng], index) => {
            let options = {}; // Objet d'options pour le marqueur

            if (index === 0) {
                options.icon = startIcon; // Icône verte pour le départ
            } else if (index === bornes.length - 1) {
                options.icon = endIcon; // Icône rouge pour l'arrivée
            }

            L.marker([lng, lat], options).addTo(map)
                .bindPopup(index === 0 ? "Départ" : index === bornes.length - 1 ? "Arrivée" : `Borne num ${index}`);
        });

        // Ajuster la carte pour afficher tout l'itinéraire
        map.fitBounds(latLngs);

        document.getElementById("start").disabled = false;
        document.getElementById("end").disabled = false;
        document.querySelector("input[type='submit']").disabled = false;

    } catch (error) {
        console.error('Erreur lors du chargement de l’itinéraire :', error);
        alert("Erreur lors du chargement de l'itinéraire. Veuillez réessayer.");
    }
}


export function initMap(){

    document.getElementById("start").addEventListener("input", function () {
        suggestSearch(this.value, "start_suggestions");
    });

    document.getElementById("end").addEventListener("input", function () {
        suggestSearch(this.value, "end_suggestions");
    });

    const map = L.map('map').setView([45.764043, 4.835659], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);


    document.getElementById("searchForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const startCity = document.getElementById("start").value;
        const endCity = document.getElementById("end").value;
        const inputField = document.getElementById("vehicle");
        const dataRange = inputField.getAttribute("data-range");


        if (!startCity || !endCity) {
            alert("Veuillez entrer une ville de départ et une ville d'arrivée !");
            return;
        }

        try {
            // Récupération des coordonnées des villes
            const startCoords = await getCityCoordinates(startCity);
            const endCoords = await getCityCoordinates(endCity);

            if (!startCoords || !endCoords) {
                alert("Impossible de trouver les coordonnées des villes sélectionnées.");
                return;
            }
            document.getElementById("start").disabled = true;
            document.getElementById("end").disabled = true;
            document.querySelector("input[type='submit']").disabled = true;

            callSoapService(startCoords, endCoords)
            // Appel de la fonction pour charger l'itinéraire avec les nouvelles coordonnées
            loadRoute(map, startCoords, endCoords, dataRange);
        } catch (error) {
            console.error("Erreur lors de la récupération des coordonnées :", error);
        }
    });
}

function insertHtmlDistance(distance){
    document.getElementById('distance').innerHTML = distance + " km";
}
