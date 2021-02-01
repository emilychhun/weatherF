


$(document).ready(function () {
    /* || Search Button || */

   // save value that entered
    $("#searchBtn").on("click", function () {
        event.preventDefault();
        let searchInput = $("#searchData").val();
        // clear input box =after hitting search
        $("#searchData").val("");
        // clear input box when clicking inside box
        $("input:text").click(function () {
           // $(this).val("");
            // clear today
            $("#current").empty();
            // clear 5-day
            $("#predict").empty();
        });
        weatherApp(searchInput);
       // console.log("searchValue1 =", searchInput);
    });

    
    
    
    /* || Search History || */

    // History
    $(".previous").on("click", "li", function () {
        weatherApp($(this).text()); 
       // console.log("History (this):", this);
    });

    // make search history List
    function makeHistory(text) {
     // console.log("-- || Start makeHistory function || --");
        let li = $("<li>", { id: "list-history"})
            // add class & name
            .addClass("list-group-item ")
            
            // add text
            .text(text);
        // append chil
        $(".previous").append(li);
    }

    /* || Global Variables || */

    // Weather URL
 //   console.log("-- || OpenWeatherMap || --");
    // &units=imperial is used in url for metric to imperial conversion
    let weatherUnits = "&units=imperial";
    // Weather API
    let apiOpenWeatherMap = "&appid=38f55767a0c60100721a848c0be8deb5";
   // console.log("API:", apiOpenWeatherMap);

    /* || Todays Weather Forecast || */

    function weatherApp(searchInput) {
     //   console.log("-- || Start seachWeather function || --");
        $.ajax({
            type: "GET",
            url:
                "https://api.openweathermap.org/data/2.5/weather?q=" +
                searchInput +
                weatherUnits +
                apiOpenWeatherMap,
            dataType: "json",
            success: function (data) {
            
              /*  console.log("Weather-Icon:", data.weather[0].icon);
                console.log("-- || Open Weather Map Data || --");
             
                console.log("City Name:", data.name);
                console.log("Time of data calculation, unix, UTC:", data.dt);
                
                console.log("Temperature:", data.main.temp, "°F");
                console.log("Humidity:", data.main.humidity, "%");
                console.log("Wind Speed:", data.wind.speed, "MPH");*/
               
               
                // create history link for this search
                if (history.indexOf(searchInput) === -1) {
                    history.push(searchInput);
                    window.localStorage.setItem("history", JSON.stringify(history));
                  //  console.log("if History:", history);
                    makeHistory(searchInput);
                }
                // clear any old content
               $("#current").empty();
               $("#predict").empty();

                // Time Conversion
             //   console.log("-- || Time Conversion || --");
                let sec = data.dt;
                let predictDate = new Date(sec * 1000);
                let timestr = predictDate.toLocaleTimeString();
                let datestr = predictDate.toLocaleDateString();
                // Day of the week conversion
                let daystr = predictDate.getUTCDay();
                let nameday = new Array(7);
                nameday[0] = "Sunday";
                nameday[1] = "Monday";
                nameday[2] = "Tuesday";
                nameday[3] = "Wednesday";
                nameday[4] = "Thursday";
                nameday[5] = "Friday";
                nameday[6] = "Saturday";
                let namedaystr = nameday[daystr];
                /*console.log("All Time Data", predictDate);
                console.log("Local Time:", timestr);
                console.log("Local Date:", datestr);
                console.log("Day of the Week:", namedaystr);*/

                // create html content for current weather
                let forecastUl = $("<div>", { id: "forecast-container" });

                let listName = $("<div>", { id: "name-div" });
                listName.text(data.name + " (" + datestr + ") ");

                let listImg = $("<div>", { id: "img-div" });
                // Render Icon © Tim A.
                let iconImg = $("<img>", {id: "img-div2"});
                iconImg.attr(
                    "src",
                    "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png",
                );
                listImg.append(iconImg);

                let listTemp = $("<div>", { id: "temp-div" });
                listTemp.text("Temperature: " + data.main.temp + " °F");

                let listHumidity = $("<div>", { id: "humid-div" });
                listHumidity.text("Humidity: " + data.main.humidity + "%");

                let listWindSpeed = $("<div>", { id: "speed-div" });
                listWindSpeed.text("Wind Speed: " + data.wind.speed + " MPH");

                let listUVIndex = $("<div>", { id: "index-div" });

                forecastUl.append(
                    listName,
                    listImg,
                    listTemp,
                    listHumidity,
                    listWindSpeed,
                    listUVIndex,
                );

                // merge and add to page
                $("#current").append(forecastUl);

                // call follow-up api endpoints
                getPredict(searchInput);
                console.log("getForecast:", searchInput);
                getUVIndex(data.coord.lat, data.coord.lon);
                console.log(
                    "getUVIndex",
                    "Lat Coord Data:",
                    data.coord.lat,
                    "Lon Coord Data:",
                    data.coord.lon,
                );
            },
            error: function (xhr, status, error) {
                alert(
                    "Result: " +
                    status +
                    " " +
                    error +
                    " " +
                    xhr.status +
                    " " +
                    xhr.statusText,
                );
            },
        });
    }

    /* || 5-Day Weather Forecast || */

    function getPredict(searchInput) {
        console.log("-- || Start getForecast function || --");
        $.ajax({
            type: "GET",
            // https:api.openweathermap.org/data/2.5/forecast?q=[City]&units=imperial&appid=38f55767a0c60100721a848c0be8deb5
            url:
                "https://api.openweathermap.org/data/2.5/forecast?q=" +
                searchInput +
                weatherUnits +
                apiOpenWeatherMap,
            dataType: "json",
            success: function (data) {
                // log forecast
                console.log("getForecast data:", data.list);
                // overwrite any existing content with title and empty row
                $("#predict").empty();

                // create title "5-Day Forecast:"
                var fiveTitle = $("<div>", {
                    id: "five-title",
                });
                fiveTitle.text("5-Day Forecast:");

                // Forecast card container
                let fiveContent = $("<div>", {
                    class: "card-container",
                    id: "five-content",
                });

                // loop over all forecasts (by 3-hour increments)
                console.log("-- || Start Forecast for loop || --");
                // var i = 0 makes forecast start on current day
                for (let i = 0; i < data.list.length; i++) {
                    // only look at forecasts around 3:00pm
                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                        // create html elements for a bootstrap card
                        let fiveCard = $("<div>", {
                            class: "card",
                            id: "five-card",
                        });
                        console.log("Card:", fiveCard);

                        // Forecast Time Conversion
                        console.log("-- || Forecast Time Loop Conversion || --");
                        let fivesec = data.list[i].dt;
                        let predictFiveDate = new Date(fivesec * 1000);
                        let fivedatestr = predictFiveDate.toLocaleDateString();
                        // Day of the week conversion
                        let fivedaystr = predictFiveDate.getUTCDay();
                        let fivenameday = new Array(7);
                        fivenameday[0] = "Sunday";
                        fivenameday[1] = "Monday";
                        fivenameday[2] = "Tuesday";
                        fivenameday[3] = "Wednesday";
                        fivenameday[4] = "Thursday";
                        fivenameday[5] = "Friday";
                        fivenameday[6] = "Saturday";
                        let fivenamedaystr = fivenameday[fivedaystr];

                        // Date
                        let fiveDay = $("<h4>", {
                            class: "card-title",
                            id: "five-day",
                        });
                        fiveDay.text(fivenamedaystr);
                        console.log("5-Day Day of the Week", fivedaystr);

                        let fiveDate = $("<h5>", {
                            class: "card-title",
                            id: "five-date",
                        });
                        fiveDate.text(fivedatestr);
                        console.log("5-Date:", fivedatestr);

                        // IMG Icon
                        let fiveImg = $("<p>", {
                            class: "card-body",
                            id: "five-img",
                        });
                        // Render Icon
                        let fiveIconImg = $("<img>");
                        fiveIconImg.attr(
                            "src", 
                            "https://openweathermap.org/img/w/" +
                            data.list[i].weather[0].icon +
                            ".png",
                        );
                        fiveImg.append(fiveIconImg);
                        console.log("5-Icon:", data.list[i].weather[0].icon);

                        // Temp
                        let fiveTemp = $("<p>", {
                            class: "card-body",
                            id: "five-temp",
                        });
                        fiveTemp.text("Temperature: " + data.list[i].main.temp + " °F");
                        console.log("5-Temp", data.list[i].main.temp);

                        //Humidity
                        let fiveHumidity = $("<p>", {
                            class: "card-body",
                            id: "five-humid",
                        });
                        fiveHumidity.text("Humidity: " + data.list[i].main.humidity + "%");
                        console.log("5-Humid:", data.list[i].main.humidity);

                        // the next 5 lines are where my problem is...
                        fiveCard.append(
                            fiveDay,
                            fiveDate,
                            fiveIconImg,
                            fiveTemp,
                            fiveHumidity,
                        );

                        // merge together and put on page
                        $("#predict .card-container").append(fiveCard);

                        // render cards in container
                        fiveContent.append(fiveCard);

                        console.log("-- || End Loop #", i, " || --");
                    }
                }
                // Append Forecast Title and Container
                $("#predict").append(fiveTitle, fiveContent);
            },
            error: function (xhr, status, error) {
                alert(
                    "Result: " +
                    status +
                    " " +
                    error +
                    " " +
                    xhr.status +
                    " " +
                    xhr.statusText,
                );
            },
        });
    }

    /* || UV INDEX || */

    function getUVIndex(lat, lon) {
        console.log("-- || Start getUVIndex || --");
        console.log("Lattitude:", lat, "Longitude", lon);
        $.ajax({
            type: "GET",
            url:
                "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
                lat +
                "&lon=" +
                lon +
                apiOpenWeatherMap,
            dataType: "json",
            success: function (data) {
              //  console.log("UV Data", data);
                // Find UV Index
                let uv = data[0].value;
                // uv text ro replace placeholder
                let uvText = $("<p>").text("UV Index: ");
                // Make UV btn
                let button = $("<span>").addClass("btn btn-sm").text(data[0].value);
                console.log("UV:", uv);
                // change color depending on uv value
                if (uv > 0 && uv <= 2.99) {
                    button.addClass("low-uv");
                    button.css("color", "white");
                    button.css("background-color", "#708090");
                } else if (uv >= 3 && uv <= 5.99) {
                    button.addClass("moderate-uv");
                    button.css("color", "white");
                    button.css("background-color", "#FFFF00");
                } else if (uv >= 6 && uv <= 7.99) {
                    button.addClass("high-uv");
                    button.css("color", "white");
                    button.css("background-color", "#2E8B57");
                } else if (uv >= 8 && uv <= 10.99) {
                    button.addClass("vhigh-uv");
                    button.css("color", "white");
                    button.css("background-color", "#7FFFD4");
                } else {
                    button.addClass("extreme-uv");
                    button.css("color", "white");
                    button.css("background-color", "#4B0082");
                }
                console.log("Lo:0-2.99, Mo:3-5.99, Hi:6-7.99, vH:8-10.99, Ex:11+");
                console.log("New btn Name", button);
                // make append btn
                $("#current #index-div").append(uvText.append(button));

            },
            error: function (xhr, status, error) {
                alert(
                    "Result: " +
                    status +
                    " " +
                    error +
                    " " +
                    xhr.status +
                    " " +
                    xhr.statusText,
                );
            },
        });
    }

    // get current history, if any
    let history = JSON.parse(window.localStorage.getItem("history")) || [];
   /* console.log("-- || localStorage History Array || --");
    console.log("Current History:", history);
    console.log("History's Length:", history.length);*/

    if (history.length > 0) {
        weatherApp(history[history.length - 1]);
    }
    //console.log("History's Length:", history.length, "if > 0 weatherApp");

    for (let i = 0; i < history.length; i++) {
        makeHistory(history[i]);
    }
  /*  console.log(
        "History's Length:",
        history.length,
        "for",
        i,
        "= 0",
        i,
        "<",
        history.length,
        "makeHistory",
    );*/
});

//this is clear button

$("#clearBtn").on("click", function () {
    console.clear();
    // clear
    localStorage.clear();
    // reload list
    window.location.reload();
});

