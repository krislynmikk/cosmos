const express = require('express');
const router = express.Router();
const main = require('./main'); // Adjust the path if needed
const functions = require('./functions'); // Adjust the path if needed
const axios = require('axios'); // Import Axios for making API requests

const API_BASE_URL = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices';

// Define routes here
router.get('/findRoutes', async (req, res) => {
    try {
        // Extract parameters from req.query or req.body if needed
        const sourceName = req.query.sourceName;
        const destinationName = req.query.destinationName;        
        // Make a request to the external API to fetch travel data
        const apiResponse = await axios.get(API_BASE_URL);
        const legs = apiResponse.data.legs;
        // Perform your logic using functions from functions.js
        const result = functions.findRoutes(sourceName, destinationName, legs);
        console.log('Routes found:', result);
        // Send the result as a JSON response
        res.json({ routes: result });
    } catch (error) {
        // Handle errors
        console.error('Error in /findRoutes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New route for fetching travel data from an external API
router.get('/fetchTravelData', async (req, res) => {
    try {
        // Make a request to the external API
        const apiResponse = await axios.get(API_BASE_URL);

        // Extract relevant data from the API response
        const legs = apiResponse.data.legs;

        // You can perform additional processing here if needed

        // Send the extracted data as a JSON response
        res.json({ legs });
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Error fetching travel data from the external API' });
    }
});

router.get('/fetchPlanetsFromAPI', async (req, res) => {
    try {
        // Make a request to the external API to fetch travel data
        const apiResponse = await axios.get(API_BASE_URL);

        // Extract relevant data from the API response
        const legs = apiResponse.data.legs;

        // Extract unique source and destination planet names from the legs
        const uniquePlanetNames = [...new Set(legs.flatMap(leg => [leg.routeInfo.from.name]))];
        const uniquePlanetNames2 = [...new Set(legs.flatMap(leg => [leg.routeInfo.to.name]))];

        // Send the extracted planet names as JSON response
        res.json({ planets: uniquePlanetNames, uniquePlanetNames2 });
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Error fetching planets from the external API' });
    }
});
// In your server's API routes (api.js), add a new route for fetching routes based on source and destination
router.get('/fetchRoutes', async (req, res) => {
    try {
        const sourceName = req.query.sourceName;
        const destinationName = req.query.destinationName;
        // Implement the logic to fetch routes based on source and destination planets
        const routes = await fetchRoutesFromDatabase(sourceName, destinationName); // Replace with your database query

        // Return the routes as JSON
        res.json({ routes });
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Define other routes as needed for your application

module.exports = router;
