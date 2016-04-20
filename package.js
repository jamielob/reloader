Package.describe({
  name: 'jamielob:reloader',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'More control over hot code push reloading',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jamielob/reloader/tree/master/packages/reloader',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Cordova.depends({
  'cordova-plugin-splashscreen': '3.2.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.1');
  api.use('ecmascript');
  api.use('check');
  api.use('reload', 'web.cordova');
  api.use('templating', 'web.cordova');
  api.use('reactive-var', 'web.cordova');
  api.use('launch-screen', 'web.cordova');

  api.mainModule('reloader.js', 'web.cordova');

  api.export('Reloader');

});
