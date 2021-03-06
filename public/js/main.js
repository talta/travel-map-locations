
//Cookie handler:
var cname = '';

///check if a cookie exists:
function checkCookie(){
	var user = getCookie("username");
	displayUserName(user, "newUser");
	if(user === "" || user === null){
		$("#userModal").modal()
		usernameButtonListener(user);
	}else{
		handleUserName(user);
	};
};

///if no cookie exists, set the cookie:
function setCookie(cname, cvalue, exdays){
	d = new Date();
	d.setTime(d.getTime()+ (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname+ "="+cvalue + ";"+expires+";path=/"
};

///get any existing cookies:
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

function handleUserName(user){
	setUserId(user);
	displayUserName(user);
	getAllUserLocations();
};

function usernameButtonListener(user){
	$("#createUserButton").on("click", function(){
		user = $("input#userName").val();
		if(user !== "" && user !== null){ 
			setCookie("username", user, 365);
		}else{
		 	$('#welcome').html('Welcome to Travel Pin Map.');
		 	return	$('#locationsSpace').html('Please refresh your page to enter a username in order to collect your locations.');
		};
	handleUserName(user);
	});
};

function clearUsername(){
	cname = '';
	checkCookie();
	getAllUserLocations();
};

function displayUserName(user, element){
	if(element === 'newUser'){
		$('#welcome').html('Welcome to Travel Pin Map.');
		$('#locationsSpace').html('Please refresh your page to enter a username in order to collect your locations.');
	}else{
		$('#welcome').html(user + '\'s Map Pin Board');
		$('#locationsSpace').html("Welcome back.  Locations can continue to be added to the map.  By double clicking a location's pin, notes can be added to the location or locations can be deleted.");
	};
};

function setUserId(user){
	state.userId = user;
};



////UI controls:

///called by the google maps instantiation
function displayMap(){
	loc = {lat: 0, lng: 0,}
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 2,
			center: loc,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position: google.maps.ControlPosition.TOP_CENTER
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			streetViewControl: false
		});
		handleMapClickEvent();
};

function handleMapClickEvent(){
	map.addListener('click', function(event){
		getAddress(event);
	});
};

///finds the address of the click event
function getAddress(event){
	parseAddress(event);
	geocodeAddress(latLng);
	
	///parses the click event results in order to be read by the reverse geocoder
	function parseAddress(event){
		latLng = event.latLng.toString();
		latLng = latLng.replace(/[{()}]/g, '');
		latLng = latLng.split(',', 2);
	    latLng = {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
	};

	///reverse geocode the address in order to find the address from the latitute and longitude
	function geocodeAddress(latLng){
		geocoder = new google.maps.Geocoder();    	
		///handles UI updates based on the results and status returned by the geocode function
	    geocoder.geocode({'location': latLng}, function handleAddress(results, status){
			if (status === 'OK'){
					var address = results[0].formatted_address;
					message = address;
					bodyType = 'land';
					createMarkerObject(latLng, address);
			}else {
					bodyType = 'water';
					message = 'This body of water is unmarked, and may contain treasures.';
			};
		});
	};
};

function createMarkerObject(latLng, address){
	newLocationObject = {
		userId: state.userId,
		address: address,
		latitude: latLng.lat,
		longitude: latLng.lng,
		notes: ""
	};
	createLocation(newLocationObject);
};

function setStateToResult(result){
	state.locations = [];
	displayPins();
	state.locations = result;
};

function displayPins(map){
	for(i=0;i<state.locations.length; i++){
		createMarker(state.locations[i]);
	};
};

function createMarker(location){
	///setup to latitude and longitude to be used in the marker instantiation:
	closeInfoWindow();
	locId = location.id;
	var latLng = {lat: parseFloat(location.latitude), lng: parseFloat(location.longitude)};

	///create the marker
	var marker = new google.maps.Marker({
		position: latLng, 
		map: map
		// icon: icon
		////this could be potential flair for the page
	});
	attachMarkerListeners(location, marker, locId);
};

function attachMarkerListeners(location, marker, locId, noteExist){
	marker.addListener('click', function(){
		var noteExist = true;
		displayInfoWindow(location, marker, locId, noteExist)
	});
	marker.addListener('mouseover', function(){
		displayInfoWindow(location, marker, locId);
	});
	marker.addListener('dblclick', function(){
		displayModalWindow(location);
		closeButtonListener();
	});	
};

function closeButtonListener(){
	$("#closeButton").on("click", function(){
		displayPins();
	});
};

function closeInfoWindow(){
	if(prev_infoWindow){
		prev_infoWindow.close();
	};
};

function editInfoWindowNote(noteExist, locId){
	renderNoteDetail(locId);
};

function editLocationNotes(locId, note){
	saveLocationNotes(locId, note);
	hideLocationModal();
};

function deleteLocationControl(locId){
	closeInfoWindow();
	deleteLocation(locId);
	hideLocationModal();
};

function attachNoteListeners(locId, note){
	$("#deleteButton").off().on("click", function(){
		deleteLocationControl(locId)
	});

	$("#saveNotesButton").off().on("click", function(event){
		note  = $("textarea#noteInput").val();
		editLocationNotes(locId, note)
		$("textarea#noteInput").val('');
	});
};



///render Functions:
function displayModalWindow(location){
	$("#dialogModal").modal()
	$('#locationModalHeader').html(location.address);
};

function displayInfoWindow(location, marker, locId, noteExist){
		closeInfoWindow();
	var message = assignMarkerMessage(location);
	
	var infoWindow = new google.maps.InfoWindow({
		content: message,
		maxWidth: 200
	});
	infoWindow.open(map, marker);
	prev_infoWindow = infoWindow;
	
	if(Boolean(noteExist)){
		editInfoWindowNote(noteExist, locId)
		noteExist = false;
	};
};

function hideLocationModal(){
	$("#dialogModal").modal("hide");
};

function changePins(userId){
	getAllUserLocations(userId);
	displayLocations();
};

function renderNoteDetail(locId){
	clearEditPlaceholder();
	$("#editHeader").html('Add or update the notes on your location.');
	state.locations.find(function(location){
		if(location.id===locId){
			var note = location.notes
			if(note===''){
				$("textarea#noteInput").attr("placeholder", 'Add notes to attach to the location');
			}else{
				$("textarea#noteInput").attr("placeholder", note);
			};
		};
	});
	attachNoteListeners(locId, note);
};

function assignMarkerMessage(location){
	if(location.notes === ""){
		message  = "<div class=locationAddress><strong>"+location.address+":</strong></div><br><div class=infoWindowInstruction>Double click for location options.</div>"
	}else{
		message  = "<div class=locationAddress><strong>"+location.address+":</strong></div><br>" + location.notes;
	};
	return message;
};

function clearEditPlaceholder(){
	$("textarea#noteInput").attr("placeholder", '');
};



$(document).ready(function(){
	checkCookie();
});
