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
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

var db = firebase.firestore();
getCurrentMonthWeather();

async function getCurrentMonthWeather() {


  var date = new Date();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
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
        insertTableData(siteData, month, year, path);
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

function insertTableData(siteData, month, year, path) {
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
  var titleDiv = document.createElement("div");
  titleDiv.className = "table-title-div";

  var leftArrow = document.createElement("span");
  leftArrow.innerHTML = "<";
  leftArrow.style.display = "none";
  leftArrow.className = "month-arrow";
  titleDiv.appendChild(leftArrow);

  var tableTitle = document.createElement("h2");
  tableTitle.style.textAlign = "center";
  tableTitle.className = "table-title";
  titleDiv.appendChild(tableTitle);

  var rightArrow = document.createElement("span");
  rightArrow.innerHTML = ">";
  rightArrow.style.display = "none";
  rightArrow.className = "month-arrow";
  titleDiv.appendChild(rightArrow);

  tableDiv.appendChild(titleDiv);

  // Create table
  var currentTable = document.createElement("table");
  tableDiv.appendChild(currentTable);

  // Button to change table display
  var moreButton = document.createElement("button");
  moreButton.innerHTML = "Show Month";
  parentDiv.appendChild(moreButton);

  var currentDate = new Date();
  displayLast7Days(currentDate, currentTable, siteData, moreButton, path);
}

function clearTable(table) {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

//TODO: Add year dropdown selector
function displayMonth(currentDate, currentTable, siteData, moreButton, path) {
  var month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  var year = currentDate.getFullYear();

  // Add title of month  
  var monthString = currentDate.toLocaleString('default', { month: 'long' });
  var monthTitle = currentTable.parentElement.getElementsByClassName("table-title")[0];
  var monthTitleWrapper = monthTitle.parentElement;
  monthTitleWrapper.style.display = "flex";
  
  var previousDate = new Date();
  //previousDate.setDate(1);
  previousDate.setMonth(currentDate.getMonth()-1);

  var nextDate = new Date();
  //nextDate.setDate(1);
  nextDate.setMonth(currentDate.getMonth()+1);

  monthTitle.innerHTML = monthString;
 
  var leftArrow = monthTitleWrapper.getElementsByClassName("month-arrow")[0];
  leftArrow.style.display = "flex";
  if (previousDate.getFullYear() < 2021) {
    leftArrow.innerHTML = "";
  } else {
    leftArrow.innerHTML = "<"
  }
  var rightArrow = monthTitleWrapper.getElementsByClassName("month-arrow")[1];
  rightArrow.style.display = "flex";

  // Go to previous month
  leftArrow.onclick = function () {
    clearTable(currentTable);
    displayMonth(previousDate, currentTable, siteData, moreButton, path);
  }

  // Go to next month
  rightArrow.onclick = function () {
    clearTable(currentTable);
    displayMonth(nextDate, currentTable, siteData, moreButton, path);
  }


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
    }
    // Insert date header
    var headerCell = headerRow.insertCell();
    headerCell.style.textAlign = "center";
    headerCell.innerHTML = i;

    // Default null (-) value unless data is found
    var currentDayPrecip = "-"
    if (monthlyPrecip != undefined) {
      var formattedDate = ("0"+i).slice(-2);
      console.log("format: " + formattedDate);
      currentDayPrecip = monthlyPrecip[formattedDate];
      if (currentDayPrecip == undefined) {
        currentDayPrecip = "-";
      }
    }
    var dataCell = currentRow.insertCell();
    dataCell.innerHTML = currentDayPrecip;

    // Enable highlighting of data cells
    dataCell.onclick = function () {
      this.style.backgroundColor = "yellow";
    }

    // Enable popup of hourly data
    headerCell.onclick = function () {
      
      // Getting correct date
      //var date = new Date();
      var hourlyYear = currentDate.getFullYear();
      var hourlyMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are 0-11 so we +1
      var hourlyDate = hourlyYear + "-" + hourlyMonth + "-" + this.innerHTML;
      
      // Displaying the graph
      modal.style.display = "block";
      displayGraph(path, hourlyDate);
    }

    moreButton.onclick = function () {
      monthTitleWrapper.style.display = "none";
      clearTable(currentTable);
      displayLast7Days((new Date()), currentTable, siteData, moreButton, path);
      moreButton.innerHTML = "Show Month";
    }

    offset++;
  }
}

// TODO: Display previous months data if within last 7 days
function displayLast7Days(date, table, siteData, moreButton, path) {
  const last7Days = 7;

  // Get precip data from site
  var monthArrayString = "precip_" + ("0" + (date.getMonth() + 1)).slice(-2);
  var previousMonthArrayString ="precip_" + ("0" + date.getMonth()).slice(-2);
  console.log("previous: " + previousMonthArrayString);
  // Map of precip for each day
  var monthlyPrecip = siteData[monthArrayString];
  var previousMonthPrecip = siteData[previousMonthArrayString];


  var dateRow = table.insertRow();
  var precipRow = table.insertRow();

  // Get 7 days before
  var earliestDate = new Date();
  earliestDate.setDate(date.getDate() - 7);

  var index = 0; // Number of loops
  
  // Loop through dates between 7 days prior and current date
  for (var i = 0; i < last7Days; i++) {
    var runningDate = new Date();

    runningDate.setMonth(earliestDate.getMonth());
    runningDate.setDate(earliestDate.getDate() + i);
    
    var dateCell = dateRow.insertCell();
    dateCell.innerHTML = (runningDate.getMonth()+1) + "/" + runningDate.getDate();

    console.log("running date: " + runningDate.getDate());

    // TODO: Get data from prior months too
    var currentDayPrecip = "-"
    // Previous month
    if (runningDate.getDate() > date.getDate()) {
      if (previousMonthPrecip != undefined) {
        currentDayPrecip = previousMonthPrecip[("0" + runningDate.getDate()).slice(-2)];
        if (currentDayPrecip == undefined) {
          currentDayPrecip = "-";
        }
      }
    } else {
      if (monthlyPrecip != undefined) {
        currentDayPrecip = monthlyPrecip[("0" + runningDate.getDate()).slice(-2)];
        if (currentDayPrecip == undefined) {
          currentDayPrecip = "-";
        }
      }
    }
    var precipCell = precipRow.insertCell()
    precipCell.innerHTML = currentDayPrecip;

    // Enable highlighting of data cells
    precipCell.onclick = function () {
      this.style.backgroundColor = "yellow";
    }

    // Enable drilldown to hour by hour
    dateCell.onclick = function () {
      
      // Getting correct date
      //var date = new Date();
      var hourlyYear = runningDate.getFullYear();
      var hourlyMonth = ("0" + this.innerHTML.split("/")[0]).slice(-2); // Months are 0-11 so we +1
      var hourlyDay = ("0" + this.innerHTML.split("/")[1]).slice(-2);
      var hourlyDate = hourlyYear + "-" + hourlyMonth + "-" + hourlyDay;
      
      // Displaying the graph
      modal.style.display = "block";
      displayGraph(path, hourlyDate);
    }

    moreButton.onclick = function () {
      clearTable(table);
      displayMonth(date, table, siteData, moreButton, path);
      moreButton.innerHTML = "Show Recent";
    }

    index++;
  }
}