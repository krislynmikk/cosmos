function calculateTotalDistance(legs, route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const sourceName = route[i];
        const destinationName = route[i + 1];
        const leg = legs.find(
            (leg) =>
                leg.routeInfo.from.name === sourceName &&
                leg.routeInfo.to.name === destinationName
        );
        if (leg) totalDistance += leg.routeInfo.distance;
    }
    return totalDistance;
}

function findRoutes(legs, sourceName, destinationName) {
    const routes = [];
    const visited = new Set();

    function dfs(currentPlanet, currentRoute) {
        if (currentPlanet === destinationName) {
            routes.push([...currentRoute, destinationName]);
            return;
        }

        visited.add(currentPlanet);

        for (const leg of legs) {
            if (leg.routeInfo.from.name === currentPlanet && !visited.has(leg.routeInfo.to.name)) {
                currentRoute.push(leg.routeInfo.from.name);
                dfs(leg.routeInfo.to.name, currentRoute);
                currentRoute.pop();
            }
        }

        visited.delete(currentPlanet);
    }

    dfs(sourceName, []);

    return routes;
}

function showRouteOptions(routes, legs) {
    const routeOptionsDiv = document.getElementById('route-options');
    if (!routeOptionsDiv) {
        console.error('Element route-options not found');
        return;
    }
    routeOptionsDiv.innerHTML = '';
let selectedRoute = null;
    routes.forEach((route, index) => {
        const totalDistance = calculateTotalDistance(legs, route);

        // Create a container div for each route option
        const routeOptionContainer = document.createElement('div');
        routeOptionContainer.classList.add('route-option-container');

        const routeCheckbox = document.createElement('input');
        routeCheckbox.type = 'checkbox';
        routeCheckbox.id = `route-checkbox-${index}`;
        routeCheckbox.value = route.join(' -> ');

        // Create a label for the checkbox with route details
        const routeLabel = document.createElement('label');
        routeLabel.textContent = `${route.join(' -> ')} (Distance: ${totalDistance} km)`;
        routeLabel.setAttribute('for', `route-checkbox-${index}`);

        // Add a click event listener to the container to handle route selection
        routeOptionContainer.addEventListener('click', () => {
            // Toggle the checkbox when the container is clicked
            routeCheckbox.checked = !routeCheckbox.checked;

            if (routeCheckbox.checked) {
                selectedRoute = route;
            } else {
                selectedRoute = null;
            }
        });
    
        // Add the checkbox and label to the container
        routeOptionContainer.appendChild(routeCheckbox);
        routeOptionContainer.appendChild(routeLabel);

        routeOptionsDiv.appendChild(routeOptionContainer);});
    // Add a "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.id = 'proceedToProviders';

    // Add a click event listener to the "Next" button
    nextButton.addEventListener('click', () => {
        // Query all checkboxes within the routeOptionsDiv
        const checkboxes = routeOptionsDiv.querySelectorAll('input[type="checkbox"]');
        const selectedCheckbox = Array.from(checkboxes).find((checkbox) => checkbox.checked);
    
        if (selectedCheckbox) {
            const selectedRouteValue = selectedCheckbox.value;
            console.log('Selected Route:', selectedRouteValue);
            function formatDateTime(dateTimeString) {
                const options = { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                };
                return new Date(dateTimeString).toLocaleString(undefined, options);
            }
    
            // You can perform actions with the selected route here
            // For example, you can proceed to the provider list
            function displayFlights(legs) {             
                const searchFrom = document.getElementById('source-planet');
                const searchTo = document.getElementById('destination-planet')               //added-1
                const flightsList = document.getElementById('flights-list');
            
                if (!flightsList) {
                    console.error('Element "flights-list" not found.');
                    return;
                }
            
                // Clear any existing flight data in the list
                flightsList.innerHTML = '';

    // Loop through each leg and its providers
                        legs.forEach(leg => {
                            if (leg.routeInfo.from.name == 'Earth' && leg.routeInfo.to.name == 'Jupiter'){ //added-1
                                
                            leg.providers.forEach(provider => {
                                const flightItem = document.createElement('li');
                                flightItem.classList.add('flight-item'); // Add the flight-item class
                                
                                const formattedStartDate = formatDateTime(provider.flightStart);
                                const formattedEndDate = formatDateTime(provider.flightEnd);

                                flightItem.innerHTML = `
                                    <div class="flight-details">
                                        <span class="flight-info">Provider: ${provider.company.name}</span>
                                        <span class="flight-info">Price: ${provider.price}</span>
                                        <span class="flight-info">Departure Time: ${formattedStartDate}</span>
                                        <span class="flight-info">Flight Time: ${formattedEndDate}</span>
                                    </div>
                                    <button class="select-flight">Select Flight</button>
                                `;

                                flightsList.appendChild(flightItem);
                               
                            });
                        } // added-1
                        });
                    }
            fetch('/api/fetchTravelData') // Update the endpoint as needed
            .then(response => response.json())
            .then(data => {
                // Call a function to display the flight data
                displayFlights(data.legs);
            })
            .catch(error => {
                console.error('Error fetching flight data:', error);
            });
        } else {
            alert('Please select a route before proceeding.');
        }
    });
    routeOptionsDiv.appendChild(nextButton);
}


function displayProviders(provider) {
    const providersList = document.getElementById('providers');

    provider.forEach(provider => {
        const providerItem = document.createElement('li');
        providerItem.textContent = `Provider Name: ${provider.company.name}, Price: ${provider.price}, Departure Time: ${provider.flightStart}, Flight Time: ${provider.flightEnd}`;
        providersList.appendChild(providerItem);
    });
    console.log('Displaying Providers:', provider);
}


function fetchPlanets() {
    console.log('Fetching planets...');

    // Fetch data from your API endpoint (replace with your actual endpoint)
    fetch('/api/fetchPlanetsFromAPI')
        .then(response => response.json())
        .then(data => {
            console.log('Received planet data:', data);

            // Clear existing list items
            const sourcePlanetDropdown = document.getElementById('source-planet');
            const destinationPlanetDropdown = document.getElementById('destination-planet');
            sourcePlanetDropdown.innerHTML = '';
            destinationPlanetDropdown.innerHTML = '';

            // Assuming the API response contains an array of planet names
            if (Array.isArray(data.planets)) {
                data.planets.forEach(planetName => {
                    const sourceOption = document.createElement('option');
                    sourceOption.textContent = planetName;
                    sourcePlanetDropdown.appendChild(sourceOption);

                    const destinationOption = document.createElement('option');
                    destinationOption.textContent = planetName;
                    destinationPlanetDropdown.appendChild(destinationOption);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching planets:', error);
        });
}

export { findRoutes, calculateTotalDistance, fetchPlanets, displayProviders, showRouteOptions };