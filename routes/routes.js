import express from 'express';
const router = express.Router();
import { getVehicleList } from '../controllers/vehiculeController.js';
import { Coordinate } from '../models/coordinate.js';
import { Route } from '../models/route.js';
import { fetchTimeRoute } from '../services/apiService.js';

// Route pour récupérer les données de trajet
router.get('/direction', async (req, res) => {

    const { startLat, startLon, endLat, endLon, range } = req.query;

    if (!startLat || !startLon || !endLat || !endLon) {
        return res.status(400).json({ error: 'Veuillez fournir startLat, startLon, endLat et endLon' });
    }

    const startCoordinate = new Coordinate(startLat, startLon);
    const endCoordinate = new Coordinate(endLat, endLon);
    const route = new Route(range, startCoordinate, endCoordinate);

    try {
        await route.addStations()
        const data = await route.getDisplay()
        console.log(route.getCheckpoints())
        res.json({
            data
        });
    } catch (error) {
        console.error('Erreur lors de la requête à OpenRouteService:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de trajet' });
    }
});

router.get('/vehicules', async (req, res) => {
    try {
        const data = await getVehicleList({ page: 0 })
        res.json({
            data
        });
    } catch (error) {
        console.error('Erreur lors de la requête à :', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
    }
})

router.get('/time_route', async (req, res) => {
    const { from, to } = req.query;
    console.log("req.query", req.query)
    let liste_etape =[]
    liste_etape.push(from);
    liste_etape.push(to)
    try {
        const data = await fetchTimeRoute(liste_etape)
        res.json({
            data                                                                
        });
    } catch (error) {
        console.error('Erreur lors de la requête à :', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
    }
})

export default router;

