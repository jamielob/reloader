Reloader = {

	_options: {},

	configure(options) {

		if (options.check) {
			check(options.check, String);
			this._options.check = options.check;
		}

		if (options.checkTimer) {
			check(options.checkTimer, Number);
			this._options.checkTimer = options.checkTimer;
		}

		if (options.idleCutoff) {
			check(options.idleCutoff, Number);
			this._options.idleCutoff = options.idleCutoff;
		}

		if (options.refreshInstantly) {
			check(options.refreshInstantly, Boolean);
			this._options.refreshInstantly = options.refreshInstantly;
		}

	}

}

//Set the defaults
Reloader.configure({
	check: 'everyStart', 
	checkTimer: 3000,
	idleCutoff: 1000 * 60 * 10 //10 minutes
});


//Setup the updateAvailable reactiveVar
Reloader.updateAvailable = new ReactiveVar(false);

//On fresh launch
Meteor.startup(function() {

	//Hold the launch screen
	const handle = LaunchScreen.hold();

	//Grab the last time we paused
	const lastPause = Number(localStorage.getItem('reloaderLastPause'));

	//Calculate the cutoff timestamp
	const idleCutoff = Number( Date.now() - Reloader._options.idleCutoff );

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
		if ( Reloader._options.check === 'everyStart' || ( Reloader._options.check === 'firstStart' && !localStorage.getItem('reloaderLastStart') ) ) {

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

					//Just release the splash screen
					handle.release();

				}
				

			}, Reloader._options.checkTimer );

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
	const idleCutoff = Number( Date.now() - Reloader._options.idleCutoff );

	//Check if the idleCutoff is set AND we exceeded the idleCutOff limit AND the everyStart check is set
	if ( Reloader._options.idleCutoff && lastPause < idleCutoff && Reloader._options.check === 'everyStart') {

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
			

		}, Reloader._options.checkTimer);


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

	if (Reloader._options.refreshInstantly) {

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
