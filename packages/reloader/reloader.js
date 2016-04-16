Reloader = {};

if (!Reloader.downloadDelay) Reloader.downloadDelay = 3000;
if (!Reloader.releaseDelay) Reloader.releaseDelay = 100;
if (!Reloader.resumeDelay) Reloader.resumeDelay = 500;
if (!Reloader.idleCutoff) Reloader.idleCutoff = 1000 * 60 * 10; //10 minutes


//Setup the updateAvailable reactiveVar
Reloader.updateAvailable = new ReactiveVar(false);

//On fresh launch
Meteor.startup(function() {

	//Set the last start flag
	localStorage.setItem('reloaderLastStart', Date.now());

	//Hold the launch screen
	let handle = LaunchScreen.hold();

	var lastPause = Number(localStorage.getItem('reloaderLastPause'));
	var idleCutoff = Number(Date.now() - Reloader.idleCutoff);

	//Check if we came from a refresh AND we haven't been idle for longer than the cutoff
	if (localStorage.getItem('reloaderWasRefreshed') && lastPause > idleCutoff) {

		//If this was a refresh, just release the launchscreen
		Meteor.setTimeout(function() {

			handle.release();

			//Reset the refreshed flag
			localStorage.removeItem('reloaderWasRefreshed');

		 }, Reloader.releaseDelay); //Short delay helps with white flash

	} else {

		//Check if we have a HCP after five seconds
		Meteor.setTimeout(function() {

			//If there is a new version available
			if (Reloader.updateAvailable.get()) {

				 //Reload to the latest version
				 window.location.replace(window.location.href);
				
			} 
			
			//Release the launch screen
			Meteor.setTimeout(function() {
				
				handle.release();

				//Reset the new version flag
			    Reloader.updateAvailable.set(false);

			 }, Reloader.releaseDelay); //Short delay helps with white flash


		}, Reloader.downloadDelay);

	}

});


//Watch for the app resuming
document.addEventListener("resume", function () {

  //If there's a new version available
  if (Reloader.updateAvailable.get()) {

		//Show the splashscreen
		navigator.splashscreen.show();
		
		//Hide the splashschreen
		Meteor.setTimeout(function() {

			//Reset the newVersion flag
			Reloader.updateAvailable.set(false);
			
			//Set the refresh flag
			localStorage.setItem('reloaderWasRefreshed', Date.now());
			
			//Refresh
			window.location.replace(window.location.href);
			
		}, Reloader.resumeDelay);

  }

}, false);



//Watch for the device pausing
document.addEventListener("pause", function() {
	//Save to localStorage
	localStorage.setItem('reloaderLastPause', Date.now());
}, false);


//Capture the reload 
Reload._onMigrate(function (retry) {
	console.log('asd');

	if (Reloader.instant) {

		return [true, {}];

	} else {

		//Set the flag
		Reloader.updateAvailable.set(true);

		//Don't refresh yet
		return false;

	}
	

});


//Update available template helper
Template.registerHelper("updateAvailable", function() {
	return Reloader.updateAvailable.get();
});

//Update available event
$(document).on('click', '[reloader-update]', function(event) {

	//Show the splashscreen
	navigator.splashscreen.show();

	//Hide the splashschreen
	Meteor.setTimeout(function() {

		//Set the refresh flag
		localStorage.setItem('reloaderWasRefreshed', Date.now());

		//Refresh
		window.location.replace(window.location.href);

	}, Reloader.resumeDelay);

});
