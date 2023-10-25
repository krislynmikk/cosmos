const findRoutesButton = document.getElementById('findRoutesButton');
findRoutesButton.addEventListener('click', () => {
    // Handle route finding and display here
});
findRoutesButton.addEventListener('click', async () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const sourceName = sourcePlanetDropdown.value;
    const destinationName = destinationPlanetDropdown.value;

    // Make an API request to fetch available routes based on source and destination
    const routes = await fetchRoutes(sourceName, destinationName);

    // Clear previous results
    const routeResults = document.getElementById('route-results');
    routeResults.innerHTML = '';

    // Loop through the routes and create checkboxes for each route
    routes.forEach((route, index) => {
        const routeOptionContainer = document.createElement('div');
        routeOptionContainer.classList.add('route-option-container');

        const routeCheckbox = document.createElement('input');
        routeCheckbox.type = 'checkbox';
        routeCheckbox.id = `route-checkbox-${index}`;
        routeCheckbox.value = route.join(' -> ');

        // Create a label for the checkbox with route details
        const routeLabel = document.createElement('label');
        routeLabel.textContent = `${route.join(' -> ')} (Distance: ${getTotalDistance(route)} km)`;
        routeLabel.setAttribute('for', `route-checkbox-${index}`);

        routeOptionContainer.appendChild(routeCheckbox);
        routeOptionContainer.appendChild(routeLabel);

        // Add the route option container to the results section
        routeResults.appendChild(routeOptionContainer);
    });
});
