import { fetchPlanets, findRoutes, findFlightsBetweenPlanets } from './function.js';
const API = 'http://localhost:5001/api/v1.0/TravelPrices';
const connectedFlights = [];
let selectedRoute = null;

// Define variables to store flight information
const allProviders = [];
const allFlightStarts = [];

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit'};
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, options);
    return formattedDate;
}
document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');
    const connectedFlightsTable = document.getElementById('connected-flights-table');


    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown); // Fetch planets and populate dropdowns

    function findConnectedFlights(legs, routes) {
        console.log("routes", routes);
        let shortestRouteLength = Infinity;
        routes.forEach((route) => {
            if (route.length < shortestRouteLength) {
                shortestRouteLength = route.length;
            }
        });

        // Find and log all routes with the shortest length
        const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

        console.log("Shortest Routes:", shortestRoutes);
        routes.forEach((route, routeIndex) => {
            const routeLegs = [];
    
            for (let i = 0; i < route.length - 1; i++) {
                const sourcePlanet = route[i];
                const destinationPlanet = route[i + 1];
    
                const validFlights = legs.filter(leg =>
                    leg.routeInfo.from.name === sourcePlanet &&
                    leg.routeInfo.to.name === destinationPlanet
                );
    
                if (validFlights.length > 0) {
                    routeLegs.push(validFlights);
                }
            }
           console.log("routelogs", routeLegs[0]);
            console.log("routelogs", routeLegs);
    
            for (let i = 0; i < routeLegs.length - 1; i++) {
                const currentLeg = routeLegs[i];
                const nextLeg = routeLegs[i + 1];
    
                // Check if flightStart of the next leg is greater than flightEnd of the current leg
                const flightsMeetingCriteria = [];
    
                currentLeg.forEach(currentFlight => {
                    currentFlight.providers.forEach(currentProvider => {
                        const currentFlightEnd = new Date(currentProvider.flightEnd);
                        nextLeg.forEach(nextFlight => {
                            nextFlight.providers.forEach(nextProvider => {
                                const nextFlightStart = new Date(nextProvider.flightStart);
                                if (currentFlightEnd < nextFlightStart) {
                                   /* console.log("Current Flight End:", currentFlightEnd);
                                    console.log("Next Flight Start:", nextFlightStart); */
                                }
                              //  console.log("currentflightend", currentFlightEnd, nextFlightStart);

                            });
                        });
                    });
                });
    
               // console.log(`Connected Flights for Route ${routeIndex + 1} Leg ${i + 1}:`);
                console.log(flightsMeetingCriteria);
            }
     
                // Initialize with the first leg's flights
            let validCombinations = routeLegs[0];
         //   console.log("validCombinations", validCombinations);

            for (let i = 1; i < routeLegs.length; i++) {
                const nextLegFlights = routeLegs[i];
           //     console.log("nextLegFlights", nextLegFlights);
                for (const nextFlight of nextLegFlights) {
                    const flightProviders = nextFlight.providers; // Get the list of providers for each flight
              //      console.log("Providers for this flight:", flightProviders);

                    for (const provider of flightProviders) {
                        const flightStart = provider.flightStart; // Access the flightStart for each provider
                        const flightEnd = provider.flightEnd; // Access the flightEnd for each provider

                     /*  console.log("Flight Start for this provider:", flightStart);
                        console.log("Flight End for this provider:", flightEnd); */

                        
                        // Store provider and flightStart information in the arrays
                        allProviders.push(provider);
                        allFlightStarts.push(flightStart);
                        allFlightStarts.push(flightEnd)
                    }
                } // <------------ ise lisasin
                // Find valid combinations between validCombinations and nextLegFlights
                const newValidCombinations = [];
                validCombinations.forEach((combination) => {
                    nextLegFlights.forEach((nextFlight) => {
                        const lastFlight = combination[combination.length - 1];

                        if (lastFlight && lastFlight.providers && lastFlight.providers[0] && nextFlight.providers && nextFlight.providers[0]) {
                            const lastFlightEnd = new Date(lastFlight.providers[0].flightEnd);
                            const nextFlightStart = new Date(nextFlight.providers[0].flightStart);

                            if (lastFlightEnd <= nextFlightStart) {
                                // Valid connection between flights'
                                newValidCombinations.push([...combination, nextFlight]);
                            }
                        }
                     //   console.log("connectedFlights inside findConnectedFlights", connectedFlights);
                    });
                });
                // Log the valid flight combinations for the current route
             //   console.log(`newValid Flight Combinations for Route ${routeIndex + 1}:`, newValidCombinations);
                validCombinations = newValidCombinations;
            }
            function findAndAddConsecutiveFlights(routeLegs, shortestRoutes) {
                const consecutiveFlights = [];
            
                shortestRoutes.forEach((shortestRoute) => {
                    if (shortestRoute.length >= 2) {
                        // Ensure the route index is within bounds
                        for (let i = 0; i < shortestRoute.length - 1; i++) {
                            const sourcePlanet = shortestRoute[i];
                            const destinationPlanet = shortestRoute[i + 1];
            
                            // Find the corresponding legs in routeLegs based on the planet names
                            const currentLeg = findLegByRoute(routeLegs, sourcePlanet, destinationPlanet);
                            const nextLeg = findLegByRoute(routeLegs, destinationPlanet, shortestRoute[i + 2]);
            
                            if (currentLeg && nextLeg) {
                                // Continue with processing
                                const combinedOffers = [];
            
                                // Iterate through flights in the currentLeg and nextLeg
                                currentLeg.forEach(currentFlight => {
                                    if (currentFlight && currentFlight.providers) {
                                        currentFlight.providers.forEach(currentProvider => {
                                            if (!currentProvider) {
                                                return; // Skip if currentProvider is undefined
                                            }
                                            const currentFlightEnd = new Date(currentProvider.flightEnd);
            
                                            nextLeg.forEach(nextFlight => {
                                                if (nextFlight && nextFlight.providers) {
                                                    nextFlight.providers.forEach(nextProvider => {
                                                        if (!nextProvider) {
                                                            return; // Skip if nextProvider is undefined
                                                        }
                                                        const nextFlightStart = new Date(nextProvider.flightStart);
            
                                                        if (currentFlightEnd < nextFlightStart) {
                                                            const sourcePlanet = currentFlight.routeInfo.from.name;
                                                            const destinationPlanet = nextFlight.routeInfo.to.name;
                                                            // Create a combined offer
                                                            combinedOffers.push({
                                                                source: sourcePlanet,
                                                                destination: destinationPlanet,
                                                                offer: [
                                                                    {
                                                                        flight: currentFlight,
                                                                        provider: currentProvider,
                                                                    },
                                                                    {
                                                                        flight: nextFlight,
                                                                        provider: nextProvider,
                                                                    },
                                                                ],
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
            
                                // Log the combined offers
                                combinedOffers.forEach((offer, index) => {
                                   
                           
                                   /* console.log(`Offer ${index + 1}`);
                                    console.log(`Source: ${offer.source}`);
                                    console.log(`Destination: ${offer.destination}`);
                                    console.log("Flights in Offer:");*/
                                    offer.offer.forEach((flightInfo, i) => {
                                      /*  console.log(`Flight ${i + 1}:`);
                                        console.log("Flight:", flightInfo.flight);
                                        console.log("Provider:", flightInfo.provider);*/
                                        const flightStart = flightInfo.provider.flightStart;
                                        const formattedFlightStart = formatDate(flightStart);
                                        const flightEnd = flightInfo.provider.flightEnd;
                                        const formattedFlightEnd = formatDate(flightEnd)

                                        const flightContainer = document.createElement('div');
                                        flightContainer.classList.add('flight-container');
                                    
                                        // Create and populate flight details
                                        const providerInfo = document.createElement('span');
                                        providerInfo.classList.add('flight-info');
                                        providerInfo.textContent = `Provider: ${flightInfo.provider.company.name}`;

                                        const source = document.createElement('span');
                                        providerInfo.classList.add('flight-info');
                                        source.textContent = `Source: ${offer.source}`;

                                        const destination = document.createElement('span');
                                        providerInfo.classList.add('flight-info');
                                        destination.textContent = `Destination: ${offer.destination}`;
                                    
                                        const priceInfo = document.createElement('span');
                                        priceInfo.classList.add('flight-info');
                                        priceInfo.textContent = `Price: ${flightInfo.provider.price}`;
                                    
                                        const flightTimeInfo = document.createElement('span');
                                        flightTimeInfo.classList.add('flight-info');
                                        flightTimeInfo.textContent = `Flight Time: ${flightInfo.provider.flightTime}`;
                                    
                                        const departureTimeInfo = document.createElement('span');
                                        departureTimeInfo.classList.add('flight-info');
                                        departureTimeInfo.textContent = `Departure Time: ${formattedFlightStart}`; // Replace with your formatted date
                                    
                                        const flightEndInfo = document.createElement('span');
                                        flightEndInfo.classList.add('flight-info');
                                        flightEndInfo.textContent = `Flight End: ${formattedFlightEnd}`; // Replace with your formatted date
                                    
                                        // Create a button for selecting the flight
                                        const selectButton = document.createElement('button');
                                        selectButton.classList.add('select-flight');
                                        selectButton.textContent = 'Select Flight';
                                    
                                        // Append flight details to the flight container
                                        flightContainer.appendChild(source);
                                        flightContainer.appendChild(destination);
                                        flightContainer.appendChild(providerInfo);
                                        flightContainer.appendChild(priceInfo);
                                        flightContainer.appendChild(flightTimeInfo);
                                        flightContainer.appendChild(departureTimeInfo);
                                        flightContainer.appendChild(flightEndInfo);
                                        flightContainer.appendChild(selectButton);
                                    
                                        // Create a list item for each flight
                                        const flightItem = document.createElement('li');
                                        flightItem.classList.add('flight-item');
                                    
                                        // Append the flight container to the list item
                                        flightItem.appendChild(flightContainer);
                                    
                                        // Append the list item to your existing container (e.g., connectedFlightsTable)
                                        connectedFlightsTable.appendChild(flightItem);                                    });
                                    console.log("\n");
                                });
                            }
                        }
                    }
                });
            }
            
            // Helper function to find legs based on source and destination planets
            function findLegByRoute(routeLegs, sourcePlanet, destinationPlanet) {
                return routeLegs.find(leg => {
                    if (leg[0] && leg[0].routeInfo.from.name === sourcePlanet && leg[0].routeInfo.to.name === destinationPlanet) {
                        return leg;
                    }
                    return null;
                });
            }
            
            // Usage
            const consecutiveFlights = findAndAddConsecutiveFlights(routeLegs, shortestRoutes);
            console.log(consecutiveFlights);
                        // Log the valid flight combinations for the current route
         //   console.log(`Valid Flight Combinations for Route ${routeIndex + 1}:`, validCombinations);
        });
        
    }
    

    // This function fetches and displays routes
    async function fetchAndDisplayRoutes() {
        const sourceName = sourcePlanetDropdown.value;
        const destinationName = destinationPlanetDropdown.value;
        if (sourceName === destinationName) {
            alert('Source and destination planets cannot be the same.');
            return;
        }
        selectedRoute = [sourceName, destinationName];
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

            /* console.log('Fetched Legs:', legs);
            console.log('Found Routes:', routes); */

            // Find connected flights
            let connectedFlights = findConnectedFlights(legs, routes);
          //  console.log('connectedFlights', connectedFlights);

            // Log valid flight combinations and remaining flights for each route
            if (Array.isArray(connectedFlights)) {
                // Log valid flight combinations and remaining flights for each route
                connectedFlights.forEach((validCombinations, routeIndex) => {
                  //  console.log(`Valid Flight Combinations for Route ${routeIndex + 1}:`, validCombinations);

                    // Log remaining flights
                    logRemainingFlights(legs, validCombinations, routes[routeIndex]);
                });
            } else {
                console.error('Connected flights are not an array or are undefined.');
            }
        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }

    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});
