import { createClient, cacheExchange, fetchExchange } from '@urql/core';
import { vehicleListQuery } from '../graphsql/vehiculeQueries.js';

import dotenv from 'dotenv';
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const APP_ID = process.env.APP_ID;


const headers = {
    'x-client-id': CLIENT_ID,
    'x-app-id': APP_ID,
};

const client = createClient({
    url: 'https://api.chargetrip.io/graphql',
    fetchOptions: {
        method: 'POST',
        headers,
    },
    exchanges: [cacheExchange, fetchExchange],
});

export const getVehicleList = async ({ page, size = 10, search = '' }) => {
    try {
        const result = await client.query(vehicleListQuery, { page, size, search }).toPromise();

        const vehicles = result.data.vehicleList.map(vehicle => ({
            name: vehicle.naming.model,
            image: vehicle.media.image.thumbnail_url,
            range: vehicle.range.chargetrip_range?.worst || 'N/A'
        }));

        return vehicles;  
    } catch (error) {
        console.error('Error fetching vehicle list:', error);
        return null;  
    }
};


export const getVehicleDetails = async (vehicleId) => {
    try {
        const result = await client.query(vehicleDetailsQuery, { vehicleId }).toPromise();
        return result.data.vehicle; 
    } catch (error) {
        console.error('Error fetching vehicle list:', error);
        return null; 
    }
};