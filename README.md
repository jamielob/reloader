# Reloader

More control over hot code push reloading for your production apps.   Designed to replace `mdg:reload-on-resume` and provide a more production-ready approach.

## Installation

`meteor add jamielob:reloader`

## Setup

No setup required, just add the package.  The default options are shown below. You can override them anywhere in your `client/lib` folder.

```
Reloader.configure({
	check: 'everyStart', //Check for new code every time the app starts 
	checkTimer: 5000,  //Wait 5 seconds to see if new code is available
	refresh: 'startAndResume', //Refresh to already downloaded code on both start and resume
	idleCutoff: 1000 * 60 * 10  //Wait 10 minutes before treating a resume as a start
});
```

These default options will make sure that your app is up to date every time a user starts your app, or comes back to it after 10 minutes of being idle. 

Another popular configuration is:

```
Reloader.configure({
	check: 'firstStart', //Only check for new code the first ever time the app starts
	checkTimer: 5000,  //Wait 5 seconds to see if new code is available on first start
	refresh: 'start' //Only refresh to already downloaded code on a start and not a resume
});
```

This will make sure the first time your app is run it is up to date, will download new versions of code while the app is being used, and then only update when the app is next started.


### check

When to make additional checks for new code bundles. The app splash screen is shown during the check. Possible values are:

- `everyStart`: Check every time the app starts.  Does not include resuming the app, unless the `idleCutOff` has been reached.
- `firstStart`: Check only the first time the app starts (just after downloading it).
- `false`: Never make additional checks and rely purely on code bundles being downlaoded in the background while the app is being used.

### checkTimer

How long to wait (in ms) when making additional checks for new file bundles. In future versions of Meteor we will have an API to instantly check if an update is available or not, but until then we need to simply wait to see if a new code bundle is downloaded.  Extend this if you find that you have new code immediately after starting the app.

### refresh

When to refresh to the latest code bundle if one was downloaded while using the app.  The app splash screen is shown during the refresh. Possible values are:

- `startAndResume`: Refresh to the latest bundle both when starting and resuming the app.
- `start`: Refresh only when the app is started (not resumed).
- `instantly`: Overrides everything else.  If set, your app will have similar behaviour to the default in Meteor, with code updates being refreshed immeidately. The only improvement/difference is that the app's splash screen is displayed during the refresh.




### idleCutoff

How long (in ms) can an app be idle before we consider it a start and not a resume.  Set to `0` to never do an additional check on resume.




## Helpers

These helpers can help you to have an "Update Now" button.

#### A note about using these helpers ####
Some people have reported having their app rejected during the Apple review process for having an "Update Now" button or similar as opposed to using the refresh on resume behavior that this package provides by default.  If you really want to have an update button when new code is available, make sure you don't push any new code to the server until after your app has been approved. But it's probably safer/better to simply not have an update button at all!

#### How to use them anyway ####

`Reloader.updateAvailable` is a reactive variable that returns true when an update has been downloaded.

```
Reloader.updateAvailable.get(); //Reactively returns true if an update is ready
```

This package provides a template helper that retrieves the value of the reactiveVar easily.

```
{{#if updateAvailable}}
  	<p>Update available!</p>
{{/if}}
```

It also provides an easy reload event that you can attach to a button that will briefly show the splash screen and update to the latest version. Simply add the `reloader-update` attribute to a button.

```
{{#if updateAvailable}}
	<a class="button" reloader-update>Tap here to update!</a>
{{/if}}
```



