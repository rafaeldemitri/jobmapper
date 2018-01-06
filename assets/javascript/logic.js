
var jobListings = [
    { 
    jobName: "Company X",
    jobLoc: "Charlotte, NC",
    jobDescrip: "Web-developer Ninja",
    jobRate: "5 Stars"
    }, 
     
    {
    jobName: "Company Y",
    jobLoc: "San Francisco",
    jobDescrip: "Front-end Developer",
    jobRate: "5 Stars"
    }, 
      
    {
    jobName: "Company Z",
    jobLoc: "New York City, NY",
    jobDescrip: "Back-end Developer",
    jobRate: "5 Stars"
    }];
console.log("JS running");
//function that creates a new div for each object
function jobSearchResults() {
    console.log(jobsArr);

    //loop through the array of objects and create divs
    $("#results").empty();
    for (var i = 0; i < 10; i++) {
        //assign id and class to new divs
        var jobResults = $("<div>");
        jobResults.attr("id", jobsArr[i].jobTitle);
        jobResults.addClass("job-container");
              
        var jobTitleDisplay = $("<div>");
        var companyDisplay = $("<div>");
        var locationDisplay = $("<div>");
        var urlDisplay = $("<div>");

        jobTitleDisplay.addClass("job-Name");
        companyDisplay.addClass("job-company");
        locationDisplay.addClass("job-loc");
        urlDisplay.addClass("job-url");

        jobTitleDisplay.html("<h4>" + jobsArr[i].jobTitle + "</h4>");
        companyDisplay.html("<h4>" + jobsArr[i].company + "</h4>");
        locationDisplay.text(jobsArr[i].location);
        urlDisplay.html("<a href='" + jobsArr[i].detailUrl + "' target='_blank'>" + jobsArr[i].detailUrl + "</a>");

        jobResults.append(jobTitleDisplay);
        jobResults.append(companyDisplay);
        jobResults.append(locationDisplay);
        jobResults.append(urlDisplay);

        if(jobsArr[i].markerPlaced){
            jobResults.addClass("marked");

            var commuteTime = $("<span>");
            console.log(jobsArr[i]);
            commuteTime.text(jobsArr[i].destTime.text);
            var commuteDist = $("<span>");
            commuteDist.text(jobsArr[i].destDist.text);

            commuteDist.addClass("distance");
            commuteTime.addClass("time")

            jobResults.append(commuteTime);
            jobResults.append(commuteDist)
        }

        //display objects in new divs
        //jobResults.html(jobListings[i].jobTitle)
        //jobResults.append(jobListings[i]this.location);
        //jobResults.append(jobListings[i]this.jobCompany);
        //jobResults.append(jobListings[i]this.jobRate);

        //display divs in html
        $("#results").append(jobResults);
    }
};

var map;
var infowindow;
var zip;
var query;
var submitBtn = $("#search-button");
var jobsArr = [];
var center = {lat: 35.2271, lng: -80.8431};
var increment;
var home;
var jobDestArr = [];
var googleQueryTimer;
var markedJobs = [];

submitBtn.on("click", function(){
    // console.log("Clicked submitBtn")
    event.preventDefault();
    
    query = $("#search-input").val();

    var queryURL = "http://service.dice.com/api/rest/jobsearch/v1/simple.json?sort=1&sd=d&city=" + zip + "&text=" + query;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function(response){
        jobsArr = response.resultItemList;
        increment = 0;
        googleQueryTimer = setInterval(findCompanies,100);
    });
});

function initMap(){
    center = {lat: 35.2271, lng: -80.8431};
    var mapDiv = $("#map");
    map = new google.maps.Map(mapDiv[0], {
        center: center,
        zoom:13
    });

    var input = document.getElementById('zip-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
    var marker = new google.maps.Marker({
        map: map,
        icon: "assets/images/homeicon.png",
        anchorPoint: new google.maps.Point(0, -32)
    });

    var infowindow = new google.maps.InfoWindow();
    // var infowindowContent = document.getElementById('infowindow-content');
    // console.log(infowindowContent);
    // console.log(infowindow);

    // infowindow.setContent(infowindowContent);

    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        home = place;
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            // window.alert("No details available for input: '" + place.name + "'");
            return;
        }
        zip = place.address_components[8].long_name;
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
            map.setZoom(11); // Why 11? Because it looks good.
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(11); // Why 11? Because it looks good.
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        // var address = '';
        // if (place.address_components) {
        //     address = [
        //         (place.address_components[0] && place.address_components[0].short_name || ''),
        //         (place.address_components[1] && place.address_components[1].short_name || ''),
        //         (place.address_components[2] && place.address_components[2].short_name || '')
        //     ].join(' ');
        // }

        // infowindowContent.children['place-icon'].src = place.icon;
        // infowindowContent.children['place-name'].textContent = place.name;
        // infowindowContent.children['place-address'].textContent = address;
        // infowindow.open(map, marker);
    });
    
    
    google.maps.event.addDomListener(window, 'resize', initMap);
}

function findCompanies(){
    var service = new google.maps.places.PlacesService(map);
    if (increment<=10){    
        var request = {
            location: center,
            radius: '64373', // ~40mile radius
            query: jobsArr[increment].company
        };     
    service.textSearch(request, placeCallback);
    increment++;
    } else {
            clearInterval(googleQueryTimer);
            commuteCalculator();
    }
}

function placeCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        jobsArr[increment]["markerPlaced"] = true;
        createMarker(results[0]);
        jobDestArr.push(results[0].geometry.location);

    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location; 
    var marker = new google.maps.Marker({ 
        map: map, 
        position: place.geometry.location 
    }); 
    // var commuteUrl = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:" + home + "&destinations=place_id:"+ place.place_id + "&key=AIzaSyBde53Rvo9H70BiGhQ36rTPe-u1V4ySCPQ";
    // console.log(commuteUrl);
    // $.ajax({
    //     url: commuteUrl,
    //     method: "GET"
    // }).done(function(response){
    //     console.log(response);
    // });
    google.maps.event.addListener(marker, 'click', function(){ 
        infowindow.setContent(place.name); 
        infowindow.open(map, this); 
    }); 
}

function commuteCalculator(){
var origin1 = home.geometry.location;
var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
  {
    origins: [origin1],
    destinations: jobDestArr,
    travelMode: 'DRIVING',
    // transitOptions: TransitOptions,
    // drivingOptions: DrivingOptions,
    unitSystem: google.maps.UnitSystem.IMPERIAL
    // avoidHighways: Boolean,
    // avoidTolls: Boolean,
  }, distanceCallback);
}

function distanceCallback(response, status) {
    if (status == 'OK') {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        var responseCounter = 0
        for (var j = 0; j < 10; j++) {
            if(jobsArr[j].markerPlaced){
                jobsArr[j]["destTime"] = response.rows[0].elements[responseCounter].duration;
                jobsArr[j]["destDist"] = response.rows[0].elements[responseCounter].distance;
                responseCounter++;
                console.log(jobsArr[j]);
            }
        }
        console.log(jobsArr);
        jobSearchResults();
        // for (var i = 0; i < jobDestArr.length; i++) {
        //   var results = response.rows[i].elements;
        //   for (var j = 0; j < results.length; j++) {
        //     var element = results[j];
        //     var distance = element.distance.text;
        //     var duration = element.duration.text;
        //     var from = origins[i];
        //     var to = destinations[j];
        //   }
    }
}


// function createHome(place) {
//     var placeLoc = place.geometry.location; 
//     var marker = new google.maps.Marker({ 
//         map: map,
//         icon: "assets/images/homeicon.png"
//         position: place.geometry.location 
//     }); 
//     google.maps.event.addListener(marker, 'click', function(){ 
//         infowindow.setContent(place.name); 
//         infowindow.open(map, this); 
//     }); 
// }
