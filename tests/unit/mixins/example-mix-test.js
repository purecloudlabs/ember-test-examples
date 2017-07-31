import Ember from 'ember';
import ExampleMixMixin from 'ember-test-examples/mixins/example-mix';
import { module, test } from 'qunit';

module('Unit | Mixin | example mix');

// Replace this with your real tests.
test('it works', function(assert) {
  let ExampleMixObject = Ember.Object.extend(ExampleMixMixin);
  let subject = ExampleMixObject.create();
  assert.ok(subject);

  // in a mixin, for any services, simply do the following:
  subject.set('async', {
    theSingleMethodIWantToStub () {}
  });
});
