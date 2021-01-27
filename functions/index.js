const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Use fetch for HTTP requests
const fetch = require("node-fetch");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Firestore
const db = admin.firestore();



exports.populateWeather = functions.https.onRequest(async (request, response) => {
    const weatherAPIKey = "a77d00cf8cb244f4801195048211101";
    var regions = await getRegions();
    for (region in regions) {
        var sites = await getSites(region);
        // Get coordinates from sites/{siteID}
        // Then use getWeatherData() for each site's coordinates
    }
    
    var date = "2021-01-22";
    var location = "30.26534,-81.43901";
    var data = await getWeatherData(weatherAPIKey, location, date);
    response.send(data);
});

function getRegions() {
    var regionsReference = db.collection("regions").doc("list");
    return regionsReference.get().then((data) => {
        var regionsArray = data.data();
        console.log(regionsArray);
        return regionsArray;
    }).catch((err) => {
        console.error("Failed to get regions list", err);
    });
}

function getSites(region) {
    var sitesRef = db.collection("regions").doc("stjohns")
    return sitesRef.get().then((data) => {
        var regionData = data.data();
        console.log("regionData: " + regionData);
        console.log("active sites: " + regionData.active_sites)
        return regionData.active_sites;
    }).catch((err) => {
        console.error("Failed to get active sites for " + region + ": ", err)
    });
}


// Grab weather data everyday and store in our own database
// TODO: Is it necessary to store our data or can we call from the external API everytime?
function getWeatherData(weatherAPIKey, siteLocation, date) {
    const requestUrl = "https://api.weatherapi.com/v1/history.json?key=" + weatherAPIKey + "&q=" + siteLocation + "&dt=" + date;

    // Fetch data from requestUrl
    return fetch(requestUrl).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        console.log("Total precip: " + data.forecast.forecastday[0].day.totalprecip_in);
        return data;
    }).catch((error) => {
        console.error("Problem fetching weather: ", error);
    });
}

// Add weather data to Firestore database
function addWeatherData(site, date, hourlyRainfall, totalRainfall) {

}