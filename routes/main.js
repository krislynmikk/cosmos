const fs = require("fs/promises");
const functions = require("./functions");
const readline = require("readline");
const axios = require('axios');

const API_BASE_URL = 'https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices';

async function fetchRoutes(sourceName, destinationName) {
    try {
        const apiResponse = await axios.get(API_BASE_URL);
        const legs = apiResponse.data.legs;
        const routes = functions.findRoutes(sourceName, destinationName, legs);
        return { legs, routes };
    } catch (error) {
        throw new Error('Error fetching route data from API:', error);
    }
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
            try {
                rl.question("Enter the source planet: ", async (sourceName) => {
                    rl.question("Enter the destination planet: ", async (destinationName) => {
                        const { legs, routes } = await fetchRoutes(sourceName, destinationName);

                        if (!routes.length) {
                            console.log("No routes found.");
                            rl.close();
                            return;
                        }

                        console.log("Available Routes:");
                        routes.forEach((route, index) => console.log(
                            `${index + 1}. ${route.join(" -> ")} (Total Distance: ${functions.calculateTotalDistance(legs, route)} km)`
                        ));

                        rl.question("Choose a route (by number): ", async (selectedRouteIndex) => {
                            const parsedRouteIndex = parseInt(selectedRouteIndex);

                            if (isNaN(parsedRouteIndex) || parsedRouteIndex < 1 || parsedRouteIndex > routes.length) {
                                console.log("Invalid route selection.");
                                rl.close();
                                return;
                            }

                            const selectedRoute = routes[parsedRouteIndex - 1];
                            const providers = functions.findProvidersForRoute(legs, selectedRoute);

                            if (!providers.length) {
                                console.log("No providers found for the selected route.");
                                rl.close();
                                return;
                            }

                            providers.sort((a, b) => new Date(a.flightStart) - new Date(b.flightStart));

                            console.log("Flights for the selected route (sorted by departure time):");
                            providers.forEach((provider, index) => console.log(
                                `${index + 1}. ${provider.company.name}: Price - ${provider.price}, Flight Start - ${provider.flightStart}, Flight End - ${provider.flightEnd}`
                            ));

                            rl.close();
                        });
                    });
                });
            } catch (error) {
                console.error(error);
                rl.close();
            }
        } else if (selectedOptionIndex === "2") {
            await functions.viewPricelistHistory(rl);
        } else {
            console.log("Invalid option selection.");
            rl.close();
        }
    });
}

main();