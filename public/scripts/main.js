

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
        $.getJSON(crime_api_url+"/incidents", (data) =>{
            resolve(data);
        });
    });

    Promise.all([promise1, promise2, promise3]).then(function(results){
        codes = results[0];
        neighborhoods = results[1];
        incidents = results[2];


        console.log(codes);
        console.log(neighborhoods);
        console.log(incidents.I18218701.date);
        //app.rowData.push(incidents);

        var code;
        var template;
        for (key in incidents) {
            code = Object.keys(incidents)[0];
            //var d = incidents[key]
            //console.log(d);
            template = {
                codeNum: "",
                incident: "",
                date: "",
                address: "",
                neighborhood: "",
                policeGrid: ""
            };
            template.codeNum = code;
            template.incident = incidents[key].incident;
            template.date = incidents[key].date;
            template.address = incidents[key].block;
            template.neighborhood = incidents[key].neighborhood_number;
            template.policeGrid = incidents[key].police_grid; 
            //console.log(template);
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
    

    app = new Vue({
        el: "#app",
        data: {
            input: "",
            rowData:[]
                            /*rowData:[
                                {cn: ""},
                                {it: ""},
                                {d: ""},
                                {b: ""},
                                {nh: ""},
                                {pg: ""}
                            ]*/
        }
    });

    //app.rowData = [{nh: "1", it: '2', d:"d"} , {nh: "2", it: '3', d:"e"}]


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