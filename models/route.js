import { Coordinate } from './coordinate.js';
import { fetchDirectionsWithMultipleSteps } from '../services/apiService.js';

export class Route {
    constructor(rangeMotor, startCoordinate, endCoordinate) {
        this.checkpoints = []; // point où un trajet s'interrompt temporairement (exemple : une station électrique).
        this.routeSteps = [startCoordinate, endCoordinate] // point où il faut changer de direction
        this.rangeMotor = rangeMotor * 1000;
        this.startCoordinate = startCoordinate
        this.endCoordinate = endCoordinate
    }

    async updateSteps() {
        const liste_etape = this.getRouteSteps()
        const data_trajet = await fetchDirectionsWithMultipleSteps(liste_etape);
        const list_step = decodePolyline(data_trajet.routes[0].geometry)
        this.routeSteps = list_step.map(step => new Coordinate(step[0], step[1]));

    }

    async addStations() {
        await this.updateSteps();
        await this.foundAllBorne()
        this.addStartAndEnd(this.startCoordinate, this.endCoordinate)
    }

    addCheckpoint(coordinate) {
        if (coordinate instanceof Coordinate && coordinate.isValid()) {
            this.checkpoints.push(coordinate);
        } else {
            throw new Error("Invalid coordinate object");
        }
    }

    addStartAndEnd(startCoord, endCoord) {
        if (!(startCoord instanceof Coordinate) || !(endCoord instanceof Coordinate)) {
            throw new Error("Both start and end must be instances of Coordinate");
        }

        this.checkpoints.unshift(startCoord);
        this.checkpoints.push(endCoord);
    }

    getRouteSteps() {
        return this.routeSteps.map(coord => coord.toObject());
    }

    getCheckpoints() {
        return this.checkpoints.map(coord => coord.toObject());
    }

    async foundAllBorne() {
        if (!this.routeSteps || this.routeSteps.length === 0) {
            console.error("Erreur : this.routeSteps est vide ou non défini.");
            return this;
        }

        let autonomyRemaining = this.rangeMotor;
        let lastStep = this.startCoordinate;
        let stepSize = Math.max(1, Math.floor(this.routeSteps.length / 50));

        for (let i = 1; i < this.routeSteps.length; i += stepSize) {
            const currentStep = this.routeSteps[i];
            const distance = calculateDistance(lastStep, currentStep);
            autonomyRemaining -= distance;

            if (autonomyRemaining <= 0) {
                let borneCoord = await currentStep.foundBorne();
                if (borneCoord) {
                    this.addCheckpoint(borneCoord);
                    autonomyRemaining = this.rangeMotor;
                }
            }
            lastStep = currentStep;
        }
        return this;
    }


    /** Revoie le trajet pour la partie front */
    async getDisplay() {
        const liste_etape = this.getCheckpoints()
        const data_trajet = await fetchDirectionsWithMultipleSteps(liste_etape);
        const list_step = decodePolyline(data_trajet.routes[0].geometry)
        this.routeSteps = list_step.map(step => new Coordinate(step[0], step[1]));
        return data_trajet;
    }
}

function calculateDistance(coord1, coord2) {
    const [lon1, lat1] = [coord1.lon, coord1.lat];
    const [lon2, lat2] = [coord2.lon, coord2.lat];

    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

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
