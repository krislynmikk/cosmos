import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

// Function to fetch and display routes
async function fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown) {
    const sourceName = sourcePlanetDropdown.value;
    const destinationName = destinationPlanetDropdown.value;

    // Validate source and destination planets
    if (sourceName === destinationName) {
        alert('Source and destination planets cannot be the same.');
        return;
    }

    const outputDiv = document.getElementById('route-results');
    outputDiv.innerHTML = 'Fetching and displaying routes...';

    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error('Error fetching routes');
        }

        const data = await response.json();
        const legs = data.legs;
        const routes = findRoutes(legs, sourceName, destinationName);
        const shortestRouteLength = Math.min(...routes.map((route) => route.length));
        const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

        // Display the found routes
        displayRoutes(shortestRoutes);

        // Calculate connected flights
        const connectedFlights = findConnectedFlights(legs, shortestRoutes);

        // Log and store flight sequences
        logAndStoreFlightSequences(connectedFlights, legs);
    } catch (error) {
        handleFetchError(error);
    }
}

// Function to display routes
function displayRoutes(routes) {
    const routeResults = document.getElementById('route-results');
    routeResults.innerHTML = ''; // Clear previous results

    if (routes.length === 0) {
        routeResults.textContent = 'No routes found.';
        return;
    }

    routes.forEach((route, index) => {
        const routeElement = document.createElement('div');
        routeElement.classList.add('route');

        const routeInfo = document.createElement('p');
        routeInfo.textContent = `Route ${index + 1}: ${route.join(' → ')}`;

        routeElement.appendChild(routeInfo);
        routeResults.appendChild(routeElement);
    });
}

// Function to find connected flights
function findConnectedFlights(legs, routes) {
    const connectedFlights = [];
    let shortestRouteLength = Infinity;
    routes.forEach((route) => {
        if (route.length < shortestRouteLength) {
            shortestRouteLength = route.length;
        }
    });
    const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

    shortestRoutes.forEach((route, routeIndex) => {
        const legFlights = [];

        for (let i = 0; i < route.length - 1; i++) {
            const sourcePlanet = route[i];
            const destinationPlanet = route[i + 1];

            const validFlights = legs.filter((leg) =>
                leg.routeInfo.from.name === sourcePlanet &&
                leg.routeInfo.to.name === destinationPlanet
            );

            // Add the valid flights for this leg to the legFlights array
            legFlights.push(validFlights);
        }

        // Add the legFlights array to the connectedFlights array
        connectedFlights.push(legFlights);
    });

    return connectedFlights;
}

let previousFlightSequences = []; // Declare a global array to store previous flight sequences
console.log(previousFlightSequences);

function logAndStoreFlightSequences(connectedFlights, legs) {
    const storedFlightSequences = []; // Initialize an array to store flight sequences

    connectedFlights.forEach((routeFlights, routeIndex) => {
        console.log(`Route ${routeIndex + 1} flights sequence:`);

        const routeDetails = [];
        routeFlights.forEach((legFlights) => {
            const flightSequence = [];
            legFlights.forEach((flight) => {
                const flightDetails = {
                    from: flight.routeInfo.from.name,
                    to: flight.routeInfo.to.name,
                    providers: [], // Initialize an array to store flight provider details
                };

                flight.providers.forEach((provider) => {
                    flightDetails.providers.push({
                        providerId: provider.id,
                        providerName: provider.company.name,
                        price: provider.price,
                        flightStart: provider.flightStart,
                        flightEnd: provider.flightEnd,
                    });
                });

                flightSequence.push(flightDetails);
            });

            routeDetails.push(flightSequence[0]); // Store the flight sequence for each leg
        });

        storedFlightSequences.push(routeDetails); // Store the flight sequences for each route
    });

    // Store the current flight sequence in the global array for next use
    previousFlightSequences.push(storedFlightSequences.flat()); // Store all sequences separately
    return storedFlightSequences;
}


// Function to handle fetch errors
function handleFetchError(error) {
    console.error('Error fetching and displaying routes:', error);
}

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

    // Event listener for finding and displaying routes
    findRoutesButton.addEventListener('click', () => {
        fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown);
    });
});
