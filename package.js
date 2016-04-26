Package.describe({
  name: 'jamielob:reloader',
  version: '1.1.5',
  summary: 'More control over hot code push reloading',
  git: 'https://github.com/jamielob/reloader/',
  documentation: 'README.md'
});

Cordova.depends({
  'cordova-plugin-splashscreen': '3.2.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.1');

  api.use(['ecmascript',
           'check',
           'underscore',
           'reload',
           'templating',
           'reactive-var',
           'tracker'], 'client');

  // So that the app can reference LaunchScreen
  api.imply('launch-screen', 'client');

  api.mainModule('reloader.js', 'client');

  api.export('Reloader', 'client');
});


Package.onTest(function(api) {
  Npm.depends({
    sinon: '1.17.3'
  });

  api.use('jamielob:reloader', 'client')

  api.use(['ecmascript',
           'underscore',
           'practicalmeteor:mocha'], 'client');

  api.mainModule('reloader-tests.js', 'client');
});
