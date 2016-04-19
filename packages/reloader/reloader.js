Reloader = {};

if (!Reloader.check) Reloader.check = 'everyStart'; //When to make additional checks for new code bunles.  everyStart or firstStart
if (!Reloader.checkTimer) Reloader.checkTimer = 3000;  //How long to wait when checking for new files bundles.
if (!Reloader.idleCutoff) Reloader.idleCutoff = 1000 * 60 * 10; //How long (in ms) can an app be idle before we consider it a start and not a resume. Defaults at 10 minutes.


//Setup the updateAvailable reactiveVar
Reloader.updateAvailable = new ReactiveVar(false);

//On fresh launch
Meteor.startup(function() {

	//Hold the launch screen
	const handle = LaunchScreen.hold();

	//Grab the last time we paused
	const lastPause = Number(localStorage.getItem('reloaderLastPause'));

	//Calculate the cutoff timestamp
	const idleCutoff = Number(Date.now() - Reloader.idleCutoff);

	//Check if we came from a refresh 
	if ( localStorage.getItem('reloaderWasRefreshed') ) {

		//If this was a refresh, just release the launchscreen (after a short delay to hide the white flash)
		Meteor.setTimeout(function() {

			handle.release();

			//Reset the reloaderWasRefreshed flag
			localStorage.removeItem('reloaderWasRefreshed');

		 }, 100); //Short delay helps with white flash

	//Otherwise this should be treated as a cold start
	} else {

		//Check if we need to check for an update (Either everyStart is set OR firstStart is set and it's our first start)
		if ( Reloader.check === 'everyStart' || ( Reloader.check === 'firstStart' && !localStorage.getItem('reloaderLastStart') ) ) {

			//Check if we have a HCP after the check timer is up
			Meteor.setTimeout(function() {

				//If there is a new version available
				if (Reloader.updateAvailable.get()) {

					//Reset the new version flag
					Reloader.updateAvailable.set(false);

					//Set the refresh flag
					localStorage.setItem('reloaderWasRefreshed', Date.now());

					//Reload the page
					window.location.replace(window.location.href);
					
				} else {

					handle.release();

				}
				

			}, Reloader.checkTimer);

		} else {

			//Otherwise just relase the splash screen
			handle.release();

		}

	}

	//Set the last start flag
	localStorage.setItem('reloaderLastStart', Date.now());

});


//Watch for the app resuming
document.addEventListener("resume", function () {

  	//Grab the last time we paused
	const lastPause = Number(localStorage.getItem('reloaderLastPause'));

	//Calculate the cutoff timestamp
	const idleCutoff = Number(Date.now() - Reloader.idleCutoff);

	//Check if the idleCutoff is set AND we exceeded the idleCutOff limit AND the everyStart check is set
	if ( Reloader.idleCutoff && lastPause < idleCutoff && Reloader.check === 'everyStart') {

		//Show the splashscreen
		navigator.splashscreen.show();

	  	//Check if we have a HCP after the check timer is up
		Meteor.setTimeout(function() {

			//If there is a new version available
			if (Reloader.updateAvailable.get()) {

				//Reset the new version flag
				Reloader.updateAvailable.set(false);

				//Set the refresh flag
				localStorage.setItem('reloaderWasRefreshed', Date.now());

				//Reload the page
				window.location.replace(window.location.href);
				
			} else {

				//Hide the splashscreen
				navigator.splashscreen.hide();

			}
			

		}, Reloader.checkTimer);


	 //If we don't need to do an additional check
	 } else {

	  	 //Check if there's a new version available already
	  	 if (Reloader.updateAvailable.get()) {

	  	 	//Show the splashscreen
			navigator.splashscreen.show();

	  	 	//Reset the new version flag
			Reloader.updateAvailable.set(false);

	  	 	//Set the refresh flag
			localStorage.setItem('reloaderWasRefreshed', Date.now());
			
			//Refresh
			window.location.replace(window.location.href);

	  	} 

	 }

}, false);



//Watch for the device pausing
document.addEventListener("pause", function() {
	//Save to localStorage
	localStorage.setItem('reloaderLastPause', Date.now());
}, false);


//Capture the reload 
Reload._onMigrate(function (retry) {

	if (Reloader.refreshInstantly) {

		//Show the splashscreen
		navigator.splashscreen.show();

		//Set the refresh flag
		localStorage.setItem('reloaderWasRefreshed', Date.now());

		//Reload the page
		window.location.replace(window.location.href);

		//return [true, {}];

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

	//Set the refresh flag
	localStorage.setItem('reloaderWasRefreshed', Date.now());

	//Reload the page
	window.location.replace(window.location.href);

});
