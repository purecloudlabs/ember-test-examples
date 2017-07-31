import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:application', 'Unit | Controller | application', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo'] /**** NO! BAD EMBER! ****/
  // the reason that this is bad is simple: you're not testing asyncService.
  // you're just testing the component as a unit, so use a test double (stub/mock)
  unit: true,
  beforeEach: function () {
    this.register('service:async', Ember.Service.extend(Ember.Evented, {}));
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
