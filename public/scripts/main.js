

function Prompt() {
    $("#dialog-form").dialog({
        autoOpen: true,
        modal: true,
        width: "360px",
        buttons: {
            "Ok": function() {
                var prompt_input = $("#prompt_input");
                Init(prompt_input.val());
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });
}

var app;
var map;

function Init(crime_api_url) {
    console.log(crime_api_url);

    var codes;
    var neighborhoods;
    var incidents

    var promise1 = new Promise(function(resolve, reject) { 
        $.getJSON(crime_api_url+"/codes", (data) =>{
            resolve(data);
        });
    });
    var promise2 = new Promise(function (resolve, reject) { 
        $.getJSON(crime_api_url+"/neighborhoods", (data) =>{
            resolve(data);
        });
    });

    var promise3 = new Promise(function (resolve, reject){
        $.getJSON(crime_api_url+"/incidents?start_date=2019-10-01&end_date=2019-31-10", (data) =>{
            resolve(data);
        });
    });

    Promise.all([promise1, promise2, promise3]).then(function(results){
        codes = results[0];
        neighborhoods = results[1];
        incidents = results[2];
		
		var code;
		var template;

		//Populating Incidents Table
		for(key in incidents) {
		code = Object.keys(incidents)[0];
		template = {
			codeNum: "",
			incident: "",
			date: "",
			address: "",
			neighborhood: "",
			policeGrid: "",
			};
			template.codeNum = key;
			template.incident = incidents[key].incident;
			template.date = incidents[key].date;
			template.address = incidents[key].block;
			template.neighborhood = incidents[key].neighborhood_number;
			template.policeGrid = incidents[key].police_grid; 
			app.rowData.push(template);   
		}
    });

    var southWest = L.latLng(44.887413, -93.203560);
    var northEast = L.latLng(44.992107, -93.005107);
    var bounds = L.latLngBounds(southWest, northEast);

    map = L.map('map', {
        center: [44.9537, -93.0900],
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        maxBounds: bounds
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
	L.marker([44.9537, -93.0900], {title: "Saint Paul"}).addTo(map);
	
    app = new Vue({
        el: "#app",
        data: {
            input: "",
            rowData:[],	
			nHoods:[]
        }
    });
	
	//Populating Neighborhoods
	var n1 = {name: "Conway/Battlecreek/Highwood", loc: L.latLng(44.943373, -93.025156)}
	var n2 = {name: "Greater East Side", loc: L.latLng(44.974008, -93.024006)}
	var n3 = {name: "West Side", loc: L.latLng(44.931727, -93.080589)}
	var n4 = {name: "Dayton's Bluff", loc: L.latLng(44.956556, -93.058301)}
	var n5 = {name: "Payne/Phalen", loc: L.latLng(44.978582, -93.067561)}
	var n6 = {name: "North End", loc: L.latLng(44.977162, -93.112314)}
	var n7 = {name: "Thomas/Dale(Frogtown)", loc: L.latLng(44.959335, -93.121271)}
	var n8 = {name: "Summit/University", loc: L.latLng(44.949461, -93.126188)}
	var n9 = {name: "West Seventh", loc: L.latLng(44.930674, -93.122750)}
	var n10 = {name: "Como", loc: L.latLng(44.982135, -93.149292)}
	var n11 = {name: "Hamline/Midway", loc: L.latLng(44.962991, -93.167290)}
	var n12 = {name: "St. Anthony", loc: L.latLng(44.975372, -93.197652)}
	var n13 = {name: "Union Park", loc: L.latLng(44.948739, -93.177231)}
	var n14 = {name: "Macalester-Groveland", loc: L.latLng(44.934240, -93.176994)}
	var n15 = {name: "Highland", loc: L.latLng(44.913323, -93.177134)}
	var n16 = {name: "Summit Hill", loc: L.latLng(44.936884, -93.138628)}
	var n17 = {name: "Capitol River", loc: L.latLng(44.948931, -93.093272)}
	
	var theHoods = [n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13,n14,n15,n16,n17];
	app.nHoods = theHoods;
	for(let i = 0; i < theHoods.length; i++){
		L.marker(theHoods[i].loc, {title: theHoods[i].name}).addTo(map);
	}
    //Get JSON file form API, use data to populate map//
}

function searchLocation(){
    $.getJSON("https://nominatim.openstreetmap.org/search?q="+app.input+"&format=json", (data) =>{
        console.log(data);
        var lat = data[0].lat;
        var lon = data[0].lon;

        if (lat < 44.887413){
            lat = 44.887413;
        }else if (lat > 44.992107) {
            lat = 44.992107;
        }

        if (lon < -93.203560) {
            lon = -93.203560;
        }else if (lon > -93.005107){
            lon = -93.005107;
        }

        map.panTo(new L.LatLng(lat, lon));

        $("#searchbar").val(data[0].display_name);
    });
}

function visible(neighborhood_number){
	return map.getBounds().contains(app.nHoods[neighborhood_number].loc);
}