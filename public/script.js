import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

async function fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown) {
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

        const { legs } = await response.json();
        const routes = findRoutes(legs, sourceName, destinationName);
        const shortestRouteLength = Math.min(...routes.map((route) => route.length));
        const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

        displayRoutes(shortestRoutes);

        const connectedFlights = findConnectedFlights(legs, shortestRoutes);
        const storedSequences = logAndStoreFlightSequences(connectedFlights, legs);
        performComparisons(storedSequences);
    } catch (error) {
        handleFetchError(error);
    }
}

function displayRoutes(routes) {
    const routeResults = document.getElementById('route-results');
    routeResults.innerHTML = '';

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

let previousFlightSequences = [];
console.log(previousFlightSequences);
function logAndStoreFlightSequences(connectedFlights, legs) {
    const storedFlightSequences = []; // Initialize an array to store flight sequences
    connectedFlights.forEach((routeFlights, routeIndex) => {
        console.log(`Route ${routeIndex + 1} flights sequence:`);

        const routeDetails = [];
        routeFlights.forEach((legFlights) => {
            const flightSequence = [];
            legFlights.forEach((flight) => {
                const flightDetails = {
                    from: flight.routeInfo.from.name,
                    to: flight.routeInfo.to.name,
                    providers: [], // Initialize an array to store flight provider details
                };

                flight.providers.forEach((provider) => {
                    flightDetails.providers.push({
                        providerId: provider.id,
                        providerName: provider.company.name,
                        price: provider.price,
                        flightStart: provider.flightStart,
                        flightEnd: provider.flightEnd,
                    });
                });

                flightSequence.push(flightDetails);
            });

            routeDetails.push(flightSequence[0]); // Store the flight sequence for each leg
        });

        storedFlightSequences.push(routeDetails); // Store the flight sequences for each route
    });

    // Store the current flight sequence in the global array for next use
    previousFlightSequences.push(storedFlightSequences.flat());
    // ---------------------- //

/* console.log("storedFlightSequences", storedFlightSequences);
console.log("storedFlightSequences[0]", storedFlightSequences[0]);
console.log("storedFlightSequences[1]", storedFlightSequences[1]);
console.log("storedFlightSequences[0][0]", storedFlightSequences[0][0]);
console.log("storedFlightSequences[0][1]", storedFlightSequences[0][1]);
console.log("storedFlightSequences[0][2]", storedFlightSequences[0][2]);
console.log("storedFlightSequences[1][0]", storedFlightSequences[1][0]);
console.log("storedFlightSequences[1][1]", storedFlightSequences[1][1]);
console.log("storedFlightSequences[1][2]", storedFlightSequences[1][2]); */
// Assuming storedFlightSequences is an array of flight sequences

// Define an array to store all flights
const allFlights = storedFlightSequences[0].map(sequence => sequence.providers);

// Loop through the flights to get 'from' and 'to' values for each flight set
const fromList = storedFlightSequences[0].map(sequence => sequence.from)
const toList = storedFlightSequences[0].map(sequence => sequence.to)

// Access flights dynamically using array indexing
for (let i = 0; i < allFlights.length; i++) {
    const from = fromList[i];
    const to = toList[i];

    // Perform operations with 'from', 'to', and 'allFlights[i]'
    // For example:
    console.log(`From: ${from}, To: ${to}`);
    console.log(`Flights:`, allFlights[i]);
    allFlights[i].forEach(start => {
        console.log("start", start.flightStart);
    })
}



const flights1 = storedFlightSequences[0][0].providers;
const from1 = storedFlightSequences[0][0].from;
const to1 = storedFlightSequences[0][0].to;
const flights2 = storedFlightSequences[0][1].providers;
const from2 = storedFlightSequences[0][1].from;
const to2 = storedFlightSequences[0][1].to;
const flights3 = storedFlightSequences[0][2].providers;
const from3 = storedFlightSequences[0][2].from;
const to3 = storedFlightSequences[0][2].to;
const trueFlights2to3 = [];
const trueFlights = [];

for (let i = 0; i < flights1.length; i++) {
    const flight1End = new Date(flights1[i].flightEnd).getTime();
    
    for (let j = 0; j < flights2.length; j++) {
        const flight2Start = new Date(flights2[j].flightStart).getTime();

        if (flight1End < flight2Start) {
            trueFlights.push({
                flight1: flights1[i],
                flight2: flights2[j]
            });
        }
    }
}


for (let i = 0; i < trueFlights.length; i++) {
    const flight2End = new Date(trueFlights[i].flight2.flightEnd).getTime();
    for (let j = 0; j < flights3.length; j++) {
        const flight3Start = new Date(flights3[j].flightStart).getTime();

        if (flight2End < flight3Start) {
            trueFlights2to3.push({
                flight2: trueFlights[i].flight2,
                flight3: flights3[j]
            });
        }
    }
}

 
// Assuming trueFlights and trueFlights2to3 are already populated as described earlier

// Combine flight information from both arrays into a connected route
connectedFlights = [];

trueFlights.forEach((flight) => {
    trueFlights2to3.forEach((flight2to3) => {
        if (flight.flight2 === flight2to3.flight2) {
            connectedFlights.push({
                flight1: flight.flight1,
                flight2: flight.flight2,
                flight3: flight2to3.flight3
            });
        }
    });
});

// Display the connected flights route
const connectedFlightsList = document.getElementById('connectedFlightsList');

connectedFlights.forEach((flight, index) => {
    const flight1Start = new Date(flight.flight1.flightStart).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });
    const flight1End = new Date(flight.flight1.flightEnd).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });
    const flight2Start = new Date(flight.flight2.flightStart).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });
    const flight2End = new Date(flight.flight2.flightEnd).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });
    const flight3Start = new Date(flight.flight3.flightStart).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });
    const flight3End = new Date(flight.flight3.flightEnd).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false });

    const listItem = document.createElement('li');
    listItem.innerHTML = `
    Connected Flight ${index + 1}: <br>
    ${flight.flight1.providerName} from ${from1} to ${to1} <br>
    Departure: ${flight1Start}, Arrival: ${flight1End} <br><br>
    ${flight.flight2.providerName} from ${from2} to ${to2} <br>
    Departure: ${flight2Start}, Arrival: ${flight2End} <br><br>
    ${flight.flight3.providerName} from ${from3} to ${to3} <br>
    Departure: ${flight3Start}, Arrival: ${flight3End}
    `;

    const spacer = document.createElement('p');
    spacer.textContent = '\u00A0'; // Unicode for non-breaking space

    // Append elements to the list
    connectedFlightsList.appendChild(listItem);
    connectedFlightsList.appendChild(spacer);
});


    // ---------------------- //
    return storedFlightSequences;
}

function performComparisons() {
    // Access the stored flight sequences from previous executions
    previousFlightSequences.forEach((flightSequence, index) => {
        console.log(`Comparisons for sequence ${index + 1}:`);
        // Perform comparisons or operations with flightSequence array here
        // For example, compare flight details or prices between sequences
        // Iterate through the flights and perform the necessary logic
        flightSequence.forEach((flight) => {
            // Example: Log flight details for each sequence
            console.log(`From ${flight.from} to ${flight.to}`);
            flight.providers.forEach((provider) => {
              /*  console.log(`  - Provider: ${provider.providerName}`);
                console.log(`  - Price: ${provider.price}`);
                console.log(`  - Flight Start: ${provider.flightStart}`);
                console.log(`  - Flight End: ${provider.flightEnd}`); */
                // Perform further comparisons or operations here
            });
        });
    });
}

function handleFetchError(error) {
    console.error('Error fetching and displaying routes:', error);
}

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

    findRoutesButton.addEventListener('click', () => {
        fetchAndDisplayRoutes(sourcePlanetDropdown, destinationPlanetDropdown);
    });
});
