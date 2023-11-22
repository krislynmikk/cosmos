
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
           // const connectedFlights = findConnectedFlights(legs, shortestRoutes);

            function identifyConsecutiveFlights(legs) {
                const consecutiveFlights = [];
    
                legs.forEach(leg => {
                    leg.providers.sort((a, b) => new Date(a.flightStart) - new Date(b.flightStart));
                });
    
                legs.forEach(leg => {
                    const legFlights = leg.providers;
                    console.log(legFlights);
                    const connectedFlights = [];
                    let currentFlight = legFlights[0];
                    for (let i = 1; i < legFlights.length; i++) {
                        const nextFlight = legFlights[i];
                        const currentFlightEnd = new Date(currentFlight.flightEnd);
                        const nextFlightStart = new Date(nextFlight.flightStart);
    
                        if (currentFlightEnd.getTime() < nextFlightStart.getTime()) {
                            connectedFlights.push(currentFlight);
                            currentFlight = nextFlight;
                        }
                    }
    
                    connectedFlights.push(currentFlight);
    
                    if (connectedFlights.length > 1) {
                        consecutiveFlights.push(connectedFlights);
                    }
                });
    
                return consecutiveFlights;
            }
    
            // Identify consecutive flights
            const consecutiveFlights = identifyConsecutiveFlights(legs);
    
            // Display the consecutive flights
            consecutiveFlights.forEach((sequence, index) => {
                console.log(`Sequence ${index + 1}:`);
                sequence.forEach((flight, i) => {
                    console.log(`Leg ${i + 1}: from ${flight.company.name} (${flight.flightStart}) to ${flight.company.name} (${flight.flightEnd})`);
                });
                console.log('\n');
            });
    
            // Rest of your code...
        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }
    
    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});
