// developer functions
function appDev() {
  if (IS_DEBUG) {
		myApp.debugButton = document.querySelector("#debugButton");
		myApp.debugConsole = document.querySelector("#debugConsoleLog textarea");
		myApp.isDebugConsoleOpen = false;
		myApp.debugLineNo = 0;
		if(myApp.debugButton) {
			myApp.debugButton.removeAttribute("hidden");
			myApp.debugButton.addEventListener("click", toggleDebugConsole);
			setupDebugButtons();
		}
		if (myApp.debugConsole) {
			log = logText;
			log("Welcome to Postcard");
		}
	}
}

// drop-in logging function for debug mode
function logText(message) {
	myApp.debugConsole.value = myApp.debugLineNo +': '+ message +"\n"+ myApp.debugConsole.value;
	myApp.debugLineNo++;
  // TODO: limit lines (or buffer size)
}

// show/hide textarea log
function toggleDebugConsole(e) {
	myApp.isDebugConsoleOpen = !myApp.isDebugConsoleOpen;
	if(myApp.isDebugConsoleOpen) {
		myApp.debugConsole.parentElement.removeAttribute("hidden");
	} else {
		myApp.debugConsole.parentElement.setAttribute("hidden", true);
	}
}

// debug button functions
function setupDebugButtons() {
	console.log("Setup debug buttons");
	var deviceInfoButton = document.querySelector("#deviceInfoButton");
	var trashButton = document.querySelector("#trashButton");
	if (deviceInfoButton) {
		deviceInfoButton.addEventListener("click", deviceInfoButtonClicked);
	}
	if (trashButton) {
		trashButton.addEventListener("click", trashButtonClicked);
	}
	// Only applicable for native mobile app
	if (!IS_MOCKMOBILE) {
		var stopButton = document.querySelector("#stopButton");
		var startButton = document.querySelector("#startButton");
		if (stopButton) {
			stopButton.removeAttribute("hidden");
			stopButton.addEventListener("click", stopButtonClicked);
		}
		if (startButton) {
			startButton.removeAttribute("hidden");
			startButton.addEventListener("click", startButtonClicked);
		}
	}
}

function stopButtonClicked() {
	log("STOP");
	$.ajax({
		url: myApp.host + 'manager/stop',
		type: 'GET'
	}).fail( function() {
		alert("Error stopping TRM");
	}).done( function(data) {
		log("Stop TRM");
		console.log(data);
	});
}

function startButtonClicked() {
	log("START");
	$.ajax({
		url: myApp.host + 'manager/start',
		type: 'GET'
	}).fail( function() {
		alert("Error starting TRM");
	}).done( function(data) {
		log("Start TRM");
		console.log(data);
	});
}

function deviceInfoButtonClicked() {
	log("IDENTITY EXCHANGE API");
	$.ajax({
		url: myApp.host + 'webview/DeviceIdentity',
		type: 'GET'
	}).fail( function() {
		alert("Error getting DeviceIdentity");
	}).done( function(data) {
		console.log(data);
		if (data.deviceIdentity) {
			log("DeviceIdentity: " + data.deviceIdentity);
		}
		if (data.publicKeyHash) {
			log("PublicKeyHash: " + data.publicKeyHash);
		}
	});
}

function trashButtonClicked() {
	log("DESTROY APP DATABASE(S)");
  destroyPostcards();
}

function destroyPostcards() {
  $.ajax({
		timeout: 1000,
		url: myApp.api + 'destroy',
		type: 'DELETE'
	}).fail( function() {
		alert("Error destroying card db");
	}).done( function(data) {
		console.log(data);
		if (data.ok === true) {
			log("Card db deleted");
      destroyAddresses();
		}
	});
}

function destroyAddresses() {
  $.ajax({
		timeout: 1000,
		url: myApp._api + 'destroy',
		type: 'DELETE'
	}).fail( function() {
		alert("Error destroying address db");
	}).done( function(data) {
		console.log(data);
		if (data.ok === true) {
			log("Address db deleted");
			log("Database(s) destroyed - restart app!");
			alert("Restart app");
		}
	});
}
