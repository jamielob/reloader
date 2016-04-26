console.log('Reloader 1', Reloader)
import {Reloader} from 'meteor/jamielob:reloader'
console.log('Reloader 2', Reloader)

import { _ } from 'meteor/underscore';
import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon'

describe('refresh', function() {

  beforeEach(function() {
    Reloader.reload = sinon.spy(); // todo save original and repair if needed later
  });

  describe('startAndResume', function() {

    Reloader.configure({
      refresh: 'startAndResume'
    })
   
    it('reloads on resume when update is available', function() {
      Reloader.updateAvailable.set(true);

      Reloader._onResume();
      
      assert.isTrue(Reload.reload.called);
    });

    it("doesn't reload on resume when update isn't available", function() {
      Reloader.updateAvailable.set(false);

      Reloader._onResume();
      
      assert.isFalse(Reload.reload.called);
    });

    it('reloads on start when update is available', function() {
      Reloader.updateAvailable.set(true);

      Reloader._onPageLoad();
      
      assert.isTrue(Reload.reload.called);
    });

  })

  describe('start', function() {

    Reloader.configure({
      refresh: 'start'
    })

    it("doesn't reload on resume when update is available", function() {
      Reloader.updateAvailable.set(true);

      Reloader._onResume();
      
      assert.isFalse(Reload.reload.called);
    });

    // todo

  });
})

describe('check', function() {
  // should call / not call _checkForUpdate
})
