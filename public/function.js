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


export { fetchPlanets, findRoutes };