
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5001; // You can choose any available port

// Enable CORS for your server
app.use(cors());
// Define a route for proxying requests to the external API
app.get('/api/v1.0/TravelPrices', async (req, res) => {
    try {
        // Make a request to the external API
        const apiResponse = await axios.get('https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices');

        // Send the API response to your front-end
        res.json(apiResponse.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Error fetching data from the external API' });
    }
});

// Start the proxy server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
