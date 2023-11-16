import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

const allProviders = [];
const allFlightStarts = [];

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, options);
    return formattedDate;
}

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');
    const connectedFlightsTable = document.getElementById('connected-flights-table');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

    function findConnectedFlights(legs, routes) {
        const connectedFlights = [];
        let shortestRouteLength = Infinity;
    routes.forEach((route) => {
        if (route.length < shortestRouteLength) {
            shortestRouteLength = route.length;
        }
    });
    const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);
console.log("shortestroutes", shortestRoutes);
    shortestRoutes.forEach((route, routeIndex) => {
            const routeLegs = [];
 for (let i = 0; i < route.length - 1; i++) {
                const sourcePlanet = route[i];
                const destinationPlanet = route[i + 1];

                const validFlights = legs.filter(leg =>
                    leg.routeInfo.from.name === sourcePlanet &&
                    leg.routeInfo.to.name === destinationPlanet
                );
                if (validFlights.length > 0) {
                    routeLegs.push(validFlights);
                }
            }

            for (let i = 0; i < routeLegs.length - 1; i++) {
                const currentLeg = routeLegs[i];
                const nextLeg = routeLegs[i + 1];
                if (nextLeg) {
                const flightsMeetingCriteria = [];

                currentLeg.forEach(currentFlight => {
                    currentFlight.providers.forEach(currentProvider => {
                        const currentFlightEnd = new Date(currentProvider.flightEnd);
                        nextLeg.forEach(nextFlight => {
                            nextFlight.providers.forEach(nextProvider => {
                                const nextFlightStart = new Date(nextProvider.flightStart);
                                if (currentFlightEnd < nextFlightStart) {
                                    flightsMeetingCriteria.push({
                                        flight1: currentFlight,
                                        provider1: currentProvider,
                                        flight2: nextFlight,
                                        provider2: nextProvider,
                                    });
                                }
                            });
                        });
                    });
                });
               // console.log("routelegs", routeLegs);
               const offer1Array = [];
                routeLegs.forEach((leg, legIndex) => {
                    leg.forEach(providers => {
                    console.log("length", providers.providers.length);
                    for (let flightIndex = 0; flightIndex < providers.providers.length - 1; flightIndex++) {
                        const currentFlight = providers.providers[flightIndex];
                        const nextFlight = providers.providers[flightIndex + 1];
                        const currentFlightEnd = new Date(currentFlight.flightEnd);
                        const nextFlightStart = new Date(nextFlight.flightStart);
                        const currentFlightStart = new Date(currentFlight.flightStart);
                        const nextFlightEnd = new Date(nextFlight.flightEnd);
                        const currentName = providers.routeInfo.from.name
                        const nextName = providers.routeInfo.to.name

                       /* console.log("currentFlightEnd", currentFlightEnd );
                        console.log("nextFlightStart", nextFlightStart ); */

                        if (currentFlightEnd > nextFlightStart) {
                            console.log('Invalid flight sequence:');
                            // Handle the invalid sequence, for example, by skipping or marking it.
                        } else {
                            const offer1 = [
                                {
                                    currentName1: currentName,
                                    current1: currentFlight,
                                    departure1: currentFlightStart,
                                    arrival1: currentFlightEnd
                                },
                                {
                                    nextName2: nextName,
                                    next2: nextFlight,
                                    departure2: nextFlightStart,
                                    arrival2: nextFlightEnd
                                }
                            ]
                            offer1Array.push(offer1); // Store offer1 in the array

                            if (offer1Array.length > 1) {
                                const previousOffer1 = offer1Array[offer1Array.length - 2];
                                const currentOffer1 = offer1;
                            }
                        }
                    }
                })
                });
                console.log(`Connected Flights for Route ${routeIndex + 1} Leg ${i + 1}:`, flightsMeetingCriteria);
                connectedFlights.push(flightsMeetingCriteria); // see kuvab front-endis lendude listi
                 } }
        });

        return connectedFlights;
    }
    

    function findAndAddConsecutiveFlights(routeLegs, shortestRoutes) {
        const connectedFlights = findConnectedFlights(routeLegs, shortestRoutes);

        connectedFlights.forEach((offersForLegs) => {
            console.log("connectedflights", connectedFlights);
            const combinedOffers = [];

            offersForLegs.forEach(criteria => {
                const sourcePlanet = criteria.flight1.routeInfo.from.name;
                const destinationPlanet = criteria.flight2.routeInfo.to.name;

                combinedOffers.push({
                    source: sourcePlanet,
                    destination: destinationPlanet,
                    offer: [
                        {
                            flight: criteria.flight1,
                            provider: criteria.provider1,
                        },
                        {
                            flight: criteria.flight2,
                            provider: criteria.provider2,
                        },
                    ],
                });

            });
       //     console.log("combinedoffersoffer--------", offersForLegs);

            combinedOffers.forEach((offer, index) => {
                displayCombinedFlight(offer, index);
           //    console.log("combinedoffers", offer, index);
            });
        });
    }

function displayCombinedFlight(offer, index) {
    const offerContainer = document.createElement('div');
    offerContainer.classList.add('offer-container');

    const sourcePlanetName = offer.source;
    const destinationPlanetName = offer.destination;
    
    const sourceElement = document.createElement('span');
    sourceElement.classList.add('flight-info');
    sourceElement.textContent = `Source: ${sourcePlanetName}`;

    const destinationElement = document.createElement('span');
    destinationElement.classList.add('flight-info');
    destinationElement.textContent = `Destination: ${destinationPlanetName}`;

    const flightNames = document.createElement('span');
    flightNames.classList.add('flight-info');
    flightNames.textContent = `Travelling with ${getFlightCompanyName(offer, 0)} and ${getFlightCompanyName(offer, 1)}`;

    const totalPriceElement = document.createElement('span');
    totalPriceElement.classList.add('flight-info');
    totalPriceElement.textContent = `Price for flight: ${getTotalPrice(offer)}`;

    const departureTime = document.createElement('span');
    departureTime.classList.add('flight-info');
    departureTime.textContent = `Departure ${formatDate(offer.offer[0].provider.flightStart)}`;

    const arrivalTime = document.createElement('span');
    arrivalTime.classList.add('flight-info');
    arrivalTime.textContent = `Arrival ${formatDate(offer.offer[1].provider.flightEnd)}`;

    const date1 = new Date(offer.offer[0].provider.flightStart);
    const date2 = new Date(offer.offer[1].provider.flightEnd);
    const timeDifference = date2 - date1;

    // Convert milliseconds to days, hours, minutes, and seconds
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 60 * millisecondsInSecond;
    const millisecondsInHour = 60 * millisecondsInMinute;
    const millisecondsInDay = 24 * millisecondsInHour;
    let timeRemaining = timeDifference;
    const days = Math.floor(timeRemaining / millisecondsInDay);
    timeRemaining %= millisecondsInDay;
    const hours = Math.floor(timeRemaining / millisecondsInHour);
    timeRemaining %= millisecondsInHour;
    const minutes = Math.floor(timeRemaining / millisecondsInMinute);
    timeRemaining %= millisecondsInMinute;
    const seconds = Math.floor(timeRemaining / millisecondsInSecond);

    const duration = document.createElement('span');
    duration.classList.add('flight-info');
    duration.textContent = `Duration: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    offerContainer.appendChild(sourceElement);
    offerContainer.appendChild(destinationElement);
    offerContainer.appendChild(flightNames);
    offerContainer.appendChild(totalPriceElement);
    offerContainer.appendChild(departureTime);
    offerContainer.appendChild(arrivalTime);
    offerContainer.appendChild(duration);

    connectedFlightsTable.appendChild(offerContainer);
}

function getFlightCompanyName(offer, index) {
    if (offer.offer[index] && offer.offer[index].flight && offer.offer[index].provider.company && offer.offer[index].provider.company.name) {
        return offer.offer[index].provider.company.name;
    }
    return 'Unknown Company';
}

function getTotalPrice(offer) {
    if (offer.offer[0] && offer.offer[1] && offer.offer[0].provider && offer.offer[1].provider) {
        return offer.offer[0].provider.price + offer.offer[1].provider.price;
    }
    return 0;
}

    async function fetchAndDisplayRoutes() {
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
            const legs = data.legs;
            const routes = findRoutes(legs, sourceName, destinationName);

            findAndAddConsecutiveFlights(legs, routes);

        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }

    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});


---------------------------------------------09.11

import { fetchPlanets, findRoutes } from './function.js';

const API = 'http://localhost:5001/api/v1.0/TravelPrices';

document.addEventListener('DOMContentLoaded', () => {
    const sourcePlanetDropdown = document.getElementById('source-planet');
    const destinationPlanetDropdown = document.getElementById('destination-planet');
    const findRoutesButton = document.getElementById('findRoutesButton');

    fetchPlanets(sourcePlanetDropdown, destinationPlanetDropdown);

    function displayRoutes(routes) {
        const routeResults = document.getElementById('route-results');
        routeResults.innerHTML = ''; // Clear previous results

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
    async function fetchAndDisplayRoutes() {
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
            const legs = data.legs;
            const routes = findRoutes(legs, sourceName, destinationName);
            const shortestRouteLength = Math.min(...routes.map((route) => route.length));
            const shortestRoutes = routes.filter((route) => route.length === shortestRouteLength);

            // Display the found routes
            displayRoutes(shortestRoutes);

            // Now, calculate connected flights
            const connectedFlights = findConnectedFlights(legs, shortestRoutes);

// ...
connectedFlights.forEach((stepFlights, routeIndex) => {
    const routeDetails = [];

    for (let step = 0; step < stepFlights.length; step++) {
        const currentStep = stepFlights[step];
        const route = [];

        for (const currentFlight of currentStep) {
            route.push({
                from: currentStep[0].routeInfo.from.name,
                to: currentStep[0].routeInfo.to.name,
                providers: currentStep[0].providers,
            });
        }

        routeDetails.push(route);
    }

    if (routeDetails.length > 0) {
        console.log(`Route ${routeIndex + 1}:`);
        routeDetails.forEach((route, stepIndex) => {
            console.log(`Step ${stepIndex + 1} flights:`);
            route.forEach((flight, legIndex) => {
                console.log(`Leg ${legIndex + 1}: from ${flight.from} to ${flight.to}`);
                flight.providers.forEach(provider => {
                    console.log(`  - From ${flight.from} to ${flight.to}`);
                    console.log(`  - Step: ${new Date(provider.flightStart).toDateString()} to ${new Date(provider.flightEnd).toDateString()}`);
                });
            });
        });
    }
});

                                    
            // Loop through the successfulFlights array and display flights
    } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }
    
    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});
