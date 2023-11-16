// Import the necessary modules
const express = require('express'); // Import the Express web framework
const app = express(); // Create an Express application
const path = require('path'); // Import the 'path' module to work with file paths
const apiRoutes = require('./routes/api'); // Import API routes from './routes/api'
const API = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices'; // Define an API URL

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), { type: 'module'}));
// This middleware serves static files (e.g., HTML, CSS, JavaScript) from the 'public' directory
// __dirname is a global variable that represents the directory where this script resides

// Use API routes
app.use('/api', apiRoutes);
// Mount the API routes defined in the 'apiRoutes' module under the '/api' URL path
// For example, if you have a route defined in 'apiRoutes' at '/getTravelPrices', it will be accessible at '/api/getTravelPrices'
app.get('/api/fetchRoutes', async (req, res) => {
    try {
        const sourceName = req.query.sourceName;
        const destinationName = req.query.destinationName;
        // Your code for fetching routes from the database
        const routes = await fetchRoutesFromDatabase(sourceName, destinationName); // You should define this function
        res.json({ routes });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// In your server.js or app.js
app.get('/api/findRoutes', async (req, res) => {
    try {
        const sourceName = req.query.sourceName;
        const destinationName = req.query.destinationName;
        const routes = await fetchRoutesFromDatabase(sourceName, destinationName); // Replace with your database query

        // Structure the response object
        const response = {
            routes: routes.map(route => route.map(planet => planet.name))
        };

        // Send the response as JSON
        res.json(response);
    } catch (error) {
        console.error('Error in /api/findRoutes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
// Define the port on which the server will listen. It uses the environment variable 'PORT' if available, or defaults to 3000.

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Start the Express server, and when it's up and running, this callback function will log a message to the console indicating the server's address and port.
