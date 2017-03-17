
var cname = '';
// userId = 12345;


///on page load event listener:
///////check if cookie exists function, during the page load

////Cookie handler:

// function setCookie(cname, cvalue, exdays){
// 	d = new Date();
// 	d.setTime(d.getTime()+ (exdays*24*60*60*1000));
// 	var expires = "expires="+d.toUTCString();
// 	document.cookie = cname+ "="+cvalue + ";"+expires+";path=/"
// 	console.log('this is the cookie'+document.cookie);
// };

// function checkCookie(){
// 	var user = getCookie("username");
// 	if(user !== "" || user !== null){
// 		var userName = user;
// 	} else{
// 		user = "theresa Augustin";
// 		////commenting for testing effiency
// 		// user = prompt("Please enter your name: ", "");
// 		if(user !== "" && user !== null){ // (!!user) === Boolean(user)
// 			setCookie("username", user, 365);
// 		};
// 	};
// 	displayUserName(user);
// 	setUserId(user);
// 	///also call getLocations(user);
// 	///handleClickEvent();
// };

// ////test with a button for setting a cookie or deleting a cookie


// function getCookie(cname){
// 	var name = cname + "=";
// 	var decodedCookie  = decodeURIComponent(document.cookie);
// 	var ca = decodedCookie.split(';');
// 	for(var i; i< ca.length; i++){
// 		var c = ca[i];
// 		while (c.charAt(0) == ' '){
// 			c = c.subString(1);
// 		}
// 		if(c.indexOf(name)==(0)){
// 			return c.subString(name.length, c.length);
// 		}
// 	}
// 	return "";
// };


// function displayUserName(user){
// 	///print the userName + 'map board' at the top of the page
// 	console.log('username ' + userName);
// 	$('#welcome').html(userName + '\'s Map Pin Board');
// };

// function setUserId(user){
// 	// state.userId = user;
// 	state.userId = 1234;
// 	console.log('userId', state.userId);
// };






////UI controls:

function displayMap(){
	///called by the google maps instantiation in the index.html file
	loc = {lat: 0, lng: 0,}
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 2,
			center: loc
		});
		handleMapClickEvent();
};

function handleMapClickEvent(){
	map.addListener('click', function(event){
		getAddress(event);
	});
};

function getAddress(event){
	///finds the address of the click event
	parseAddress(event);
	geocodeAddress(latLng);

	function parseAddress(event){
		///parses the click event results in order to be read by the reverse geocoder
		latLng = event.latLng.toString();
		latLng = latLng.replace(/[{()}]/g, '');
		latLng = latLng.split(',', 2);
	    latLng = {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
	};

	function geocodeAddress(latLng){
		///reverse geocode the address in order to find the address from the latitute and longitude
		geocoder = new google.maps.Geocoder();
	    geocoder.geocode({'location': latLng}, function handleAddress(results, status){
	    	///handles UI updates based on the results and status returned by the geocode function
			if (status === 'OK'){
					var address = results[0].formatted_address;
					message = address;
					bodyType = 'land';
				}else {
					bodyType = 'water';
					message = 'This body of water is unmarked, and may contain treasures.';
			}
			createMarkerObject(latLng, address);
		});
	};
};

function createMarkerObject(latLng, address){
	console.log('create marker object called');
	newLocationObject = {
		userId: state.userId,
		address: address,
		latitude: latLng.lat,
		longitude: latLng.lng,
		notes: ""
	};
	createLocation(newLocationObject);
};





function displayPins(){
	for(i=0;i<state.locations.length; i++){
		createMarker(state.locations[i]);
	};
};

function createMarker(location){
	var locId = location.id;
	var latLng = {lat: parseFloat(location.latitude), lng: parseFloat(location.longitude)};
	var marker = new google.maps.Marker({
		position: latLng, 
		map: map
		// icon: icon
		////this could be potential flair for the page
	});

	marker.addListener('click', function(){
		var noteExist = true;
		displayInfoWindow(location, marker, locId, noteExist )
	});

	marker.addListener('mouseover', function(){
		displayInfoWindow(location, marker, locId);
	});
	marker.addListener('dblclick', function(){
		displayModalWindow();
	});
	//////this would be the flair for the page
};

function displayInfoWindow(location, marker, locId, noteExist){
	//////to handle closing previously opened infoWindows:
	if(prev_infoWindow){
		prev_infoWindow.close();
	};
	var message;
	if(location.notes===''){
		message = '<div class="subnote">double click this location in order to add notes.</div>'
		$('')
	}else{
		message  = location.notes;
	}
	var infoWindow = new google.maps.InfoWindow({
		content: message,
		maxWidth: 200
	});
	infoWindow.open(map, marker);
	prev_infoWindow = infoWindow;
	
	if(Boolean(noteExist)){
		console.log('note is not empty');
		editInfoWindowNote(noteExist, locId)
		noteExist = false;
		////modal window
	};
};

function removeListeners(){
	google.maps.event.clearInstanceListeners(marker);
};

function editInfoWindowNote(noteExist, locId){
	//infoWindow edit state
	renderNoteDetail(locId);
};

function renderNoteDetail(locId){
	console.log('render note detail called');
	$("#editHeader").html('this is where one would edit or delete a note');
	state.locations.find(function(location){
		console.log('trying to find the note');
		if(location.id===locId){
			////this placeholder text is not working right now.
			var note = location.notes
			console.log('this would be the note: '+note);
			$("textarea").attr("placeholder", note);
		};
	});
	//button listeners:
	$("#deleteButton").on("click", function(){
		deleteLocationControl(locId)
	});
	$("#saveNotesButton").on("click", function(event){
		newNote  = $("textarea#noteInput").val();
		console.log('this would be the new note');
		console.log(newNote)
		///validations for submit function
		///the note textbox is not empty
		///if($('#noteInput') !== ""){
		editLocationNotes(locId, newNote)
		// event.preventDefault();
	});
};

function displayModalWindow(location){
	//bring up a larger view with the location infomation, notes, potentially an image and info about the country/ city nearby


};

function editLocationNotes(locId, note){
	console.log('editLocationNotes called');
	saveLocationNotes(locId, note);
};

function deleteLocationControl(locId){
	console.log('delete location called');
	///validation that a location exists
	///potential validation to delete the location's pin
	console.log(locId);
	deleteLocation(locId);
	console.log(`id of ${locId} deleted`);
	///confirmation that the pin's location has been deleted
};

function displayLocationInfo(){
	var pinAddress = state.locations.address;
	var locationNotes = state.locations.notes;
	return '<h4>'+pinAddress +'</h4>'+ '<p>'+locationNotes+'</p>'
};





//state modification functions:


function showError(){
	console.log('an error occurred');
};


///on page load
function getAllUserLocations(){
	console.log(`${state.userId}`);
	console.log('get all users locations called');
	var result = $.ajax({
		url: `/mapLocations/${state.userId}`,
		DataType: 'jsonp',
		type: "GET"
	})
	.done(function(result, status){
		console.log('done after get all users locations called, this would be the result:');
		console.log(result);
		setStateToResult(result);
	})
	.fail(function(error, errorThrown){
		errorElem = showError(error);
		$('#errorSpace').append(errorElem);
	})
	.then(function(result){
		console.log('then after get all user locations called');
		displayPins();
	});
};

function setStateToResult(result){
	state.locations = [];
	state.locations = result;
};

////working:
function createLocation(object){
		console.log('create location called');
		var myJsonObject = JSON.stringify(object);

	var result = $.ajax({
		url: `/mapLocation`,
		type: "POST",
		contentType: 'application/json',
		processData: false,
		data: myJsonObject
	})
	.done(function(result, status){
		getAllUserLocations();
	})
	.fail(function(error, errorThrown){
		console.log(error);
		errorElem = showError(error);
		$('#errorSpace').append(errorElem);
	})
	.then(function(result){
		console.log('then called from createLocations');
	});
};


///working:
function deleteLocation(id){
	console.log('delete location called');
	console.log(id);
	var result = $.ajax({
		url: `/mapLocation/${id}`,
		DataType: 'jsonp',
		type: "DELETE"
	})
	.done(function(result, status){
		console.log('delete locations done, this would be the status: ');
		console.log(status);
	})
	.fail(function(error, errorThrown){
		errorElem = showError(error);
		$('#errorSpace').append(errorElem);
	})
	.then(function(result){
		console.log('then called from delete locations');
		getAllUserLocations();
	});
};



function saveLocationNotes(id, note){
	$.ajax({
 		 url: `mapLocation/${id}`,
  		type: 'PUT',
  		data: 'notes:note',
  		success: function(data) {
  			alert('Load was performed.');
  		}
	});
}

// function saveLocationNotes(id, note){
// 	console.log('this is the note', note);
// 	var myJsonNote = JSON.stringify(note);
// 	console.log('save locations called');
// 	var result = $.ajax({
// 		url: `mapLocation/${id}`,
// 		contentType: 'application/json',
// 		// processData: false,
// 		type: "PUT",
// 		data: 'notes:note'
// 	})
// 	.done(function(result){
// 		console.log('save location notes done, this would be the result:');

// 	})
// 	.fail(function(error, errorThrown){
// 		errorElem = showError(error);
// 		$('#errorSpace').append(errorElem);
// 	})
// 	.then(function(result){
// 		console.log('then from update notes called');
// 		getAllUserLocations();
// 	});
// };



///render Functions:


function changePins(userId){
	getAllUserLocations(userId);
	displayLocations();
};


function displayLocations(){
///called on page load 
///renders the state to the map
	console.log('display locations called');

	var arrayOfParagraphs = state.locations.map(function(location){
			return "<p>" + location.address + "</p>";  
	});
	var stringToRender = arrayOfParagraphs.join("\n");
	$("#locationsSpace").html(stringToRender);

};



/////////testing:
function testListeners(){
			var createLocationObject = {
    		"userId": "1234",
    		"address": "somewhere else else",
    		"latitude": "1.9028",
    		"longitude": "72.4964",
    		"notes": "this other super secret place esle"
		}
		var updatedNotesData = {
			"notes": "updated notes from the UI call on 3/15"
		};
		id = '58c839465941040bd00cb473'
	$("#editNoteButton").on("click", function(){
		console.log('notes button clicked');
		saveLocationNotes(id, updatedNotesData)
	});
	///working:
	$("#deleteLocationButton").on("click", function(){
		console.log('delete button called');
		deleteLocation(id);
	});
	////please work
	$("#createLocationButton").on("click", function(){
		console.log('create button called');
		createLocation(createLocationObject)
	});
};





$(document).ready(function(){
	console.log('the document is ready');
	// displayMap();
	// checkCookie();
	// console.log(state.locations)
	testListeners();
	displayLocations();
	getAllUserLocations();

	// $('#myModal').modal('toggle');
$('#myModal').modal();

});
