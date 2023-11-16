import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

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
    async function fetchAndDisplayRoutes() {
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

            const data = await response.json();
            const legs = data.legs;
            const routes = findRoutes(legs, sourceName, destinationName);
            const shortestRouteLength = Math.min(...routes.map((route) => route.length));
            const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

            // Display the found routes
            displayRoutes(shortestRoutes);

            // Now, calculate connected flights
            const connectedFlights = findConnectedFlights(legs, shortestRoutes);

// ...
connectedFlights.forEach((stepFlights, routeIndex) => {
    const routeDetails = [];

    for (let step = 0; step < stepFlights.length; step++) {
        const currentStep = stepFlights[step];
        const route = [];

        for (const currentFlight of currentStep) {
            route.push({
                from: currentStep[0].routeInfo.from.name,
                to: currentStep[0].routeInfo.to.name,
                providers: currentStep[0].providers,
            });
        }

        routeDetails.push(route);
    }

    if (routeDetails.length > 0) {
        console.log(`Route ${routeIndex + 1}:`);
        routeDetails.forEach((route, stepIndex) => {
            console.log(`Step ${stepIndex + 1} flights:`);
            route.forEach((flight, legIndex) => {
                console.log(`Leg ${legIndex + 1}: from ${flight.from} to ${flight.to}`);
                flight.providers.forEach(provider => {
                    console.log(`  - From ${flight.from} to ${flight.to}`);
                    console.log(`  - Step: ${new Date(provider.flightStart).toDateString()} to ${new Date(provider.flightEnd).toDateString()}`);
                });
            });
        });
    }
});

                                    
            // Loop through the successfulFlights array and display flights
    } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }
    
    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});
