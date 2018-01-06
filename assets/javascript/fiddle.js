
var queryURL = "https://webhose.io/search?token=&format=json&q="

// var queryURL = "http://service.dice.com/api/rest/jobsearch/v1/simple.json?sort=1&sd=d&city=" + zipCode + "&text=" + searchParam

var zipCode
var searchParam

$.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      console.log(response)
    });


$("#submit").on("click", function(){
	event.preventDefault();
	zipCode = $("#zipCodeInput").val().trim()
	searchParam = $("#searchInput").val().trim();
});