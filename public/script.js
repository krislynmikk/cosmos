import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

async function fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown) {
    const sourceName = sourcePlanetDropdown.value;
    const destinationName = destinationPlanetDropdown.value;

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

        const { legs } = await response.json();
        const routes = findRoutes(legs, sourceName, destinationName);
        const shortestRouteLength = Math.min(...routes.map((route) => route.length));
        const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

        displayRoutes(shortestRoutes);

        const connectedFlights = findConnectedFlights(legs, shortestRoutes);
        const storedSequences = logAndStoreFlightSequences(connectedFlights, legs);
        performComparisons(storedSequences);
    } catch (error) {
        handleFetchError(error);
    }
}

function displayRoutes(routes) {
    const routeResults = document.getElementById('route-results');
    routeResults.innerHTML = '';

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

let previousFlightSequences = [];
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
    previousFlightSequences.push(storedFlightSequences.flat());
    // ---------------------- //

console.log("storedFlightSequences", storedFlightSequences);
console.log("storedFlightSequences[0]", storedFlightSequences[0]);
console.log("storedFlightSequences[1]", storedFlightSequences[1]);
console.log("storedFlightSequences[0][0]", storedFlightSequences[0][0]);
console.log("storedFlightSequences[0][1]", storedFlightSequences[0][1]);
console.log("storedFlightSequences[0][2]", storedFlightSequences[0][2]);
console.log("storedFlightSequences[1][0]", storedFlightSequences[1][0]);
console.log("storedFlightSequences[1][1]", storedFlightSequences[1][1]);
console.log("storedFlightSequences[1][2]", storedFlightSequences[1][2]);

    const flights1 = storedFlightSequences[0][0].providers;
    flights1.forEach((time, index) => {
        console.log(`Nr. ${index + 1}:`, time.providerName," ", time.flightStart, " ", time.flightEnd);

    })
    console.log("stored", flights1) // Store all sequences separately
    const flights2 = storedFlightSequences[0][1].providers;
    flights2.forEach((time, index) => {
        console.log(`Nr. ${index + 1}:`, time.providerName," ", time.flightStart, " ", time.flightEnd);

    })
    console.log("stored", flights2) // Store all sequences separately
    const flights3 = storedFlightSequences[0][2].providers;
    flights3.forEach((time, index) => {
        console.log(`Nr. ${index + 1}:`, time.providerName," ", time.flightStart, " ", time.flightEnd);

    })
    console.log("stored", flights3) // Store all sequences separately

    // ---------------------- //
    return storedFlightSequences;
}

function performComparisons() {
    // Access the stored flight sequences from previous executions
    previousFlightSequences.forEach((flightSequence, index) => {
        console.log(`Comparisons for sequence ${index + 1}:`);
        // Perform comparisons or operations with flightSequence array here
        // For example, compare flight details or prices between sequences
        // Iterate through the flights and perform the necessary logic
        flightSequence.forEach((flight) => {
            // Example: Log flight details for each sequence
            console.log(`From ${flight.from} to ${flight.to}`);
            flight.providers.forEach((provider) => {
              /*  console.log(`  - Provider: ${provider.providerName}`);
                console.log(`  - Price: ${provider.price}`);
                console.log(`  - Flight Start: ${provider.flightStart}`);
                console.log(`  - Flight End: ${provider.flightEnd}`); */
                // Perform further comparisons or operations here
            });
        });
    });
}

function handleFetchError(error) {
    console.error('Error fetching and displaying routes:', error);
}

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

    findRoutesButton.addEventListener('click', () => {
        fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown);
    });
});
