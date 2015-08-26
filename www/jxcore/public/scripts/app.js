// Polymer app
var myApp = document.querySelector('#my-app');

// myApp defaults
myApp.title = "Postcards";
myApp.route = "home"; // default route but should redirect to 'login' if no app.name set
myApp.url = "http://localhost:5000/api/cards/";

// myApp session vars
myApp.username = "";
myApp.params = null;

// myApp client-side route handler
function getURL(route, paramArray){
	if(route == myApp.route) {
		console.log("== page already routed '"+ route +"' ==");
		return false;
	}

    // client-side routing handled using page.js
	var path = '/'+route;
	if(paramArray && paramArray.length>0) {
		for(var i=0; i<paramArray.length; i++) {
			path = path + '/' + paramArray[i];
		}
	}

	console.log("=> getURL route: " + route);
	page(path); //page('/editor/1');
}

// generate unique id for postcard
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}