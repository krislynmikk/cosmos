import { findRoutes, calculateTotalDistance } from './function.js';
const API = 'http://localhost:5001/api/v1.0/TravelPrices';
let selectedRoute = null; // To store the selected route

// Function to fetch planets and populate the dropdowns
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

// Function to show the provider list section
async function showProviderList() {
    const providerListSection = document.getElementById('provider-list-section');
    if (!providerListSection) {
        console.error('Element provider-list-section not found');
        return;
    }
    providerListSection.style.display = 'block'; // Show the provider-list section

    try {
        const response = await fetch(API); // Fetch providers from your API
        if (!response.ok) {
            throw new Error('Error fetching providers');
        }

        const data = await response.json();
        console.log('Parsed API Data (Providers):', data);

        // Assuming data.providers is an array of provider objects
        const providers = data.providers;
        // Sort providers based on the selected sorting criteria
        if (document.getElementById('sort-by').value === 'price') {
            providers.sort((a, b) => a.price - b.price);
        } else if (document.getElementById('sort-by').value === 'departure-time') {
            providers.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        } else if (document.getElementById('sort-by').value === 'flight-time') {
            providers.sort((a, b) => a.flightTime - b.flightTime);
        }

        // Display the sorted providers
        displayProviders(providers);
    } catch (error) {
        console.error('Error fetching and displaying providers:', error);
    }
}

// Call the fetchPlanets function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    fetchPlanets();
    const findRoutesButton = document.getElementById('findRoutesButton');

    async function fetchAndDisplayRoutes() {
        const sourcePlanetDropdown = document.getElementById('source-planet');
        const destinationPlanetDropdown = document.getElementById('destination-planet');
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

            if (routes.length === 0) {
                outputDiv.innerHTML = 'No routes found between the selected source and destination.';
            } else {
                // Sort routes by distance in ascending order (default)
                routes.sort((a, b) => calculateTotalDistance(legs, a) - calculateTotalDistance(legs, b));

                // Check if the user wants to sort in descending order
                if (document.getElementById('sort-descending').checked) {
                    routes.reverse();
                }

                outputDiv.innerHTML = 'Routes found:<br>';
                routes.forEach((route, index) => {
                    const totalDistance = calculateTotalDistance(legs, route);
                    outputDiv.innerHTML += `${index + 1}. ${route.join(' -> ')} (Distance: ${totalDistance} km)<br>`;
                });

                // Display the route options
                showRouteOptions(routes);
            }
        } catch (error) {
            console.error('Error fetching and displaying routes:', error);
        }
    }

    // Function to display route options
    function showRouteOptions(routes) {
        const routeOptionsDiv = document.getElementById('route-options');
        if (!routeOptionsDiv) {
            console.error('Element route-options not found');
            return;
        }
        routeOptionsDiv.innerHTML = '';

        routes.forEach((route, index) => {
            const routeOption = document.createElement('div');
            routeOption.textContent = route.join(' -> ');
            routeOption.classList.add('route-options');

            // Add a click event listener to each route option
            routeOption.addEventListener('click', () => {
                selectedRoute = route;
                showProviderList();
            });

            routeOptionsDiv.appendChild(routeOption);
        });
    }

    // Add an event listener to the "Find Routes" button
    findRoutesButton.addEventListener('click', fetchAndDisplayRoutes);
});


_______________

const fs = require("fs/promises");
const functions = require("./functions");
const readline = require("readline");
const axios = require('axios');

const API_BASE_URL = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices';

async function fetchProvidersForPreferredRoute(legs, preferredRoute) {
    const providerNames = [];

    for (const leg of legs) {
        if (leg.providers && Array.isArray(leg.providers)) {
            for (const provider of leg.providers) {
                if (provider.company && provider.company.name) {
                    providerNames.push(provider.company.name);
                }
            }
        }
    }

    const filteredProviders = providerNames.filter((provider) => preferredRoute.includes(provider));
    return filteredProviders;
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    functions.initializeReadline(rl);
    const pricelistHistory = [];
    functions.displayMenu(["Find Routes", "View Pricelist History"]);

    rl.question("Enter the number of the filter: ", async (selectedOptionIndex) => {
        if (selectedOptionIndex === "1") {
            // Option to find routes (existing functionality)
            // (Keep the existing code for finding routes here)
        } else if (selectedOptionIndex === "2") {
            // Option to view JSON files in the 'data' folder
            await functions.viewPricelistHistory(rl);
        } else {
            console.log("Invalid option selection.");
            rl.close();
        }

        try {
            const apiResponse = await axios.get(API_BASE_URL);
            const legs = apiResponse.data.legs;

            rl.question("Enter the source planet: ", (sourceName) => {
                rl.question("Enter the destination planet: ", (destinationName) => {
                    const routes = functions.findRoutes(sourceName, destinationName, legs);

                    if (routes.length === 0) {
                        console.log("No routes found.");
                        rl.close();
                        return;
                    }

                    const calculateTotalDistance = functions.calculateTotalDistance;
                    console.log("Available Routes:");

                    routes.forEach((route, index) => {
                        console.log(
                            `${index + 1}. ${route.join(" -> ")} (Total Distance: ${calculateTotalDistance(legs, route)} km)`
                        );
                    });

                    rl.question("Choose a route (by number): ", async (selectedRouteIndex) => {
                        const parsedRouteIndex = parseInt(selectedRouteIndex);

                        if (
                            !isNaN(parsedRouteIndex) &&
                            parsedRouteIndex >= 1 &&
                            parsedRouteIndex <= routes.length
                        ) {
                            const selectedRoute = routes[parsedRouteIndex - 1];

                            async function processNextLeg(legIndex, selectedProviders, sortProvidersBy) {
                                if (legIndex >= selectedRoute.length - 1) {
                                    rl.question("Enter your First Name: ", (firstName) => {
                                        rl.question("Enter your Last Name: ", (lastName) => {
                                            functions.makeReservation(selectedRoute, selectedProviders, firstName, lastName);
                                        });
                                    });
                                    return;
                                }

                                const sourceName = selectedRoute[legIndex];
                                const destinationName = selectedRoute[legIndex + 1];
                                const providersForLeg = functions.findProvidersForLeg(legs, sourceName, destinationName);

                                if (providersForLeg.length === 0) {
                                    console.log(`No providers found for the leg: ${sourceName} -> ${destinationName}`);
                                    processNextLeg(legIndex + 1, selectedProviders);
                                    return;
                                }

                                rl.question("Sort providers by (H)ighest to Lowest, (L)owest to Highest, or (D)o not sort: ", async (selectedSortOption) => {
                                    const sortOption = selectedSortOption.toLowerCase();

                                    if (sortOption === "d") {
                                        console.log(`Providers for Leg ${sourceName} -> ${destinationName} (Not Sorted):`);
                                        providersForLeg.forEach((provider, index) => {
                                            console.log(`${index + 1}. ${provider.name}: Price - ${provider.price}, Flight Time - ${provider.flightTime}`);
                                        });
                                    } else if (sortOption === "h" || sortOption === "l") {
                                        const sortDirection = sortOption === "h" ? "desc" : "asc";
                                        const sortedProviders = functions.sortProviders(providersForLeg, "price", sortDirection);

                                        console.log(`Providers for Leg ${sourceName} -> ${destinationName} (Sorted by ${sortDirection.charAt(0).toUpperCase()}${sortDirection.slice(1)} - Ascending):`);

                                        sortedProviders.forEach((provider, index) => {
                                            console.log(`${index + 1}. ${provider.name}: Price - ${provider.price}, Flight Start - ${provider.flightStart}, Flight End - ${provider.flightEnd}, Flight Time - ${provider.flightTime}`);
                                        });
                                    } else {
                                        console.log("Invalid sorting option.");
                                    }

                                    rl.question(`Choose a provider for the leg ${sourceName} -> ${destinationName} (by number): `, async (selectedProviderIndex) => {
                                        const parsedProviderIndex = parseInt(selectedProviderIndex);

                                        if (
                                            !isNaN(parsedProviderIndex) &&
                                            parsedProviderIndex >= 1 &&
                                            parsedProviderIndex <= providersForLeg.length
                                        ) {
                                            const selectedProvider = providersForLeg[parsedProviderIndex - 1];
                                            selectedProviders.push(selectedProvider);

                                            processNextLeg(legIndex + 1, selectedProviders, sortProvidersBy);
                                        } else {
                                            console.log("Invalid provider selection.");
                                            processNextLeg(legIndex, selectedProviders, sortProvidersBy);
                                        }
                                    });
                                });
                            }

                            rl.question("Sort providers by (P)rice, (N)ame, (F)light time, or (D)o not sort: ", async (selectedSortOption) => {
                                const sortProvidersBy = selectedSortOption === "P" ? "price" : selectedSortOption === "N" ? "name" : selectedSortOption === "F" ? "flightTime" : "D";
                                processNextLeg(0, [], sortProvidersBy);
                            });

                        } else {
                            console.log("Invalid route selection.");
                            rl.close();
                        }
                    });
                });
            });

        } catch (error) {
            console.error("Error fetching route data:", error);
            rl.close();
        }
    });
}

main();
