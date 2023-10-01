import { findRoutes, calculateTotalDistance, showRouteOptions, fetchPlanets, displayProviders,  findProvidersForLeg} from './function.js';
const API = 'http://localhost:5001/api/v1.0/TravelPrices';
let selectedRoute = null; // To store the selected route

// Call the fetchPlanets function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    fetchPlanets();
    const findRoutesButton = document.getElementById('findRoutesButton');


    async function fetchAndDisplayRoutes() {
        const sourcePlanetDropdown = document.getElementById('source-planet');
        const destinationPlanetDropdown = document.getElementById('destination-planet');
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
            console.log('Parsed API Data:', data);

            const legs = data.legs;
            const routes = findRoutes(legs, sourceName, destinationName);
            console.log('Fetched Legs:', legs);
            console.log('Found Routes:', routes);
            
            if (routes.length === 0) {
                outputDiv.innerHTML = 'No routes found between the selected source and destination.';
            } else {
                // Sort routes by distance in ascending order (default)
                routes.sort((a, b) => calculateTotalDistance(legs, a) - calculateTotalDistance(legs, b));

                // Check if the user wants to sort in descending order
                if (document.getElementById('sort-descending').checked) {
                    routes.reverse();
                }
                selectedRoute = routes[0];

                // Display the route options
                showRouteOptions(routes, legs);
            }
            const nextButton = document.getElementById('proceedToProviders');
            nextButton.addEventListener('click', () => {
                if (selectedRoute) {
                    console.log("tere")
                    // Find flights for each leg of the selected route
                    const flightsForLegs = findFlightsForLegs(legs, selectedRoute);
        
                    // Display flights for each leg
                    displayFlightsForLegs(flightsForLegs);
                } else {
                    alert('Please select a route before proceeding.');
                }
            });
        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }      
    
    }
    
function findFlightsForLegs(legs, selectedRoute) {
    const flightsForLegs = [];
    
    for (let i = 0; i < selectedRoute.length - 1; i++) {
        const sourceName = selectedRoute[i];
        const destinationName = selectedRoute[i + 1];
        
        // Find the leg that matches the source and destination
        const leg = legs.find(
            (leg) =>
                leg.routeInfo.from.name === sourceName &&
                leg.routeInfo.to.name === destinationName
        );

        if (leg) {
            // Add the providers for this leg to the flightsForLegs array
            flightsForLegs.push({
                source: sourceName,
                destination: destinationName,
                flights: findProvidersForLeg(legs, sourceName, destinationName),
            });
        }
    }

    return flightsForLegs;
}

// Function to display flights for each leg
function displayFlightsForLegs(flightsForLegs) {
    const flightsList = document.getElementById('flights-list');
    flightsList.innerHTML = ''; // Clear existing flight data
    
    flightsForLegs.forEach((leg) => {
        const legHeader = document.createElement('h3');
        legHeader.textContent = `Flights from ${leg.source} to ${leg.destination}`;
        flightsList.appendChild(legHeader);

        if (leg.flights.length === 0) {
            const noFlightsMessage = document.createElement('p');
            noFlightsMessage.textContent = 'No flights available for this leg.';
            flightsList.appendChild(noFlightsMessage);
        } else {
            leg.flights.forEach((flight) => {
                const flightItem = document.createElement('li');
                flightItem.classList.add('flight-item');

                flightItem.innerHTML = `
                    <div class="flight-details">
                        <span class="flight-info">Provider: ${flight.name}</span>
                        <span class="flight-info">Price: ${flight.price}</span>
                        <span class="flight-info">Flight Time: ${flight.flightTime}</span>
                        <span class="flight-info">Departure Time: ${flight.flightStart}</span>
                        <span class="flight-info">Flight End: ${flight.flightEnd}</span>
                    </div>
                    <button class="select-flight">Select Flight</button>
                `;

                flightsList.appendChild(flightItem);
            });
        }
    });
}
findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
document.getElementById('sort-ascending').addEventListener('change', fetchAndDisplayRoutes);
document.getElementById('sort-descending').addEventListener('change', fetchAndDisplayRoutes);


});