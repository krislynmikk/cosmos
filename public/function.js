const API_BASE_URL = 'http://localhost:5001/api/v1.0/TravelPrices';
let selectedRouteIndex


// Helper function to fetch data from the API
async function fetchData() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Error fetching routes');
        }
        return response.json();
    } catch (error) {
        throw new Error('Error fetching routes');
    }
}

// Fetch planets and populate dropdowns
async function fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown) {
    try {
        const data = await fetchData();
        const uniquePlanetNames = [...new Set(data.legs.flatMap(leg => [leg.routeInfo.from.name]))];

        sourcePlanetDropdown.innerHTML = '';
        destinationPlanetDropdown.innerHTML = '';

        uniquePlanetNames.forEach(planetName => {
            const sourceOption = document.createElement('option');
            sourceOption.textContent = planetName;
            sourcePlanetDropdown.appendChild(sourceOption);

            const destinationOption = document.createElement('option');
            destinationOption.textContent = planetName;
            destinationPlanetDropdown.appendChild(destinationOption);
        });
    } catch (error) {
        console.error('Error fetching planets:', error);
    }
}

// Find routes
function findRoutes(legs, sourceName, destinationName) {
    const routes = [];
    const visited = new Set();

    function dfs(currentPlanet, currentFlight) {
        if (currentPlanet === destinationName) {
            routes.push([...currentFlight, currentPlanet]);
            return;
        }
        
        for (const leg of legs) {
            if (leg.routeInfo && leg.routeInfo.from && leg.routeInfo.to &&
                leg.routeInfo.from.name === currentPlanet &&
                !currentFlight.includes(leg.routeInfo.to.name)) {
                // Add the 'to' planet to the currentFlight to avoid revisiting it
                dfs(leg.routeInfo.to.name, [...currentFlight, currentPlanet]);
            }
        }
    }
    
    dfs(sourceName, []);
        
    return routes;
}
function findFlightsBetweenPlanets(legs, route) {
    const flights = [];
    
    // Helper function to compare two flights and check for conflicts
    function hasConflict(flightA, flightB) {
        return new Date(flightA.flightEnd) > new Date(flightB.flightStart);
    }

    if (route.length === 2) {
        // Direct Flight
        const sourcePlanet = route[0];
        const destinationPlanet = route[1];
        const validFlights = legs.filter(leg => 
            leg.routeInfo.from.name === sourcePlanet &&
            leg.routeInfo.to.name === destinationPlanet
        );

        validFlights.forEach((flight, flightIndex) => {
            console.log(`Direct Flight ${flightIndex + 1}:`);
            flight.providers.forEach((provider, providerIndex) => {
                console.log(`Provider ${providerIndex + 1} - Flight Start: ${provider.flightStart}`);
            });
            flights.push(validFlights);
        });

        return flights;
    }

    for (let i = 0; i < route.length - 1; i++) {
        const sourcePlanet = route[i];
        const destinationPlanet = route[i + 1];
        
        const validFlights = legs.filter(leg => 
            leg.routeInfo.from.name === sourcePlanet &&
            leg.routeInfo.to.name === destinationPlanet &&
            (!flights.some(flight => flight.some(f => hasConflict(leg.providers[0], f[0]))))
        );
    
        validFlights.forEach((flight, flightIndex) => {
            console.log(`Flight ${flightIndex + 1}:`);
    
            if (flight.providers && flight.providers.length > 0) {
                let lastProvider = flight.providers[0]; // Initialize lastProvider
    
                for (let i = 1; i < flight.providers.length; i++) {
                    const previousProvider = flight.providers[i - 1];
                    const currentProvider = flight.providers[i];
    
                    // Check if providers exist and compare dates
                    if (previousProvider && currentProvider) {
                        if (new Date(currentProvider.flightStart) > new Date(lastProvider.flightEnd)) {
                            // Your code for handling connected flights
                            console.log(`Provider ${i} - Flight Start: ${currentProvider.flightStart}`);
                        } else {
                            // Your code for handling non-connected flights
                            console.log('Not connected with the previous flight');
                        }
    
                        lastProvider = currentProvider; // Update lastProvider
                    }
                }
            }
        });
    
        flights.push(validFlights);
    }
    return flights;
}

export { fetchPlanets, findRoutes, findFlightsBetweenPlanets };