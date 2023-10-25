import { findFlightsForLegs /* other functions you need */ } from './script3.js'

let CheckedRouteArrIndex //variable for script.js to show selecter route detailed information
let selectedRouteIndex = null;
let selectedFlights = []
let flightEndUnix_1
let flightStartUnix_1
let flightEndUnix
let flightStartUnix
let leg
const API = 'http://localhost:5001/api/v1.0/TravelPrices';


function convertToUnixTimestamp(iso8601Date) {
    const date = new Date(iso8601Date);
    const unixTimestamp = date.getTime();
    return unixTimestamp;
  }

function calculateTotalDistance(legs, route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const sourceName = route[i];
        const destinationName = route[i + 1];
        leg = legs.find(
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
                 flightStartUnix = new Date(provider.flightStart).getTime();
                 flightEndUnix = new Date(provider.flightEnd).getTime();
                // Check if the flight starts after the previous flight ends
                // console.log(customFormatToUnixTimestamp(provider.flightStart))
                if (flightStartUnix >= previousFlightEnd) {
                    // Update the previousFlightEnd to the current flight's end time
                 //   previousFlightEnd = flightEndUnix; <----- kuvab järgmine lend algab peale eelmise lõppu

                    return true;
                }

                return false;
            });

            // Add the filtered providers to the list
            filteredProviders.forEach((provider) => {
                 flightStartUnix = new Date(
                    provider.flightStart
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                 flightEndUnix = new Date(
                    provider.flightEnd
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                const flightTimeInSeconds =
                    (flightEndUnix - flightStartUnix) / 1000; // Calculate flight time in seconds
                // Calculate days, hours, minutes, and seconds
                const secondsInMinute = 60;
                const minutesInHour = 60;
                const hoursInDay = 24;
                // console.log("!???????????????", provider.flightStart)
 flightStartUnix_1 = convertToUnixTimestamp(provider.flightStart);
 flightEndUnix_1 = convertToUnixTimestamp(provider.flightEnd);
 
 //console.log("KATSETUS", flightEndUnix_1, flightStartUnix_1)

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
                // console.log("-------------------------------------aeg" , flightEndUnix, formattedFlightEnd)

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

function calculateRouteInfo(selectedFlights, legs) {
  let totalPrice = 0;
  let totalDistance = 0;
  let totalTravelTime = 0;
  const routeStops = [];

  for (let i = 0; i < selectedFlights.length; i++) {
    const flight = selectedFlights[i];

    // Calculate total price
    totalPrice += flight.price;
    console.log('Legs:', legs);
    console.log('Flight:', flight);
    console.log("routeinfo.from", flight.name)
    // Find the corresponding leg based on source and destination
    const matchingLeg = legs.find((leg) =>
    leg.routeInfo && flight.routeInfo &&
    leg.routeInfo.from && flight.routeInfo.from &&
    leg.routeInfo.to && flight.routeInfo.to &&
    leg.routeInfo.from.name === flight.routeInfo.from.name &&
    leg.routeInfo.to.name === flight.routeInfo.to.name
  );
 // console.log("routeinfo flight", matchingLeg)
    if (matchingLeg) {
      // Calculate total distance
      totalDistance += matchingLeg.routeInfo.distance;
      // Calculate total travel time
      totalTravelTime += flightEndUnix - flightStartUnix;
      // Add source and destination to routeStops
      routeStops.push(flight.routeInfo.from.name);
      routeStops.push(flight.routeInfo.to.name);
      
    }
  }

  // Create an array of unique route stops
  const uniqueStops = [...new Set(routeStops)];


  return { totalPrice, totalDistance, totalTravelTime, routeStops: uniqueStops };
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
        
        routeCheckbox.value = route.join(' -> ');
        // Create a label for the checkbox with route details
        const routeLabel = document.createElement('label');
        routeLabel.textContent = `${route.join(' -> ')} (Distance: ${totalDistance} km)`;
        routeLabel.setAttribute('for', `route-checkbox-${index}`);

        // Add a click event listener to the container to handle route selection
        routeOptionContainer.addEventListener('click', () => {
            const routeCheckbox = document.getElementById(`route-checkbox-${index}`);
        
            if (CheckedRouteArrIndex !== null && CheckedRouteArrIndex !== index) {
                const previouslySelectedCheckbox = document.getElementById(`route-checkbox-${CheckedRouteArrIndex}`);
                if (previouslySelectedCheckbox) {
                    previouslySelectedCheckbox.checked = false;
                }
                selectedRouteIndex = null;
                selectedFlights.length = 0; // Clear selected flights when selecting a new route
            }
        
            CheckedRouteArrIndex = index;
            routeCheckbox.checked = !routeCheckbox.checked;
        
            if (routeCheckbox.checked) {
                selectedRouteIndex = index;
                selectedFlights.length = 0; // Initialize selected flights for the new route
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
   /* nextButton.addEventListener('click', () => {
        const selectedCheckbox = document.getElementById(`route-checkbox-${CheckedRouteArrIndex}`);

        if (selectedCheckbox && selectedCheckbox.checked) {  
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
                // console.log('Received data from API:', data); 
                // Call a function to display the flight data
                displayFlights(data.legs, sourceName, destinationName);
            })
            .catch(error => {
                console.error('Error fetching flight data:', error);
            });
            
        } else {
            alert('Please select a route before proceeding.');
        }
    }); */ 
    nextButton.addEventListener('click', () => {
        const selectedCheckbox = document.getElementById(`route-checkbox-${CheckedRouteArrIndex}`);
    
        if (selectedCheckbox && selectedCheckbox.checked) {
            const selectedRoute = routes[CheckedRouteArrIndex]; // Get the selected route
            const routeLegs = [];
    
            // Loop through the selected route and collect all legs
            for (let i = 0; i < selectedRoute.length - 1; i++) {
                const sourceName = selectedRoute[i];
                const destinationName = selectedRoute[i + 1];
    
                const leg = legs.find((leg) =>
                    leg.routeInfo.from.name === sourceName && leg.routeInfo.to.name === destinationName
                );
    
                if (leg) {
                    routeLegs.push(leg);
                }
            }
    
            // Check that the flights are connected based on time
            let isRouteValid = true;
    
            for (let i = 0; i < routeLegs.length - 1; i++) {
                const currentLeg = routeLegs[i];
                const nextLeg = routeLegs[i + 1];
                console.log("currentLeg", currentLeg)

                const currentLegEndTime = new Date(currentLeg.providers[0].flightEnd).getTime();
                const nextLegStartTime = new Date(nextLeg.providers[0].flightStart).getTime();
                console.log("nextLegStartTime", nextLegStartTime)

                if (currentLegEndTime > nextLegStartTime) {
                    isRouteValid = false;
                    break;
                }
            }
    
            if (isRouteValid) {
                // Calculate the total price for the entire route
                const totalPrice = routeLegs.reduce((total, leg) => total + leg.providers[0].price, 0);
    console.log("totalprice", isRouteValid)
                // Display the total price in your HTML
                const totalPriceElement = document.createElement('p');
                totalPriceElement.textContent = `Total Price: $${totalPrice}`;
                routeOptionsDiv.appendChild(totalPriceElement);
            } else {
                alert('Flights in the route are not connected based on time. Please select a valid route.');
            }
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
    // console.log('Displaying Providers:', provider);
}


function fetchPlanets() {
    // console.log('Fetching planets...');

    // Fetch data from your API endpoint (replace with your actual endpoint)
    fetch('/api/fetchPlanetsFromAPI')
        .then(response => response.json())
        .then(data => {
            // console.log('Received planet data:', data);

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


export { findRoutes, calculateTotalDistance, fetchPlanets, displayProviders, showRouteOptions, findProvidersForLeg, CheckedRouteArrIndex,  flightStartUnix_1, flightEndUnix_1, calculateRouteInfo};
