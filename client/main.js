//Reloader.refreshInstantly = true;
Reloader.check = 'everyStart'; //When to make additional checks for new code bunles.  'everyStart', 'firstStart' or false.
Reloader.checkDelay = 3000;  //How long to wait when checking for new files bundles.
Reloader.idleCutoff = 1000 * 60 * 10; //How long (in ms) can an app be idle before we do an additional check for new files. Defaults at 10 minutes.  Set to 0 to never do an additional check on resume.