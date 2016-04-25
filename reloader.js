Reloader = {

	_options: {},

	configure(options) {
		check(options, {
			check: Match.Optional(Match.OneOf('everyStart',
																				'firstStart',
																				false)),
			checkTimer: Match.Optional(Match.Integer),
			refresh: Match.Optional(Match.OneOf('startAndResume',
																					'start',
																					'instantly')),
			idleCutoff: Match.Optional(Match.Integer),
			refreshInstantly: Match.Optional(Boolean),
			launchScreenDelay: Match.Optional(Match.Integer),
		});
		
		_.extend(this._options, options);
	},

  updateAvailable: new ReactiveVar(false)
};

// Set the defaults
Reloader.configure({
	check: 'everyStart',
	checkTimer: 3000,
	refresh: 'startAndResume',
	idleCutoff: 1000 * 60 * 10, // 10 minutes
	launchScreenDelay: 100
});


// Either everyStart is set OR firstStart is set and it's our first start
const shouldCheckForUpdate = () => {
	Reloader._options.check === 'everyStart' ||
		(
			Reloader._options.check === 'firstStart' &&
			!localStorage.getItem('reloaderLastStart')
		)
};

const launchScreen = LaunchScreen.hold();

const lastPause = Number(localStorage.getItem('reloaderLastPause'));

// If this was a refresh, just release the launchscreen (after a short delay to hide the white flash)
if ( localStorage.getItem('reloaderWasRefreshed') ) {

	Meteor.setTimeout(function() {

		launchScreen.release();

		// Reset the reloaderWasRefreshed flag
		localStorage.removeItem('reloaderWasRefreshed');

	}, Reloader._options.launchScreenDelay); // Short delay helps with white flash

	// Otherwise this should be treated as a cold start
} else {

	if (shouldCheckForUpdate()) {

		// Check if we have a HCP after the check timer is up
		Meteor.setTimeout(function() {

			// If there is a new version available
			if (Reloader.updateAvailable.get()) {

				// Reset the new version flag
				Reloader.updateAvailable.set(false);

				// Set the refresh flag
				localStorage.setItem('reloaderWasRefreshed', Date.now());

				// Reload the page
				window.location.replace(window.location.href);
				
			} else {

				// Just release the splash screen
				launchScreen.release();

			}
			

		}, Reloader._options.checkTimer );

	} else {

		// Otherwise just relase the splash screen
		launchScreen.release();

	}

}

// Set the last start flag
localStorage.setItem('reloaderLastStart', Date.now());


// Watch for the app resuming
document.addEventListener("resume", function () {

  	// Grab the last time we paused
	const lastPause = Number(localStorage.getItem('reloaderLastPause'));

	// Calculate the cutoff timestamp
	const idleCutoffAt = Number( Date.now() - Reloader._options.idleCutoff );

	// Check if the idleCutoff is set AND we exceeded the idleCutOff limit AND the everyStart check is set
	if ( Reloader._options.idleCutoff && lastPause < idleCutoffAt && Reloader._options.check === 'everyStart') {

		// Show the splashscreen
		navigator.splashscreen.show();

	  	// Check if we have a HCP after the check timer is up
		Meteor.setTimeout(function() {

			// If there is a new version available
			if (Reloader.updateAvailable.get()) {

				// Reset the new version flag
				Reloader.updateAvailable.set(false);

				// Set the refresh flag
				localStorage.setItem('reloaderWasRefreshed', Date.now());

				// Reload the page
				window.location.replace(window.location.href);
				
			} else {

				// Hide the splashscreen
				navigator.splashscreen.hide();

			}
			

		}, Reloader._options.checkTimer);


	 // If we don't need to do an additional check
	 } else {

	  	 // Check if there's a new version available already AND we need to refresh on resume
	  	 if ( Reloader.updateAvailable.get() && Reloader._options.refresh === 'startAndResume' ) {

	  	 	// Show the splashscreen
			navigator.splashscreen.show();

	  	 	// Reset the new version flag
			Reloader.updateAvailable.set(false);

	  	 	// Set the refresh flag
			localStorage.setItem('reloaderWasRefreshed', Date.now());
			
			// Refresh
			window.location.replace(window.location.href);

	  	} 

	 }

}, false);



// Watch for the device pausing
document.addEventListener("pause", function() {
	// Save to localStorage
	localStorage.setItem('reloaderLastPause', Date.now());
}, false);


// Capture the reload 
Reload._onMigrate(function (retry) {

	if (Reloader._options.refreshInstantly) {

		// Show the splashscreen
		navigator.splashscreen.show();

		// Set the refresh flag
		localStorage.setItem('reloaderWasRefreshed', Date.now());

		// Reload the page
		window.location.replace(window.location.href);

		// return [true, {}];

	} else {

		// Set the flag
		Reloader.updateAvailable.set(true);

		// Don't refresh yet
		return false;

	}
	

});


// Update available template helper
Template.registerHelper("updateAvailable", function() {
	return Reloader.updateAvailable.get();
});

// Update available event
$(document).on('click', '[reloader-update]', function(event) {

	// Show the splashscreen
	navigator.splashscreen.show();

	// Set the refresh flag
	localStorage.setItem('reloaderWasRefreshed', Date.now());

	// Reload the page
	window.location.replace(window.location.href);

});
