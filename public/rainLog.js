new Vue({
  el: '#app',
  data: {
    teamRows: [
      { team: 'Beach', times: ['0.01', '0.2', '0.16'] },
      { team: 'Boardwalk', times: ['0.4', '0.25', '0.36'] },
      { team: 'Park', times: ['0.0', '0.1', '0.0'] }
    ]
  }
});

// Popup window vars
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
  modal.style.display = "none";
}

var db = firebase.firestore();
getCurrentMonthWeather();

async function getCurrentMonthWeather() {


  var date = new Date();
  var month = ("0" + date.getMonth() + 1).slice(-2);
  // Date

  var year = date.getFullYear();

  var userDropdown = document.getElementById("employees");
  var user = userDropdown.options[userDropdown.selectedIndex].text.toLowerCase();
  await getUserSites(user).then((sites) => {
    sites.forEach(async (value, index) => {
      var path = value.path;
      console.log("Reading site data from document " + path);
      await db.doc(path).get().then((data) => {
        siteData = data.data();
        console.log(siteData);

        // Insert data into HTML
        insertTableData(siteData, month, year);
      });

    });
  });

}

function getUserSites(user) {
  console.log("Getting user data for " + user);
  var userRef = db.collection("users").doc(user);
  return userRef.get().then((data) => {
    var userData = data.data();
    console.log(userData);
    return userData.sites;
  });
}

function insertTableData(siteData, month, year) {
  const parentDiv = document.getElementById("precipTable");

  // Title of site above each table
  var siteName = siteData.name;
  var siteTitle = document.createElement("h3");
  siteTitle.innerHTML = siteName;
  parentDiv.appendChild(siteTitle);

  // Create table wrapper div
  var tableDiv = document.createElement("div");
  parentDiv.appendChild(tableDiv);

  // Table Title
  var tableTitle = document.createElement("h2");
  tableTitle.style.textAlign = "center";
  tableTitle.className = "table-title";
  tableDiv.appendChild(tableTitle);

  // Create table
  var currentTable = document.createElement("table");
  tableDiv.appendChild(currentTable);

  // Button to change table display
  var moreButton = document.createElement("button");
  moreButton.innerHTML = "Show Month";
  parentDiv.appendChild(moreButton);

  var currentDate = new Date();
  displayLast7Days(currentDate, currentTable, siteData, moreButton);
}

function clearTable(table) {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

//TODO: Reset button functionality
function displayMonth(currentDate, currentTable, siteData, moreButton) {
  var month = ("0" + currentDate.getMonth() + 1).slice(-2);
  var year = currentDate.getFullYear();

  // Add title of month
  var monthString = currentDate.toLocaleString('default', { month: 'long' });
  var monthTitle = currentTable.parentElement.getElementsByClassName("table-title")[0];
  monthTitle.innerHTML = monthString;

  // Weekly Day Header
  // TODO: Put into loop and add style (e.g. bold)
  var dayRow = currentTable.insertRow();
  dayRow.insertCell().innerHTML = "Sunday";
  dayRow.insertCell().innerHTML = "Monday";
  dayRow.insertCell().innerHTML = "Tuesday";
  dayRow.insertCell().innerHTML = "Wednesday";
  dayRow.insertCell().innerHTML = "Thursday";
  dayRow.insertCell().innerHTML = "Friday";
  dayRow.insertCell().innerHTML = "Saturday";

  dayRow.style.backgroundColor = "#007cba";
  dayRow.style.color = "white";

  // Create row for date and row underneath for data
  var headerRow = currentTable.insertRow();
  var currentRow = currentTable.insertRow();

  var monthArrayString = "precip_" + month;
  // Map of precip for each day
  var monthlyPrecip = siteData[monthArrayString];
  // Get number of days in the month
  var daysInCurrentMonth = new Date(year, month, 0).getDate();
  // Get day of week of the first day of the month
  var firstDayOfMonth = new Date(year, (month - 1), 1).getDay();
  // Insert cells to offset calendar to account for first day not being on Sunday
  for (var offset = 0; offset < firstDayOfMonth; offset++) {
    headerRow.insertCell();
    currentRow.insertCell();
  }



  // For each day in the month fill in a value
  for (var i = 1; i <= daysInCurrentMonth; i++) {
    // Multiples of 7 should be on a new line, starting from day of week (w)
    if ((i != 1) && offset % 7 == 0) {
      headerRow = currentTable.insertRow();
      currentRow = currentTable.insertRow();
      // Hide all rows by default, except current week
      /** 
      headerRow.style.display = "none";
      currentRow.style.display = "none";
      */
    }

    // Display current week
    /** 
    if (i == currentDate.getDate()) {
      headerRow.style.display = "table-row";
      currentRow.style.display = "table-row";
    }
    */

    // Insert date header
    var headerCell = headerRow.insertCell();
    headerCell.style.textAlign = "center";
    headerCell.innerHTML = i;

    // Default null (-) value unless data is found
    var currentDayPrecip = "-"
    if (monthlyPrecip != undefined) {
      currentDayPrecip = monthlyPrecip[i];
      if (currentDayPrecip == undefined)
        currentDayPrecip = "-"
    }
    var dataCell = currentRow.insertCell()
    dataCell.innerHTML = currentDayPrecip;

    // Enable highlighting of data cells
    dataCell.onclick = function () {
      this.style.backgroundColor = "yellow";
    }

    // Enable popup of hourly data
    headerCell.onclick = function () {
      this.style.backgroundColor = "green";
      modal.style.display = "block";
    }

    moreButton.onclick = function () {
      monthTitle.innerHTML = "";
      clearTable(currentTable);
      displayLast7Days(currentDate, currentTable, siteData, moreButton);
      moreButton.innerHTML = "Show Month";
    }

    offset++;
  }
}

// TODO: Display previous months data if within last 7 days
function displayLast7Days(date, table, siteData, moreButton) {

  // Get precip data from site
  var monthArrayString = "precip_" + ("0" + date.getMonth() + 1).slice(-2);
  // Map of precip for each day
  var monthlyPrecip = siteData[monthArrayString];

  var dateRow = table.insertRow();
  var precipRow = table.insertRow();

  // Get 7 days before
  var earliestDate = new Date();
  earliestDate.setDate(date.getDate() - 7);

  var index = 0; // Number of loops
  // Loop through dates between 7 days prior and current date
  for (var i = earliestDate.getDate(); i < date.getDate(); i++) {
    var runningDate = new Date();
    runningDate.setDate(earliestDate.getDate() + index);
    var dateCell = dateRow.insertCell();
    dateCell.innerHTML = (runningDate.getMonth() + 1) + "/" + runningDate.getDate();

    // Add hourly view when clicking dateCell
    // dateCell.onclick = function () {}

    // TODO: Get data from prior months too
    var currentDayPrecip = "-"
    if (monthlyPrecip != undefined) {
      currentDayPrecip = monthlyPrecip[i];
      if (currentDayPrecip == undefined)
        currentDayPrecip = "-"
    }
    var precipCell = precipRow.insertCell()
    precipCell.innerHTML = currentDayPrecip;

    // Enable highlighting of data cells
    precipCell.onclick = function () {
      this.style.backgroundColor = "yellow";
    }

    moreButton.onclick = function () {
      clearTable(table);
      displayMonth(date, table, siteData, moreButton);
      moreButton.innerHTML = "Show Recent";
    }

    index++;
  }
}