import { fetchBornesByDepartement, fetchGeolocationData, fetchDepartementName} from '../services/apiService.js';

export class Coordinate {
    constructor(lat, lon) {
        this.lat = parseFloat(lat);
        this.lon = parseFloat(lon);
    }

    isValid() {
        return !isNaN(this.lat) && !isNaN(this.lon);
    }

    toObject() {
        return { lat: this.lat, lon: this.lon };
    }

    /**
     * Calcule la distance entre deux coordonnées.
     */
    static calculateDistance(coord1, coord2) {
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = coord1.lat * Math.PI / 180;
        const φ2 = coord2.lat * Math.PI / 180;
        const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
        const Δλ = (coord2.lon - coord1.lon) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance en mètres
    }

    /**
     * Trouve la station la plus proche à partir des coordonnées et d'un département.
     */
    async findNearestStation(departement) {
        let bornes = [];
        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            const currentBornes = await fetchBornesByDepartement(departement, offset);
            bornes = bornes.concat(currentBornes);
            hasMoreData = currentBornes.length === 100;
            offset += 100;
        }

        if (bornes.length === 0) {
            return { message: 'Aucune borne trouvée pour ce département.' };
        }

        let nearestStation = null;
        let minDistance = Infinity;

        for (const borne of bornes) {
            const borneCoord = new Coordinate(borne.ylatitude, borne.xlongitude);

            if (borneCoord.lat == null || borneCoord.lon == null) continue;

            const distance = Coordinate.calculateDistance(this, borneCoord);

            if (distance < minDistance) {
                minDistance = distance;
                nearestStation = borneCoord;
                if (distance <= 3) break;
            }
        }

        return nearestStation;
    }

    /**
     * Trouve une borne à partir des coordonnées.
     */
    async foundBorne() {
        const geoData = await fetchGeolocationData(this.lat, this.lon);
        const number_departement = geoData.results[0].components.postcode.slice(0, 2);

        if (!number_departement) {
            throw new Error('Impossible de récupérer le code postal.');
        }

        const departement = await fetchDepartementName(number_departement);
        
        return await this.findNearestStation(departement);
    }
}
