const functions = require("firebase-functions");

// Use fetch for HTTP requests
const fetch = require("node-fetch");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Firestore
const db = admin.firestore();
const cityRef = db.collection('cities').doc('BJ');

// Main method
exports.populateWeather = functions.pubsub.schedule('0 1 * * *').timeZone('America/New_York').onRun(async (context) => {

    // API key for weather app
    const weatherAPIKey = "a77d00cf8cb244f4801195048211101";

    // Getting the date into the correct format
    var dateObject = new Date();
    dateObject.setDate(dateObject.getDate() - 1);
    var year = dateObject.getFullYear();
    var month = ("0" + (dateObject.getMonth() + 1)).slice(-2); // Months are 0-11 so we +1
    var day = ("0" + dateObject.getDate()).slice(-2); // Days are 1-31 but we -1 to get yesterday's data
    var date = year + "-" + month + "-" + day;
    console.log("Date: " + date);

    // Getting all regions (currently only st johns)
    var regions = await getRegions();

    for (region in regions) {

        // Get all sites for the region
        var sites = await getSites(region);

        // Iterate through each site in the region
        for (site in sites) {

            // Grabbing the path to the site in the firestore
            var path = sites[site]._path.segments
            var siteInfo = await getSiteInfo(path);

            // Parsing out site info
            var siteName = siteInfo.data().name;
            var latitude = siteInfo.data().coordinates._latitude;
            var longitude = siteInfo.data().coordinates._longitude;
            var coordinates = latitude + "," + longitude;
            console.log("=======\n" + "Site: " + siteName + "\nCoordinates: " + coordinates);

            // Calling the weather API for that location
            var data = await getWeatherData(weatherAPIKey, coordinates, date);
            var totalPrecip = data.forecast.forecastday[0].day.totalprecip_in;
            console.log("Total Precipitation: " + totalPrecip)
            var hourlyPrecip = getHourlyPrecip(data);

            // Updating the firestore with yesterday's precipitation data
            updateTotalPrecip(path, totalPrecip, month, day)
            updateHourlyPrecip(path, hourlyPrecip, date);
        }
    }
});

function updateHourlyPrecip(path, hourlyPrecip, date) {
    console.log("IN UPDATE HOURLY");
    var siteData = db.doc(path.join("/") + "/hourly/" + date);
    console.log(hourlyPrecip);
    siteData.set({precip: hourlyPrecip}, {merge: true});
}

function updateTotalPrecip(path, totalPrecip, month, day) {
    var siteData = db.doc(path.join("/"));
    var dataPath = "precip_" + month + "." + day;
    siteData.update({[dataPath]: totalPrecip})
}

function getSiteInfo(path) {
    var siteData = db.doc(path.join("/"));
        return siteData.get().then((data) => {
            return data;
        }).catch((err) => {
            console.error("Failed grabbing coordinates", err);
        });
}

function getRegions() {
    var regionsReference = db.collection("regions").doc("list");
    return regionsReference.get().then((data) => {
        var regionsArray = data.data();
        return regionsArray;
    }).catch((err) => {
        console.error("Failed to get regions list", err);
    });
}

function getSites(region) {
    var sitesRef = db.collection("regions").doc("stjohns")
    return sitesRef.get().then((data) => {
        var regionData = data.data();
        return regionData.active_sites;
    }).catch((err) => {
        console.error("Failed to get active sites for " + region + ": ", err)
    });
}

// Grab weather data everyday and store in our own database
// TODO: Is it necessary to store our data or can we call from the external API everytime?
function getWeatherData(weatherAPIKey, coordinates, date) {
    const requestUrl = "https://api.weatherapi.com/v1/history.json?key=" + weatherAPIKey + "&q=" + coordinates + "&dt=" + date;

    // Fetch data from requestUrl
    return fetch(requestUrl).then((response) => {
        return response.json();
    }).then((data) => {
        return data;
    }).catch((error) => {
        console.error("Problem fetching weather", error);
    });
}

// Function to retrieving the hourly precipitation and returning an array of the values
// indexed 0-23 (for all 24 hours in a day)
function getHourlyPrecip(data) {
    var hours = data.forecast.forecastday[0].hour;
    var hourlyPrecip = [];
    for (hour in hours) {
        var precip = hours[hour].precip_in;
        hourlyPrecip.push(precip);
    }
    return hourlyPrecip;
}