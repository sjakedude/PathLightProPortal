async function displayGraph(rainDataArray, hourlyPath, hourlyDate) {
    
    var hourlyFullPath = hourlyPath + "/hourly/" + hourlyDate;
    console.log("Reading site data from document " + hourlyFullPath);
    await db.doc(hourlyFullPath).get().then((data) => {
          siteData1 = data.data();
          rainDataArray = siteData1;
    });
    console.log(rainDataArray);

    console.log("About to populate chart");
    var chart = new CanvasJS.Chart("chartContainer", {
        width: 1000,
        animationEnabled: true,
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        title:{
            text: "Precipitation by Hour"
        },
        axisY: {
            title: "Percipitation"
        },
        data: [{        
            type: "column",  
            showInLegend: true, 
            legendMarkerColor: "white",
            legendText: " ",
            dataPoints: [      
                { y: rainDataArray["precip"][0], label: "12:00 am" },
                { y: rainDataArray["precip"][1],  label: "1:00 am" },
                { y: rainDataArray["precip"][2],  label: "2:00 am" },
                { y: rainDataArray["precip"][3],  label: "3:00 am" },
                { y: rainDataArray["precip"][4],  label: "4:00 am" },
                { y: rainDataArray["precip"][5],  label: "5:00 am" },
                { y: rainDataArray["precip"][6],  label: "6:00 am" },
                { y: rainDataArray["precip"][7],  label: "7:00 am" },
                { y: rainDataArray["precip"][8],  label: "8:00 am" },
                { y: rainDataArray["precip"][9],  label: "9:00 am" },
                { y: rainDataArray["precip"][10],  label: "10:00 am" },
                { y: rainDataArray["precip"][11],  label: "11:00 am" },
                { y: rainDataArray["precip"][12],  label: "12:00 pm" },
                { y: rainDataArray["precip"][13],  label: "1:00 pm" },
                { y: rainDataArray["precip"][14],  label: "6:00 pm" },
                { y: rainDataArray["precip"][15],  label: "3:00 pm" },
                { y: rainDataArray["precip"][16],  label: "4:00 pm" },
                { y: rainDataArray["precip"][17],  label: "5:00 pm" },
                { y: rainDataArray["precip"][18],  label: "6:00 pm" },
                { y: rainDataArray["precip"][19],  label: "7:00 pm" },
                { y: rainDataArray["precip"][20],  label: "8:00 pm" },
                { y: rainDataArray["precip"][21],  label: "9:00 pm" },
                { y: rainDataArray["precip"][22],  label: "10:00 pm" },
                { y: rainDataArray["precip"][23],  label: "11:00 pm" }
            ]
        }]
    });
    chart.render();
}