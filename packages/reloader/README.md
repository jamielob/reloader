##Reloader

More control over hot code push reloading for your production apps.   Designed to replace `mdg:reload-on-resume` and provide a more production-ready approach.

##Installation

`meteor add jamielob:reloader`

##Setup

No setup required, just add the package.

##Configuration

There are several configurable options.  You can override them anywhere in your `client/lib` folder.

```
Reloader.downloadDelay = 3000;  //The initial delay used to check for and download new files.
Reloader.releaseDelay = 100; //The short delay after we've updated the app to hide a splash of white screen.
Reloader.resumeDelay = 1000; //How long to wait after resuming the app and applying an update, before hiding the splashscreen.
Reloader.idleCutoff = 1000 * 60 * 10; //How long can an app be idle before we do another check for new files on resume.  Defaults at 10 minutes.
```

To understand these options imagine this scenario.  You are using the app and switch to another app, putting it into background.  30 minutes later you come back to the app.  It is more than possible that there has been an update in that time, so we want to do the full check.  Since it has been longer than the value of `idleCutOff` the plugin runs the full check which takes at least as long as the value of `downloadDelay`.  Alternatively, if your user closes the app and then opens it again within the limit, only updates that have already been downloaded are applied, and the `resumeDelay` is used to make sure that the splashscreen doesn't flash so quickly that it looks odd.

##Helpers

`Reloader.updateAvailable` is a reactive variable that returns true when an update has been downloaded.

```
Reloader.updateAvailable.get(); //Returns true if an update is ready
```

This package provides a template helper that retrieves the value of the reactiveVar easily.

```
{{#if updateAvailable}}
  	<p>Update available!</p>
{{/if}}
```

It also provides an easy reload event that you can attach to a button that will show the splash screen and update to the latest version. Simply add the `reloader-update` attribute to a button.

```
{{#if updateAvailable}}
	<a class="button" reloader-update>Tap here to update!</a>
{{/if}}
```

##Instant mode

Need to make quick updates during development without having to manually reload the app?  Use instant mode!  Simply set Reloader.instant to true in your `client/lib` folder and hot code pushes will happen instantly.

```
Reloader.instant = true;
```