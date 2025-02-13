import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY;
const API_KEY_OPENCAGEDATA = process.env.API_KEY_OPENCAGEDATA;

/**
 * Récupère les bornes d'un département donné.
 */
export async function fetchBornesByDepartement(departement, offset = 0) {
    try {
        const url = `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/records?limit=100&offset=${offset}&refine=departement:${departement}`;
        const response = await axios.get(url);
        return response.data.results;
    } catch (error) {
        console.error('Erreur lors de la récupération des bornes:', error.message);
        throw new Error('API indisponible');
    }
}

/**
 * Récupère les informations de géolocalisation d'une coordonnée.
 */
export async function fetchGeolocationData(lat, lon) {
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${API_KEY_OPENCAGEDATA}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Erreur avec l'API opencagedata:", error.message);
        throw new Error('API opencagedata indisponible');
    }
}

/**
 * Récupère le nom du département en fonction du code.
 */
export async function fetchDepartementName(departementCode) {
    try {
        const url = `https://geo.api.gouv.fr/departements/${departementCode}?fields=nom`;
        const response = await axios.get(url);
        return response.data.nom;
    } catch (error) {
        console.error("Erreur avec l'API geo.api.gouv.fr:", error.message);
        throw new Error('API geo.api.gouv.fr indisponible');
    }
}

/**
 * Récupère l'itinéraire entre deux coordonnées.
 */
export async function fetchRoute(startCoordinate, endCoordinate) {
    try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startCoordinate.lon},${startCoordinate.lat}&end=${endCoordinate.lon},${endCoordinate.lat}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du trajet :", error.message);
        return null;
    }
}

export async function fetchDirectionsWithMultipleSteps(liste_etape) {
    const url = "https://api.openrouteservice.org/v2/directions/driving-car";
    const formattedCoordinates = liste_etape.map(etape => [etape.lon, etape.lat]);
    const body = {
        coordinates: formattedCoordinates,
    };

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error while fetching directions:', error);
        throw error;
    }
}


export async function fetchTimeRoute(liste_etape) {
    const url = "https://api.openrouteservice.org/v2/directions/driving-car";
    
    const formattedCoordinates = liste_etape.map(etape => {
        const [lat, lon] = etape.split(',').map(coord => parseFloat(coord.trim()));
        return [lon, lat];
    });

    const body = {
        coordinates: formattedCoordinates,
    };

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': API_KEY,
            },
        });

        console.log(response.data.routes[0].summary.duration)
        return response.data.routes[0].summary.duration;
    } catch (error) {
        console.error('Error while fetching directions:', error);
        throw error;
    }
}
