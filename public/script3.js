import {findRoutes, calculateTotalDistance, showRouteOptions, fetchPlanets, findProvidersForLeg, CheckedRouteArrIndex,  flightStartUnix_1, flightEndUnix_1, calculateRouteInfo } from './function2.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';
let selectedRoute = null; // To store the selected route
let flightsForLegs = null;
let flightStartUnix_2
let flightEndUnix_2
let selectedRouteIndex = null;
let leg
const selectedFlights = []; // To store selected flights in the selected route

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
 // // console.log(unixTimestamp);

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
function findConnectedFlights(selectedRoute, legs) {
    const connectedFlights = [];
    let previousFlightEnd = 0;

    for (let i = 0; i < selectedRoute.length - 1; i++) {
        const sourceName = selectedRoute[i];
        const destinationName = selectedRoute[i + 1];

        // Debugging: Check the content of the legs

        // Debugging: Check if the legs data contains the expected route information
        const legFlights = findFlightsForLegs(legs, [sourceName, destinationName]);

        if (i === 0) {
            // For the first flight, set flightStart to 0
            legFlights.forEach((flight) => {
                flight.flightStart = 0;
            });
            connectedFlights.push(...legFlights);
        } else {
            // Check if the legFlights array is not empty
            if (legFlights.length > 0) {
                legFlights.forEach((flight) => {
                    // Set flightStart to the sum of the previous flight's flightEnd and this flight's flightStart
                    flight.flightStart = previousFlightEnd + new Date(flight.flightStart) - new Date(legFlights[0].flightStart);
                });
                connectedFlights.push(...legFlights);
            } else {
                // Handle the case when legFlights is empty
                console.log("Invalid legFlights for", sourceName, "to", destinationName);
                break;
            }
        }

        // Update the previousFlightEnd to the end time of the last flight in this segment
        previousFlightEnd = new Date(connectedFlights[connectedFlights.length - 1].flights[0].flightEnd);
    }

    return connectedFlights;
}

// Create a function to calculate the combined offer
function calculateCombinedOffer(connectedFlights) {
    const totalPrice = connectedFlights.reduce((total, flight) => total + flight.price, 0);
    const totalFlightTime = connectedFlights.reduce((total, flight) => total + flight.flightTimeInSeconds, 0);
    const providerNames = connectedFlights.map((flight) => flight.name);

    return { totalPrice, totalFlightTime, providerNames };
}

function displayCombinedOffer(selectedRoute, connectedFlights) {
    console.log('Here is the combined offer for the entire route:');
    console.log('Selected Route:', selectedRoute);

    for (let i = 0; i < selectedRoute.length - 1; i++) {
        const sourceName = selectedRoute[i];
        const destinationName = selectedRoute[i + 1];

        console.log('Flight ' + (i + 1) + ':');
        console.log('Source:', sourceName);
        console.log('Destination:', destinationName);
        console.log("connectedFlights[i]", connectedFlights[i]);
        console.log("connectedFlights[i + 1]", connectedFlights[i + 1]);
        console.log("connectedFlights.flights", connectedFlights[i].flights);
        console.log("connectedFlights.source", connectedFlights[i + 1].source);



        // Find the relevant flight for the current segment
let currentFlight = null;  // Initialize currentFlight as null

for (let i = 0; i < connectedFlights.length; i++) {
    const flight = connectedFlights[i];
    console.log("currentFlight",flight);
    console.log("flight.source", flight.source)

    if (flight.source === sourceName && flight.destination === destinationName) {
        currentFlight = flight;

        break;  // Exit the loop once a matching flight is found
    }
}

if (currentFlight) {
    // You have found the current flight, and you can work with it here
    console.log('Provider:', currentFlight.provider.company.name);
    console.log('Price: $' + currentFlight.provider.price);
    console.log('Flight Time:', currentFlight.flightTime);
} else {
    // Handle the case when no matching flight is found
    console.log('No matching flight found for', sourceName, 'to', destinationName);
}

    }

    // Calculate the total price for the entire route
    const totalPrice = connectedFlights.reduce((total, flight) => total + flight.price, 0);

    console.log('Total Price: $' + totalPrice);
}

function formatFlightTime(seconds) {
    // Format seconds into days, hours, minutes, and seconds
    const days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
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
             console.log("!!!!!!!!!!!!selected flight flightend", selectedFlight.flightEnd)
             console.log("!!!!!!!!!!!!selected flight flightstartunix", customFormatToUnixTimestamp(selectedFlight.flightStart))
             console.log("!!!!!!!!!!!!selected flight flightendunix", customFormatToUnixTimestamp(selectedFlight.flightEnd))
            // console.log("selectedFlight:", selectedFlight);
            // console.log("flightIndex", flightIndex);

           flightStartUnix_2 = customFormatToUnixTimestamp(selectedFlight.flightStart)
            flightEndUnix_2 = customFormatToUnixTimestamp(selectedFlight.flightEnd)

            selectedFlights.push(selectedFlight);

// Calculate the route-level information

const apiUrl = API;

// Make an HTTP GET request to your API
fetch(apiUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // Assuming that your API response contains the 'legs' array
    const legs = data.legs;

    // Now you have the 'legs' data, and you can use it as an argument for your functions.
    const routeInfo = calculateRouteInfo(selectedFlights, legs);
    console.log("wwwwwwwwwwwwwwwwwww", routeInfo);
    // Do whatever you need with 'routeInfo' here.
  })
  .catch((error) => {
    console.error('Error:', error);
  });


// Now, you can display or use 'routeInfo' as needed

// console.log("Accessing flightStartUnix from another script:", flightStartUnix_1);
// console.log("Accessing flightEndUnix from another script:", flightEndUnix_1);
            currentLegIndex++;
            // console.log("currentlegindex muutuja", currentLegIndex)
            // if (showInfoLaterThan > flight.flightStart) {}


            // Check if there is a next leg, and display its flights
            if (currentLegIndex < flightsForLegs.length) {
                displayFlightsForLegs(flightsForLegs[currentLegIndex]);
                // console.log("hei vaata siia", flightIndex)

            }
        });
        console.log(flightStartUnix_2)
        console.log(flightEndUnix_2)
    //    // console.log("TTTTTTTTT/n",customFormatToUnixTimestamp(flight.flightEnd))
     //   // console.log("<--------SIIN ON FLIGHTSTARTUNIX_1", flightStartUnix_1)
     if (flightEndUnix_2 == undefined) {
     flightsList.appendChild(flightItem);
     }else {
     if (flightEndUnix_2 < customFormatToUnixTimestamp(flight.flightStart)) { // see on lendude kuvamises kellaajaga korrelatsioonis
            
            

        flightsList.appendChild(flightItem);
       }
 
       }
       
    });
}
let currentLegIndex = 0


function updateFlightsList(selectedRoute, legs) {
    if (selectedRoute) {
        // Find flights for each leg of the selected route
        flightsForLegs = findFlightsForLegs(legs, selectedRoute);
        // console.log("console", flightsForLegs)
        // Display flights for each leg
        displayFlightsForLegs(flightsForLegs[0]);
    } else {
        alert('Please select a route before proceeding.');
    }
}

function displayConnectedFlights(connectedFlights) {
    const connectedFlightsList = document.getElementById('flights-list');

    // Clear the existing list
    connectedFlightsList.innerHTML = '';

    if (connectedFlights.length === 0) {
        const noFlightsMessage = document.createElement('p');
        noFlightsMessage.textContent = 'No connected flights available for this route.';
        connectedFlightsList.appendChild(noFlightsMessage);
        return;
    }

    // Loop through each connected flight segment
    connectedFlights.forEach((segment, index) => {
        // Create a container for the segment
        const segmentContainer = document.createElement('div');
        segmentContainer.classList.add('connected-segment');

        // Create a header for the segment (source to destination)
        const segmentHeader = document.createElement('h3');
        segmentHeader.textContent = `${segment.source} to ${segment.destination}`;
        segmentContainer.appendChild(segmentHeader);

        // Create a list for the flights in this segment
        const segmentFlightsList = document.createElement('ul');
        segmentFlightsList.classList.add('segment-flights-list');

        // Loop through each flight in the segment
        segment.flights.forEach((flight) => {
            const flightItem = document.createElement('li');
            flightItem.classList.add('flight-item');

            // Display flight details
            flightItem.innerHTML = `
                <div class="flight-details">
                    <span class="flight-info">Provider: ${flight.name}</span>
                    <span class="flight-info">Price: ${flight.price}</span>
                    <span class="flight-info">Flight Time: ${flight.flightTime}</span>
                    <span class="flight-info">Departure Time: ${flight.flightStart}</span>
                    <span class="flight-info">Flight End: ${flight.flightEnd}</span>
                </div>
            `;

            segmentFlightsList.appendChild(flightItem);
        });

        segmentContainer.appendChild(segmentFlightsList);
        connectedFlightsList.appendChild(segmentContainer);
    });
}

// Call the fetchPlanets function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOMContentLoaded event fired.');
   // flightEndUnix_2 = flightEndUnix_1
   // flightStartUnix_2 = flightStartUnix_1

    // You can also call functions that use routeCheckbox_id2 here
    
fetchPlanets();
    const findRoutesButton = document.getElementById('findRoutesButton');
    let nextButton = document.getElementById('proceedToProviders'); // Move the declaration of nextButton here

async function fetchAndDisplayRoutes() {
        const sourcePlanetDropdown = document.getElementById('source-planet');
        const destinationPlanetDropdown = document.getElementById('destination-planet');
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
            // console.log('Parsed API Data:', data);

            const legs = data.legs;
            const routes = findRoutes(legs, sourceName, destinationName);
            // console.log('Fetched Legs:', legs);
            // // console.log('Found Routes:', routes);

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
                // // console.log('Selected Route2:', selectedRoute);

                // Display the route options
                showRouteOptions(routes, legs);
            }
            nextButton = document.getElementById('proceedToProviders');
            nextButton.addEventListener('click', async () => {
                if (CheckedRouteArrIndex !== null) {
                     
                    const connectedFlights = findConnectedFlights(selectedRoute, legs);
                    flightsForLegs = findFlightsForLegs(legs, selectedRoute);
                    displayConnectedFlights(connectedFlights);
                    displayCombinedOffer(connectedFlights, flightsForLegs);
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

export { findFlightsForLegs, /* other functions you want to use */ };