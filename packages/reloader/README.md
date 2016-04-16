##Reloader

More control over hot code push reloading for your production apps.   Designed to replace `mdg:reload-on-resume` and provide a more production-ready approach.

##Installation

`meteor add jamielob:reloader`

##Setup

No setup required, just add the package.



##Possible Refresh Modes

###Refresh instantly
This is the same as default behaviour in Meteor.  Code updates are refreshed immeidately.

###Refresh on resume 
Code updates are downloaded in the background while the app is open, but aren't applied until the app is resumed.  Resuming occurs when the app is put into background and then re-opened.  For example, during multi-tasking.

###Refresh on cold start
Code updates are downloaded in the background while the app is open, but aren't applied until the app is fully closed and then re-opened.  This could be trhough user action or by the phone closing the app in the background because it has been idle for a while or taking up memory.



##Possible Check Modes

Code updates are always downloaded in the background while the app is open, but we can also force other times to look for latest code.

###Check on resume
Make an additional check when resuming to make sure we have the latest code update.  This mode takes an additional parameter of an idle cutoff so that we can configure it not to do an additional check if within a certain time - for example, if the user is just multitasking between apps.

###Check on cold start
This ensures that we always check for the latest version when the app is started fresh, including the first ever start of the app.

###Check on first start
This makes sure we only do an additional check for the latest code the first time the app is ever started - i.e Just installed.







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