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


var db = firebase.firestore();
getCurrentMonthWeather();

async function getCurrentMonthWeather() {

  var date = new Date();
  var month = ("0" + date.getMonth() + 1).slice(-2);
  // Date
  var day = ("0" + date.getDate()).slice(-2);

  var userDropdown = document.getElementById("employees");
  var user = userDropdown.options[userDropdown.selectedIndex].text.toLowerCase();
  await getUserSites(user).then((sites) => {
    sites.forEach(async (value, index) => {
      var path = value.path;
      console.log("Reading site data from document " + path);
      await db.doc(path).get().then((data) => {
        siteData = data.data();
        console.log(siteData);
        var monthArrayString = "precip_" + month;
        var daysMap = siteData[monthArrayString];
        var todayPrecip = daysMap[day];
        console.log("Today's precip at " + siteData.name + ": " + todayPrecip);
        document.getElementById("todayPrecip").innerHTML = "Today's precip at " + siteData.name + ": " + todayPrecip;
        //return data.data();
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