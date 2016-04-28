const launchScreen = LaunchScreen.hold();

Reloader = {

  _options: {},

  configure(options) {
    check(options, {
      check: Match.Optional(Match.OneOf('everyStart', 'firstStart', false)),
      checkTimer: Match.Optional(Match.Integer),
      reload: Match.Optional(Match.OneOf('startAndResume', 'start', 'instantly')),
      resumeMethod: Match.Optional(Match.OneOf('eventAndTimer', 'event', 'timer')),
      resumeTimer: Match.Optional(Match.Integer),
      launchScreenDelay: Match.Optional(Match.Integer),
    });

    _.extend(this._options, options);
  },

  _updateAvailable: new ReactiveVar(false),

  updateAvailable() {
    this._updateAvailable.get();
  },

  reload() {
    // Show the splashscreen
    navigator.splashscreen.show();

    // Set the reload flag
    localStorage.setItem('reloaderWasReloaded', Date.now());

    // Reload the page
    window.location.replace(window.location.href);
  },


  // Should check if everyStart is set OR firstStart is set and it's our first start
  _shouldCheckForUpdateOnStart() {
    const isColdStart = !localStorage.getItem('reloaderWasReloaded');
    return isColdStart &&
      (
        this._options.check === 'everyStart' ||
          (
            this._options.check === 'firstStart' &&
              !localStorage.getItem('reloaderLastStart')
          )
      );
  },

  _shouldCheckForUpdateOnResume() {
    // In case a pause event was missed, assume it didn't make the cutoff
    if (!localStorage.getItem('reloaderLastPause')) { return false; }

    // Grab the last time we paused
    const lastPause = Number(localStorage.getItem('reloaderLastPause'));

    // Calculate the cutoff timestamp
    const idleCutoffAt = Number(Date.now() - this._options.idleCutoff);

    // Check for idleCutoff AND idleCutOff is withing limit AND the everyStart check is set
    return (
      this._options.idleCutoff &&
        lastPause < idleCutoffAt &&
        this._options.check === 'everyStart'
    );
  },

  _waitForUpdate(computation) {
    // Check if we have a HCP after the check timer is up
    Meteor.setTimeout(() => {
      // If there is a new version available
      if (this.updateAvailable()) {
        this.reload();
      } else {
        // Stop waiting for update
        if (computation) {
          computation.stop();
        }

        launchScreen.release();
      }
    }, this._options.checkTimer);
  },

  _checkForUpdate() {
    if (this.updateAvailable()) {
      // Check for an even newer update
      this._waitForUpdate();
    } else {
      // Wait until update is available, or give up on timeout
      Tracker.autorun((computation) => {
        if (this.updateAvailable()) {
          this.reload();
        }

        this._waitForUpdate(computation);
      });
    }
  },

  _onPageLoad() {
    if (this._shouldCheckForUpdateOnStart()) {
      this._checkForUpdate();
    } else {
      // Short delay helps with white flash
      Meteor.setTimeout(() => {
        launchScreen.release();

        // Reset the reloaderWasReloaded flag
        localStorage.removeItem('reloaderWasReloaded');
      }, this._options.launchScreenDelay);
    }
  },

  _onResume() {
    const shouldCheck = this._shouldCheckForUpdateOnResume();

    localStorage.removeItem('reloaderLastPause');

    if (shouldCheck) {
      navigator.splashscreen.show();
      this._checkForUpdate();

      // If we don't need to do an additional check
    } else {
      // Check if there's a new version available already AND we need to reload on resume
      if (this.updateAvailable() && this._options.reload === 'startAndResume') {
        this.reload();
      }
    }
  },

  _onMigrate() {
    if (this._options.reload === 'instantly') {
      this.reload();
      // return [true, {}];
    } else {
      // Set the flag
      this._updateAvailable.set(true);

      // Don't reload yet
      return false;
    }
  },

};

// Set the defaults
Reloader.configure({
  check: false,
  reload: 'start',
  resumeMethod: 'eventAndTimer',
  resumeTimer: 1000 * 60 * 60, // 1 hour
  launchScreenDelay: 100,
});


Reloader._onPageLoad();

// Set the last start flag
localStorage.setItem('reloaderLastStart', Date.now());

// Watch for the app resuming
document.addEventListener('resume', () => {
  Reloader._onResume();
}, false);


localStorage.removeItem('reloaderLastPause');

// Watch for the device pausing
document.addEventListener('', () => {
  // Save to localStorage
  localStorage.setItem('reloaderLastPause', Date.now());
}, false);


// Capture the reload
Reload._onMigrate(() => {
  Reloader._onMigrate();
});


// Update available template helper
Template.registerHelper('updateAvailable', () => {
  return Reloader.updateAvailable();
});

// Update available event
$(document).on('click', '[reloader-update]', () => {
  Reloader.reload();
});
