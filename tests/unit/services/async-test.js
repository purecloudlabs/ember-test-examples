import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';

let service;
moduleFor('service:async', 'Unit | Service | async', {
  beforeEach: function () {
    service = this.subject();
  }
});


// A BAD TEST
test('loadSomething | it can load something (expected to fail)', function (assert) {
  service.loadSomething();

  // because loadSomething doesn't return a promise, we have to use
  // a run later to figure out if it worked.
  const done = assert.async();
  Ember.run.later(() => {
    assert.ok(service.get('someData'), 'someData was set sometime after ajax request'); // don't forget to describe your assertions
    done();
  }, 500); // change to 2000 and watch it pass
});

// wait is great... until it ain't
// wait doesn't work if doing anything with non-ember-runloop async
// i.e., setTimeout, setInterval, native Promises, jquery ajax (ember ajax wraps it)
test('loadSomething | it can load something and wait (expected to fail)', function (assert) {
  service.loadSomething();
  return wait().then(() => {
    // this test will not pass even with using `wait` because it's non-ember-runloop async
    assert.ok(service.get('someData'), 'some data was set after waiting on ajax request');
  });
});

// use wait with ember rsvp async method
// This is better than using run later in test, but can still be improved...
test('loadSomething2 | it can load something and wait on ember rsvp', function (assert) {
  service.loadSomething2();
  return wait().then(() => {
    assert.ok(service.get('someData2'), 'some data was set after waiting on ajax request');
  });
});

// what if instead of waiting at all, we just return the promise?
test('loadSomethingBetter | it can load something better', function (assert) {
  return service.loadSomethingBetter().then(() => {
    assert.ok(service.get('someDataBetter'), 'someDataBetter was set after the ajax request finished')
  });
});


// test looks straightforward, but it's complex - why use evented if not needed?
test('doSomethingThatMightTimeout', function (assert) {
  const done = assert.async();
  service.doSomethingThatMightTimeout();
  service.on('asyncOperationError', function () {
    assert.expect(0);
    done();
  });
});

// again, use promises and you don't need evented (trigger/on) at all
test('doSomethingThatMightTimeoutBetter', function (assert) {
  return service.doSomethingThatMightTimeoutBetter().catch((err) => {
    assert.ok(err instanceof Error, 'an error was thrown');
  });
});

// so how can you make these tests faster? use environment to change timeout intervals
// but if you only have one or two tests per component/service that wait for a timeout, this isn't really
// a big deal. If you have dozens of tests waiting 2+ seconds, use environment to change timeout intervals.
