
const axios = require('axios');
const database = require('./database'); 

async function fetchDataFromAPI() {
  try {
    const response = await axios.get('https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices');
    return response.data; // Assuming the API returns an array of data
  } catch (error) {
    console.error('Error fetching data from the API:', error);
    throw error;
  }
}// Define a JavaScript object to store route data
// Import your database instance

async function insertDataIntoDatabase(data) {
  try {
    // Loop through the data and insert each item into the database
    for (const item of data) {
      await database('routes').insert({
        source: item.source,
        destination: item.destination,
        distance: item.distance,
      });
    }
    console.log('Data inserted into the database successfully');
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    throw error;
  }
}
async function fetchRoutesFromDatabase(sourceName, destinationName) {
    try {
        // Perform your database query to fetch routes here
        // For example:
        const routes = await yourDatabaseQuery(sourceName, destinationName);

        // Return the routes as a result
        return routes;
    } catch (error) {
        // Handle any database errors
        throw new Error('Error fetching routes from the database: ' + error.message);
    }
}

// Define a function to fetch routes based on source and destination names



// Export the fetchRoutesFromDatabase function
module.exports = {
    fetchDataFromAPI, insertDataIntoDatabase, fetchRoutesFromDatabase
};