window.onload = function () {
            

    var rainDataArray = [0.1, 0.0, 0.3, 0.2, 0.3, 0.0];

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
            legendMarkerColor: "grey",
            legendText: "Hour by hour",
            dataPoints: [      
                { y: rainDataArray[0], label: "12:00 am" },
                { y: rainDataArray[1],  label: "1:00 am" },
                { y: rainDataArray[2],  label: "2:00 am" },
                { y: rainDataArray[3],  label: "3:00 am" },
                { y: rainDataArray[4],  label: "4:00 am" },
                { y: rainDataArray[5],  label: "5:00 am" },
                { y: .2,  label: "6:00 am" },
                { y: .1,  label: "7:00 am" },
                { y: .2,  label: "8:00 am" },
                { y: .2,  label: "9:00 am" },
                { y: .2,  label: "10:00 am" },
                { y: .2,  label: "11:00 am" },
                { y: .2,  label: "12:00 pm" },
                { y: .2,  label: "1:00 pm" },
                { y: .2,  label: "6:00 pm" },
                { y: .2,  label: "3:00 pm" },
                { y: .2,  label: "4:00 pm" },
                { y: .2,  label: "5:00 pm" },
                { y: .2,  label: "6:00 pm" },
                { y: .2,  label: "7:00 pm" },
                { y: .2,  label: "8:00 pm" },
                { y: .2,  label: "9:00 pm" },
                { y: .2,  label: "10:00 pm" },
                { y: .2,  label: "11:00 pm" }
            ]
        }]
    });
    chart.render();
}