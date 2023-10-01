const API = 'http://localhost:5001/api/v1.0/TravelPrices';
let data = null;
function fetchPlanets() {
    console.log('Fetching planets...');

    // Fetch data from your API endpoint (replace with your actual endpoint)
    fetch('/api/fetchPlanetsFromAPI')
        .then(response => response.json())
        .then(data => {
            console.log('Received planet data:', data); // Add this line
            
            // Clear existing list items
            const sourceList = document.getElementById('source-list');
            const destinationList = document.getElementById('destination-list');
            sourceList.innerHTML = '';
            destinationList.innerHTML = '';

            // Assuming the API response contains an array of planet names
            if (Array.isArray(data.planets)) {
                // Use innerHTML to set the list content
                sourceList.innerHTML = data.planets.map(planetName => `<li>${planetName}</li>`).join('');
                destinationList.innerHTML = data.planets.map(planetName => `<li>${planetName}</li>`).join('');
            }
        })
        .catch(error => {
            console.error('Error fetching planets:', error);
        });
}

// Call the fetchPlanets function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    fetchPlanets();

    const sourceList = document.getElementById('source-list');
    const destinationList = document.getElementById('destination-list');
    const outputDiv = document.getElementById('route-results');
    const selectSourceButton = document.getElementById('selectSource');
    const selectDestinationButton = document.getElementById('selectDestination');
    let selectedSource = null;
    let selectedDestination = null;
    async function fetchAndDisplayRoutes() {
        if (selectedSource && selectedDestination) {
            // You can send a request to your server to fetch routes based on selectedSource and selectedDestination
            // Update the routes in the outputDiv
            outputDiv.innerHTML = 'Fetching and displaying routes...';
             try {
        // Send a GET request to the server route with source and destination as query parameters
        const response = await fetch(`/api/fetchRoutes?sourceName=${sourceName}&destinationName=${destinationName}`);
        if (!response.ok) {
            throw new Error('Error fetching routes');
        }

        // Parse the response JSON
        const data = await response.json();

        // Display the routes in the UI
        const routes = data.routes;
        const outputDiv = document.getElementById('route-results');
        // Update the UI to display the fetched routes
        outputDiv.innerHTML = '';
        if (routes.length === 0) {
            outputDiv.innerHTML = 'No routes found.';
        } else {
            outputDiv.innerHTML = 'Routes found:<br>';
            routes.forEach(route => {
                outputDiv.innerHTML += route.join(' -> ') + '<br>';
            });
        }
    } catch (error) {
        console.error('Error fetching and displaying routes:', error);
    }
}}
function findRoutes(sourceName, destinationName, legs) {
    const graph = {};
    legs.forEach((leg) => {
        const fromName = leg.routeInfo.from.name;
        const toName = leg.routeInfo.to.name;
        graph[fromName] = graph[fromName] || [];
        graph[fromName].push(toName);
    });

    const queue = [[sourceName]];
    const routes = [];

    while (queue.length > 0) {
        const path = queue.shift();
        const currentName = path[path.length - 1];

        if (currentName === destinationName) routes.push(path);

        if (graph[currentName]) {
            graph[currentName].forEach((neighbor) => {
                if (!path.includes(neighbor)) queue.push([...path, neighbor]);
            });
        }
    }

    return routes;
}
const findRoutesButton = document.getElementById('findRoutesButton');

    findRoutesButton.addEventListener('click', () => {
        const selectedSourceItem = sourceList.querySelector('.selected');
        const selectedDestinationItem = destinationList.querySelector('.selected');

        if (selectedSourceItem && selectedDestinationItem) {
            const sourceName = selectedSourceItem.textContent;
            const destinationName = selectedDestinationItem.textContent;

            fetchAndDisplayRoutes(sourceName, destinationName);
        } else {
            alert('Please select both source and destination planets.');
        }
    });

     const viewRoutesButton = document.getElementById('viewRoutesButton');

    viewRoutesButton.addEventListener('click', () => {
        const sourceList = document.getElementById('source-list');
        const destinationList = document.getElementById('destination-list');
        
        // Get the selected source and destination planets
        const selectedSource = sourceList.querySelector('.selected');
        const selectedDestination = destinationList.querySelector('.selected');
        
        if (selectedSource && selectedDestination) {
            const sourceName = selectedSource.textContent;
            const destinationName = selectedDestination.textContent;
            
            // Call a function to fetch and display routes based on source and destination
            fetchAndDisplayRoutes(sourceName, destinationName);
        } else {
            alert('Please select both source and destination planets.');
        }
    });
    selectSourceButton.addEventListener('click', () => {
        const selectedSourceItem = sourceList.querySelector('.selected');
        if (selectedSourceItem) {
            selectedSource = selectedSourceItem.textContent;
            alert('Selected Source: ' + selectedSource);
        } else {
            alert('Please select a source planet from the list.');
        }
    });
    selectDestinationButton.addEventListener('click', () => {
        const selectedDestinationItem = destinationList.querySelector('.selected');
        if (selectedDestinationItem) {
            selectedDestination = selectedDestinationItem.textContent;
            alert('Selected Destination: ' + selectedDestination);
        } else {
            alert('Please select a destination planet from the list.');
        }
    });

    // Event listener for viewing routes
    viewRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});

