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
  var month =  ("0" + date.getMonth()).slice(-2);
  // Date
  var day = ("0" + date.getDate()).slice(-2);

  var userDropdown = document.getElementById("employees");
  var user = userDropdown.options[userDropdown.selectedIndex].text.toLowerCase();
  var sites = await getUserSites(user);
  console.log(sites[0]);
  for (site in sites) {
    var path = sites[site]._path.segments
    console.log(path);
    var siteData = db.doc(path).get().then((data) => {
      return data.data();
    });
    var daysMap = siteData["precip_" + month];
    var todayPrecip = daysMap[day];
    console.log("Today's precip at " + siteData.name + ": " + todayPrecip);
  }
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