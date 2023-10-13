import {findRoutes, calculateTotalDistance, showRouteOptions, fetchPlanets, findProvidersForLeg, CheckedRouteArrIndex,  flightStartUnix_1, flightEndUnix_1} from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';
let selectedRoute = null; // To store the selected route
let flightsForLegs = null;
let selectedRouteIndex = null;
const selectedFlights = []; // To store selected flights in the selected route
function convertToUnixTimestamp(iso8601Date) {
    const date = new Date(iso8601Date);
    const unixTimestamp = date.getTime();
    return unixTimestamp;
  }
  function customFormatToUnixTimestamp(dateTimeString) {
    const parts = dateTimeString.match(/(\d+)/g);
    
    if (parts.length === 5) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Months in JavaScript are 0-indexed (0-11).
      const year = parseInt(parts[2]);
      const hours = parseInt(parts[3]);
      const minutes = parseInt(parts[4]);
      
      const date = new Date(year, month, day, hours, minutes);
      
      const unixTimestamp = date.getTime();
      return unixTimestamp;
    } else {
      throw new Error("Invalid date and time format.");
    }
  }
  
//  const dateTimeString = "25.10.2023, 14:35";
 // const unixTimestamp = customFormatToUnixTimestamp(dateTimeString);
 // console.log(unixTimestamp);

// Define the findFlightsForLegs function here
function findFlightsForLegs(legs, selectedRoute) {
    const flightsForLegs = [];

    for (let i = 0; i < selectedRoute.length - 1; i++) {
        const sourceName = selectedRoute[i];
        const destinationName = selectedRoute[i + 1];

        // Find the leg that matches the source and destination
        const leg = legs.find((leg) => leg.routeInfo.from.name === sourceName && leg.routeInfo.to.name === destinationName);
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
function displayFlightsForLegs(leg) {
    const flightsList = document.getElementById('flights-list');
    flightsList.innerHTML = ''; // Clear existing flight data

    if (!leg || !leg.flights || leg.flights.length === 0) {
        const noFlightsMessage = document.createElement('p');
        noFlightsMessage.textContent = 'No flights available for this leg.';
        flightsList.appendChild(noFlightsMessage);
        return; // Exit the function if no flights are available
    }

    const legHeader = document.createElement('h3');
    legHeader.textContent = `Flights from ${leg.source} to ${leg.destination}`;
    flightsList.appendChild(legHeader);


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
      
        flightItem.querySelector('.select-flight').addEventListener('click', () => {
            // Move to the next leg when "Select Flight" is clicked
            const selectedFlight = flight; // Capture the specific flight

            // Find the index of the selected flight in the current leg's flights
            const flightIndex = leg.flights.indexOf(selectedFlight);
            console.log("!!!!!!!!!!!!selected flight flightstart", selectedFlight.flightStart)
            console.log("selectedFlight:", selectedFlight);
            console.log("flightIndex", flightIndex);

         //   const flightStartUnix_1 = calculateFlightStartUnix(selectedFlight)
          //  const flightEndUnix_1 = calculateFlightStartUnix(selectedFlight)

            
console.log("Accessing flightStartUnix from another script:", flightStartUnix_1);
console.log("Accessing flightEndUnix from another script:", flightEndUnix_1);
            currentLegIndex++;
            console.log("currentlegindex muutuja", currentLegIndex)
            // if (showInfoLaterThan > flight.flightStart) {}


            // Check if there is a next leg, and display its flights
            if (currentLegIndex < flightsForLegs.length) {
                displayFlightsForLegs(flightsForLegs[currentLegIndex]);
                console.log("hei vaata siia", flightIndex)

            }
        });
        console.log("TTTTTTTTT/n",flight.flightEnd)
        if (customFormatToUnixTimestamp(flight.flightEnd) < convertToUnixTimestamp(flightStartUnix_1)) {
            console.log("<--------SIIN ON FLIGHTSTARTUNIX_1", flightStartUnix_1)
        flightsList.appendChild(flightItem);
        }
    });
}
let currentLegIndex = 0
function calculateFlightStartUnix(selectedFlight) {
    if (selectedFlight && selectedFlight.flightStart) {
        // Convert the flightStart to Unix timestamp as previously discussed
        const flightStartUnix = convertToUnixTimestamp(selectedFlight.flightStart);
        return flightStartUnix;
    }
    return null;
}

function updateFlightsList(selectedRoute, legs) {
    if (selectedRoute) {
        // Find flights for each leg of the selected route
        flightsForLegs = findFlightsForLegs(legs, selectedRoute);
        console.log("console", flightsForLegs)
        // Display flights for each leg
        displayFlightsForLegs(flightsForLegs[0]);
    } else {
        alert('Please select a route before proceeding.');
    }
}

// Call the fetchPlanets function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    

    // You can also call functions that use routeCheckbox_id2 here
    
    fetchPlanets();
    const findRoutesButton = document.getElementById('findRoutesButton');
    let nextButton = document.getElementById('proceedToProviders'); // Move the declaration of nextButton here

    async function fetchAndDisplayRoutes() {
        const sourcePlanetDropdown = document.getElementById('source-planet');
        const destinationPlanetDropdown = document.getElementById(
            'destination-planet'
        );
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
                outputDiv.innerHTML =
                    'No routes found between the selected source and destination.';
            } else {
                // Sort routes by distance in ascending order (default)
                routes.sort(
                    (a, b) => calculateTotalDistance(legs, a) - calculateTotalDistance(legs, b)
                );

                // Check if the user wants to sort in descending order
                if (document.getElementById('sort-descending').checked) {
                    routes.reverse();
                }

                //selectedroutesid = document.getElementById('proceedToProviders');

                
                selectedRoute = routes[0];
               
                console.log('Selected Route2:', selectedRoute);

                // Display the route options
                showRouteOptions(routes, legs);
            }
            nextButton = document.getElementById('proceedToProviders');
            nextButton.addEventListener('click', () => {
                //const checkedBoxId = SendRecSelRouteIndex();
                
                selectedRoute = routes[CheckedRouteArrIndex]; //selected route comes from function.js
                console.log("test1", routes[CheckedRouteArrIndex])
                console.log("test2", CheckedRouteArrIndex)
                if (selectedRoute) {
                    console.log('Next button clicked. Selected Route:', selectedRoute);
                   //console.log( getcheckedboxid())
                    
                    // Find flights for each leg of the selected route
                    const flightsForLegs = findFlightsForLegs(legs, selectedRoute);
                    displayFlightsForLegs(flightsForLegs)
                    updateFlightsList(selectedRoute, legs);
                } else {
                    alert('Please select a route before proceeding.');
                }
            });
        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }
    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
    document.getElementById('sort-ascending').addEventListener('change', fetchAndDisplayRoutes);
    document.getElementById('sort-descending').addEventListener('change', fetchAndDisplayRoutes);
    
});
function clearFlightsList() {
    const flightsList = document.getElementById('flights-list');
    flightsList.innerHTML = ''; // Clear existing flight data
}