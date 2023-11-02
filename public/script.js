import { fetchPlanets, findRoutes, findFlightsBetweenPlanets } from './function.js';

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
                

                console.log(`Connected Flights for Route ${routeIndex + 1} Leg ${i + 1}:`, flightsMeetingCriteria);
              //  console.log(flightsMeetingCriteria);
              flightsMeetingCriteria.forEach(criteria => {
                const flightname1 =criteria.provider1.company.name;
                const flightname2 = criteria.provider2.company.name;

                const totalprice1 = criteria.provider1.price;
                const totalprice2 = criteria.provider2.price;
                const totalprice = totalprice1 + totalprice2;
                const flightstart1 = criteria.provider1.flightStart;
                const flightend2 = criteria.provider2.flightEnd
                const date1 = new Date(flightstart1);
                const date2 = new Date(flightend2);
                const timeDifference = date2 - date1;

                // Convert milliseconds to days, hours, minutes, and seconds
                const millisecondsInSecond = 1000;
                const millisecondsInMinute = 60 * millisecondsInSecond;
                const millisecondsInHour = 60 * millisecondsInMinute;
                const millisecondsInDay = 24 * millisecondsInHour;
                let timeRemaining = timeDifference
                const days = Math.floor(timeRemaining / millisecondsInDay);
                timeRemaining %= millisecondsInDay;
                const hours = Math.floor(timeRemaining / millisecondsInHour);
                timeRemaining %= millisecondsInHour;
                const minutes = Math.floor(timeRemaining / millisecondsInMinute);
                timeRemaining %= millisecondsInMinute;
                const seconds = Math.floor(timeRemaining / millisecondsInSecond);
                               /* console.log("Provider 1:", criteria.provider1);
                console.log("Provider 2:", criteria.provider2);*/
              /*  console.log("flightStart", criteria.provider1.flightStart)
                console.log("flightEnd", criteria.provider2.flightEnd) */
              /*  console.log("totalprice", totalprice1);
                console.log("totalprice2", totalprice2);
                console.log("total", totalprice1 + totalprice2);*/
               /* console.log("Flights leaving");
                console.log("Travelling with ", flightname1, "and ", flightname2);
                console.log("price for flight", totalprice);
                console.log("first flight leaves", date1, "and arrives ", date2);
                console.log(`Duration: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);*/

            });

                connectedFlights.push(flightsMeetingCriteria); // see kuvab front-endis lendude listi
            }
        });

        return connectedFlights;
    }
    

    function findAndAddConsecutiveFlights(routeLegs, shortestRoutes) {
        const connectedFlights = findConnectedFlights(routeLegs, shortestRoutes);

        connectedFlights.forEach((offersForLegs) => {
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
            console.log("combinedoffersoffer--------", offersForLegs);

            combinedOffers.forEach((offer, index) => {
                displayCombinedFlight(offer, index);
              //  console.log("combinedoffers", combinedOffers);
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