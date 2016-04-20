# Reloader

More control over hot code push reloading for your production apps.   Designed to replace `mdg:reload-on-resume` and provide a more production-ready approach.

## Installation

`meteor add jamielob:reloader`

## Setup

No setup required, just add the package.  The default options are shown below. You can override them anywhere in your `client/lib` folder.

```
Reloader.configure({
	check: 'everyStart', 
	checkTimer: 3000,  //3 seconds
	idleCutoff: 1000 * 60 * 10  //10 minutes
});
```

`check`: When to make additional checks for new code bundles.  `everyStart`, `firstStart` or `false`.

`checkTimer`: How long to wait when checking for new files bundles.

`idleCutoff`: How long (in ms) can an app be idle before we do an additional check for new files. Defaults at 10 minutes.  Set to `0` to never do an additional check on resume.

These default options will make sure that your app is up to date every time a user starts your app, or comes back to it after 10 minutes of being idle. 

You can also override the above options with:

```
Reloader.configure({
	refreshInstantly: true
});
```

If set, your app will have similar behaviour to the default in Meteor, with code updates being refreshed immeidately. The only improvement/difference is that the app's splash screen is displayed during the refresh.



## Helpers

These helpers can help you to have an "Update Now" button.

**A note about using these helpers**: Some people have reported having their app rejected during the Apple review process for having an "Update Now" button or similar as opposed to using the refresh on resume behaviour that this package provides by default.  If you really want to have an update button when new code is available, make sure you don't push any new code to the server until after your app has been approved.

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



