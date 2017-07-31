import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';

moduleForComponent('async-ui', 'Integration | Component | async ui', {
  integration: true
});


// This test is expected to fail, because it's bad
// This is a tricky thing to test - that service events are triggering changes to the display data
test('it updates the display value of server data coming in on events (expected to fail unless using run.bind)', function(assert) {
  const done = assert.async();

  this.render(hbs`{{async-ui}}`);

  assert.equal(this.$('.welcome').length, 1, 'welcome test is rendered');
  const data = this.$('.some-service-event-data-better').text();
  assert.equal(data, '', 'No data is yet rendered from the service');
  Ember.run.later(() => {
    const newData = this.$('.some-service-event-data-better').text();
    assert.ok(newData, 'Data is rendered from the service');
    assert.notEqual(data, newData, 'data has changed');
    done();
  }, 3500);

  // this test fails because we don't have control over the interval that fires events
  // meaning that this runs outside of our ember runloop, and the tests throw.
  // changing our bindings to `async.on('someServiceEventBetter', Ember.bind.run(this, this.handleServiceEventBetter))`
  // makes the test pass
});

test('it updates the display value of server data coming in on events', function (assert) {
  this.render(hbs`{{async-ui}}`);

  const data = this.$('.some-service-event-data-better').text();
  assert.equal(data, '', 'No data is yet rendered from the service');

  // async.trigger has async side effects, so wrap in an ember run
  Ember.run(() => {
    // instead of allowing this to fire on it's own, grab it and fire the event explicitly
    // inside our ember runloop context
    const async = Ember.getOwner(this).lookup('service:async');
    async.trigger('someServiceEventBetter', { data: Ember.uuid() });
  });
  // it's not necessary to `wait` here since all of your async side effects were
  // resolved by the runloop
  const newData = this.$('.some-service-event-data-better').text();
  assert.ok(newData, 'Data is rendered from the service');
  assert.notEqual(data, newData, 'data has changed');
});

test('it does some async stuff with a button', function (assert) {
  this.render(hbs`{{async-ui}}`);

  const async = Ember.getOwner(this).lookup('service:async');
  const defer = Ember.RSVP.defer();
  sinon.stub(async, 'doSomethingThatMightTimeoutBetter').returns(defer.promise);

  Ember.run(() => {
    this.$('button').click();
  });

  assert.equal(this.$('button').length, 0, 'the button was removed');
  assert.equal(this.$('.loading').length, 1, 'the loading message was shown');
  Ember.run(() => {
    defer.reject();
  });
  assert.equal(this.$('.message').length, 1, 'the error message was shown');
  return wait().then(() => {
    assert.equal(this.$('.message').length, 0, 'the error message was hidden');
    assert.equal(this.$('button').length, 1, 'the button was shown');
  })
});
