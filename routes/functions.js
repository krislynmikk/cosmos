const fs = require("fs/promises");
const path = require('path');
const DATA_FOLDER_PATH = path.join('test', 'data');


function initializeReadline(readlineInstance) {
    rl = readlineInstance; // Initialize the readline instance
}

function displayMenu(options) {
    console.log("Select an option:");
    options.forEach((option, index) =>
        console.log(`${index + 1}. ${option}`)
    );
}


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
function calculateTotalDistance(legs, route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const sourceName = route[i];
        const destinationName = route[i + 1];
        const leg = legs.find(
            (leg) =>
                leg.routeInfo.from.name === sourceName &&
                leg.routeInfo.to.name === destinationName
        );
        if (leg) totalDistance += leg.routeInfo.distance;
    }
    return totalDistance;
}
function makeReservation(selectedRoute, selectedProviders, firstName, lastName) {
    const totalPrice = selectedProviders.reduce(
        (total, provider) => total + provider.price,
        0
    );

    console.log("Reservation Successful!");
    console.log(`First Name: ${firstName}`);
    console.log(`Last Name: ${lastName}`);
    console.log(`Route(s): ${selectedRoute.join(" -> ")}`);
    console.log(`Total Quoted Price: ${totalPrice}`);

    // Calculate the total travel time
    const totalTravelTimeInSeconds = selectedProviders.reduce(
        (total, provider) => {
            const [days, hours, minutes] = provider.flightTime
                .match(/\d+/g)
                .map(Number);
            return total + days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;
        },
        0
    );

    const totalTravelTime = formatTravelTime(totalTravelTimeInSeconds);

    console.log(`Total Quoted Travel Time: ${totalTravelTime}`);
    console.log(
        `Transportation Company Name(s): ${selectedProviders
            .map((provider) => provider.name)
            .join(", ")}`
    );
    rl.close();
}
function findProvidersForLeg(legs, sourceName, destinationName) {
    const providersForLeg = [];

    legs.forEach((leg) => {
        if (
            leg.routeInfo.from.name === sourceName &&
            leg.routeInfo.to.name === destinationName
        ) {
            leg.providers.forEach((provider) => {
                const flightStartUnix = new Date(
                    provider.flightStart
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                const flightEndUnix = new Date(
                    provider.flightEnd
                ).getTime(); // Convert to Unix timestamp (milliseconds)
                const flightTimeInSeconds =
                    (flightEndUnix - flightStartUnix) / 1000; // Calculate flight time in seconds
                    // Calculate days, hours, minutes, and seconds
                const secondsInMinute = 60;
                const minutesInHour = 60;
                const hoursInDay = 24;

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

                providersForLeg.push({
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
function formatTravelTime(totalTravelTimeInSeconds) {
    const days = Math.floor(totalTravelTimeInSeconds / 86400); // 1 day = 86400 seconds
    const hours = Math.floor(
        (totalTravelTimeInSeconds % 86400) / 3600
    ); // 1 hour = 3600 seconds
    const minutes = Math.floor(
        (totalTravelTimeInSeconds % 3600) / 60
    ); // 1 minute = 60 seconds
    const seconds = totalTravelTimeInSeconds % 60;

    const formattedTime = [];

    if (days > 0) {
        formattedTime.push(`${days} days`);
    }
    if (hours > 0) {
        formattedTime.push(`${hours} hours`);
    }
    if (minutes > 0) {
        formattedTime.push(`${minutes} minutes`);
    }
    if (seconds > 0) {
        formattedTime.push(`${seconds} seconds`);
    }

    return formattedTime.join(" ");
}

function sortProviders(providers, sortBy, sortDirection) {
    return providers.sort((a, b) => {
        if (sortBy === "price") {
            return sortDirection === "asc"
                ? a.price - b.price
                : b.price - a.price;
        } else if (sortBy === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortBy === "flightTime") {
            const aTimeParts = a.flightTime.split(" ");
            const bTimeParts = b.flightTime.split(" ");
            const aHours = parseInt(aTimeParts[0]);
            const bHours = parseInt(bTimeParts[0]);
            const aMinutes = parseInt(aTimeParts[2]);
            const bMinutes = parseInt(bTimeParts[2]);

            if (aHours !== bHours) {
                return sortDirection === "asc"
                    ? aHours - bHours
                    : bHours - aHours;
            } else {
                return sortDirection === "asc"
                    ? aMinutes - bMinutes
                    : bMinutes - aMinutes;
            }
        }
        return 0; // Default case: no sorting
    });
}
async function viewPricelistHistory() {
    try {
        const answer = await askYesNoQuestion("Do you want to open the data folder from the test folder?");
        if (answer.toLowerCase() === "yes") {
            const files = await fs.readdir(DATA_FOLDER_PATH);
            console.log("Files in the data folder:");
            files.forEach((file, index) => {
                console.log(`${index + 1}. ${file}`);
            });

            const selectedFileIndex = await askNumberQuestion("Choose a JSON file (by number): ", files.length);

            if (selectedFileIndex >= 1 && selectedFileIndex <= files.length) {
                const selectedFile = files[selectedFileIndex - 1];
                const filePath = path.join(DATA_FOLDER_PATH, selectedFile);

                try {
                    const data = await fs.readFile(filePath, 'utf8');
                    const jsonData = JSON.parse(data);
                    // Fetch and process API data as needed
                    console.log("API Response:");
                    console.log(jsonData);
                } catch (parseError) {
                    console.error('Error parsing JSON data:', parseError);
                }
            } else {
                console.log("Invalid file selection.");
            }
        } else {
            console.log("Data folder not opened.");
        }
    } catch (error) {
        console.error('Error reading data folder:', error);
     //} finally {
      //  if (!rl.closed) {
       //     rl.close();
       // }
    }
}

function askYesNoQuestion(question) {
    return new Promise((resolve) => {
        rl.question(`${question} (yes/no): `, (answer) => {
            resolve(answer);
        });
    });
}
function askNumberQuestion(question, maxNumber) {
    return new Promise((resolve) => {
        rl.question(question, (selectedNumber) => {
            const parsedNumber = parseInt(selectedNumber);
            if (!isNaN(parsedNumber) && parsedNumber >= 1 && parsedNumber <= maxNumber) {
                resolve(parsedNumber);
            } else {
                console.log("Invalid input. Please enter a valid number.");
                resolve(askNumberQuestion(question, maxNumber));
            }
        });
    });
}

function fetchRoutesFromDatabase(sourceName, destinationName) {
    // Simulate a database query by filtering routes based on source and destination
    const filteredRoutes = routeData.filter(route => {
        return route.source === sourceName && route.destination === destinationName;
    });

    return filteredRoutes;
}

module.exports = {
    initializeReadline,
    displayMenu,
    findRoutes,
    calculateTotalDistance,
    makeReservation,
    findProvidersForLeg,
    sortProviders,
    viewPricelistHistory,
    askYesNoQuestion,
    askNumberQuestion,
    fetchRoutesFromDatabase
    // Add other functions here...
};

