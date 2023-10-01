const axios = require('axios');
const fs = require('fs/promises');
const functions = require('./functions');
const readline = require('readline');

const API_BASE_URL = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices';

async function fetchPlanetsFromAPI() {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data; // Assuming the API returns an array of planets
    } catch (error) {
        console.error('Error fetching planets from the API:', error);
        return [];
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    functions.initializeReadline(rl);
    const pricelistHistory = [];
    functions.displayMenu(['Find Routes', 'View Pricelist History']);

    rl.question('Enter the number of the filter: ', async (selectedOptionIndex) => {
        if (selectedOptionIndex === '1') {
            // Option to find routes (existing functionality)
            // (Keep the existing code for finding routes here)
        } else if (selectedOptionIndex === '2') {
            // Option to view JSON files in the 'data' folder
            await functions.viewPricelistHistory(rl);
        } else {
            console.log('Invalid option selection.');
            rl.close();
        }

        // Rest of your existing code...
         try {
            const planets = await fetchPlanetsFromAPI();

            if (planets.length === 0) {
                console.log('No planets found.');
                rl.close();
                return;
            }

            console.log('Available Planets:');
            planets.forEach((planet, index) => {
                console.log(`${index + 1}. ${planet.name}`);
            });
    
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
                            `${index + 1}. ${route.join(
                                " -> "
                            )} (Total Distance: ${calculateTotalDistance(
                                legs,
                                route
                            )} km)`
                        );
                    });
    
                    rl.question(
                        "Choose a route (by number): ",
                        async (selectedRouteIndex) => {
                            const parsedRouteIndex = parseInt(
                                selectedRouteIndex
                            );
    
                            if (
                                !isNaN(parsedRouteIndex) &&
                                parsedRouteIndex >= 1 &&
                                parsedRouteIndex <= routes.length
                            ) {
                                const selectedRoute =
                                    routes[parsedRouteIndex - 1];
    
                                    async function processNextLeg(legIndex, selectedProviders, sortProvidersBy) {
                                        if (legIndex >= selectedRoute.length - 1) {
                                            // All legs of the route processed, make the reservation
                                            rl.question(
                                                "Enter your First Name: ",
                                                (firstName) => {
                                                    rl.question(
                                                        "Enter your Last Name: ",
                                                        (lastName) => {
                                                            functions.makeReservation(
                                                                selectedRoute,
                                                                selectedProviders,
                                                                firstName,
                                                                lastName
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                            return;
                                        }
                                    
                                        const sourceName = selectedRoute[legIndex];
                                        const destinationName = selectedRoute[legIndex + 1];
                                    
                                        const providersForLeg = functions.findProvidersForLeg(
                                            legs,
                                            sourceName,
                                            destinationName
                                        );
                                    
                                    if (providersForLeg.length === 0) {
                                        console.log(
                                            `No providers found for the leg: ${sourceName} -> ${destinationName}`
                                        );
                                        processNextLeg(
                                            legIndex + 1,
                                            selectedProviders
                                        );
                                        return;
                                    }
    
                                    rl.question(
                                        "Sort providers by (H)ighest to Lowest, (L)owest to Highest, or (D)o not sort: ",
                                        async (selectedSortOption) => {
                                            const sortOption =
                                                selectedSortOption.toLowerCase();
    
                                            if (sortOption === "d") {
                                                // No sorting
                                                console.log(
                                                    `Providers for Leg ${sourceName} -> ${destinationName} (Not Sorted):`
                                                );
                                                providersForLeg.forEach(
                                                    (provider, index) => {
                                                        console.log(
                                                            `${index + 1}. ${provider.name}: Price - ${provider.price}, Flight Time - ${provider.flightTime}`
                                                        );
                                                    }
                                                );
                                            } else if (
                                                sortOption === "h" ||
                                                sortOption === "l"
                                            ) {
                                                // Sort by price
                                                const sortDirection =
                                                    sortOption === "h"
                                                        ? "desc"
                                                        : "asc";
                                                const sortedProviders =
                                                    functions.sortProviders(
                                                        providersForLeg,
                                                        "price",
                                                        sortDirection
                                                    );
    
                                                console.log(
                                                    `Providers for Leg ${sourceName} -> ${destinationName} (Sorted by ${sortDirection.charAt(
                                                        0
                                                    ).toUpperCase()}${sortDirection.slice(
                                                        1
                                                    )} - Ascending):`
                                                );
                                                sortedProviders.forEach(
                                                    (provider, index) => {
                                                        console.log(
                                                            `${index + 1}. ${provider.name}: Price - ${provider.price}, Flight Start - ${provider.flightStart}, Flight End - ${provider.flightEnd}, Flight Time - ${provider.flightTime}`
                                                        );
                                                    }
                                                );
                                            } else {
                                                console.log(
                                                    "Invalid sorting option."
                                                );
                                            }
    
                                            rl.question(
                                                `Choose a provider for the leg ${sourceName} -> ${destinationName} (by number): `,
                                                async (
                                                    selectedProviderIndex
                                                ) => {
                                                    const parsedProviderIndex = parseInt(
                                                        selectedProviderIndex
                                                    );
    
                                                    if (
                                                        !isNaN(
                                                            parsedProviderIndex
                                                        ) &&
                                                        parsedProviderIndex >= 1 &&
                                                        parsedProviderIndex <=
                                                            providersForLeg.length
                                                    ) {
                                                        const selectedProvider =
                                                            providersForLeg[
                                                                parsedProviderIndex -
                                                                    1
                                                            ];
                                                        selectedProviders.push(
                                                            selectedProvider
                                                        );
    
                                                        processNextLeg(
                                                            legIndex + 1,
                                                            selectedProviders,
                                                            sortProvidersBy
                                                        ); // Pass sortProvidersBy
                                                    } else {
                                                        console.log(
                                                            "Invalid provider selection."
                                                        );
                                                        processNextLeg(
                                                            legIndex,
                                                            selectedProviders,
                                                            sortProvidersBy
                                                        ); // Pass sortProvidersBy
                                                    }
                                                }
                                            );
                                        }
                                    );
                                }
    
                                rl.question(
                                    "Sort providers by (P)rice, (N)ame, (F)light time, or (D)o not sort: ",
                                    async (selectedSortOption) => {
                                        const sortProvidersBy =
                                            selectedSortOption === "P"
                                                ? "price"
                                                : selectedSortOption === "N"
                                                ? "name"
                                                : selectedSortOption === "F"
                                                ? "flightTime"
                                                : "D";
                                        processNextLeg(
                                            0,
                                            [],
                                            sortProvidersBy
                                        ); // Pass sortProvidersBy
                                    }
                                );
                            } else {
                                console.log("Invalid route selection.");
                                rl.close();
                            }
                        }
                    );
                });
            });
        } catch (error) {
            console.error("Error fetching route data:", error);
            rl.close();
        }
    });
}

main();