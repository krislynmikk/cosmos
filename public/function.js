let routeCheckbox_id2

function getcheckedboxid() {
    console.log('saadamevaartuse',routeCheckbox_id2)
return routeCheckbox_id2

}

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

function findProvidersForLeg(legs, sourceName, destinationName) {
    const providersForLeg = [];

    legs.forEach((leg) => {
        if (
            leg.routeInfo.from.name === sourceName &&
            leg.routeInfo.to.name === destinationName
        ) {
            leg.providers.sort((a, b) => {
                const flightEndA = new Date(a.flightEnd).getTime();
                const flightEndB = new Date(b.flightEnd).getTime();
                return flightEndA - flightEndB;
            });

            // Filter the providers based on the flight start and end times
            let previousFlightEnd = 0;
            const filteredProviders = leg.providers.filter((provider) => {
                const flightStartUnix = new Date(provider.flightStart).getTime();
                const flightEndUnix = new Date(provider.flightEnd).getTime();

                // Check if the flight starts after the previous flight ends
                if (flightStartUnix >= previousFlightEnd) {
                    // Update the previousFlightEnd to the current flight's end time
                    previousFlightEnd = flightEndUnix;
                    return true;
                }

                return false;
            });

            // Add the filtered providers to the list
            filteredProviders.forEach((provider) => {
                const flightStartUnix = new Date(
                    provider.flightStart
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                const flightEndUnix = new Date(
                    provider.flightEnd
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                const flightTimeInSeconds =
                    (flightEndUnix - flightStartUnix) / 1000; // Calculate flight time in seconds

                // Calculate days, hours, minutes, and seconds
                const secondsInMinute = 60;
                const minutesInHour = 60;
                const hoursInDay = 24;

                const days = Math.floor(
                    flightTimeInSeconds /
                        (secondsInMinute * minutesInHour * hoursInDay)
                );
                const hours = Math.floor(
                    (flightTimeInSeconds %
                        (secondsInMinute * minutesInHour * hoursInDay)) /
                        (secondsInMinute * minutesInHour)
                );
                const minutes = Math.floor(
                    (flightTimeInSeconds % (secondsInMinute * minutesInHour)) /
                        secondsInMinute
                );
                const seconds = flightTimeInSeconds % secondsInMinute;

                // Create Date objects for flightStart and flightEnd
                const flightStartDate = new Date(flightStartUnix);
                const flightEndDate = new Date(flightEndUnix);

                // Format flightStartDate and flightEndDate in the desired format
                const formattedFlightStart = flightStartDate.toLocaleString(
                    "et-EE",
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );

                const formattedFlightEnd = flightEndDate.toLocaleString(
                    "et-EE",
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );

                providersForLeg.push({ // see rida näitab front-endis lendude listi
                    name: provider.company.name,
                    price: provider.price,
                    flightTime: `${days} days, ${hours} hours, ${minutes} minutes`, // Readable flight time
                    flightStart: formattedFlightStart, // Formatted flight start date and time
                    flightEnd: formattedFlightEnd, // Formatted flight end date and time
                });
            });
        }
    });

    return providersForLeg;
}


function showRouteOptions(routes, legs) {
    const sourcePlanetDropdown = document.getElementById('source-planet');
        const destinationPlanetDropdown = document.getElementById('destination-planet');
        const sourceName = sourcePlanetDropdown.value;
        const destinationName = destinationPlanetDropdown.value;
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
        routeCheckbox.id2 = `${index}`; //addedbyK
        let routeCheckbox_id2 = routeCheckbox.id2;
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
                console.log(routeCheckbox_id2)

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
            function displayFlights(legs, sourceName, destinationName) {
                const flightsList = document.getElementById('flights-list');
            
                if (!flightsList) {
                    console.error('Element "flights-list" not found.');
                    return;
                }
            
                // Find providers for the selected route (sourceName to destinationName)
                const providersForSelectedLeg = findProvidersForLeg(
                    legs,
                    sourceName,
                    destinationName
                );
                // Loop through each provider for the selected route
                providersForSelectedLeg.forEach((provider) => {
                    const flightItem = document.createElement('li');
                    flightItem.classList.add('flight-item');
                });
            }
            
            fetch('/api/fetchTravelData') // Update the endpoint as needed
            .then(response => response.json())
            .then(data => {
                console.log('Received data from API:', data); 
                // Call a function to display the flight data
                displayFlights(data.legs, sourceName, destinationName);
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

export { findRoutes, calculateTotalDistance, fetchPlanets, displayProviders, showRouteOptions, findProvidersForLeg, getcheckedboxid, routeCheckbox_id2};
