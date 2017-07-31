/* global Promise */
import Ember from 'ember';

const results = [{id: 1, name: 'Murakami'}, {id: 2, name: 'Gaiman'}, {id: 3, name: 'Tokien'}];
function ajax() {
  // simulating ajax - not a true ember promise
  return new Promise(resolve => setTimeout(resolve.bind(null, results), 2000));
}

function fastAjax() {
  return new Promise(resolve => setTimeout(resolve.bind(null, results), 30));
}

function emberAjax() {
  return new Ember.RSVP.Promise(resolve => Ember.run.later(resolve.bind(null, results), 2000));
}

export default Ember.Service.extend(Ember.Evented, {
  loaded: false,

  init () {
    this._super(...arguments);

    // this makes tests fail, because it doesn't get cleaned up
    // Ember.run.later(this, function () {
    //   this.set('loaded', true);
    // }, 2000);

    // this works better, if async stuff should get done on startup
    this.set('initLoading', Ember.run.later(this, function () {
      this.set('loaded', true);
    }));

    // this setInterval doesn't get cleaned up, so it causes tests to fail
    // simlulates some service event that happens outside of this service
    // setInterval(() => {
    //   const data = { data: Ember.uuid() };
    //   this.set('gotServiceEvent', data);
    //   this.trigger('someServiceEvent', data);
    //   Ember.Logger.log('trigger someServiceEvent');
    // }, 3000);

    // for a better solution, save the handler/interval so it can be cleaned up on destroy
    const interval = setInterval(this._handleServiceEventBetter.bind(this), 3000);
    this.set('serviceInterval', interval);
  },

  willDestroy () {
    const interval = this.get('serviceInterval');
    Ember.run.cancel(this.get('initLoading'));
    clearInterval(interval);
  },

  someData: null,
  someDataBetter: null,

  // example of bad
  loadSomething () {
    ajax().then(results => this.set('someData', results));
  },

  // example of bad
  loadSomething2() {
    emberAjax().then(results => this.set('someData2', results))
  },

  // example of good
  loadSomethingBetter () {
    return ajax().then(results => this.set('someDataBetter', results));
  },

  gotCpUpdate: false, // for doSomethingThatMightTimeout
  cpUpdateDeferred: false, // for doSomethingThatMightTimeoutBetter
  handleCPUpdate () {
    this.trigger('asyncOperationSuccess'); // for doSomethingThatMightTimeout
    this.get('cpUpdateDeferred').resolve(); // for doSomethingThatMightTimeoutBetter
  },

  // for example, make ajax request and wait for carrier pigeon update,
  // but carrier pigeon never arrives

  // this has the benefeit of being short and sweet, but has the downside
  // of emitting an async, public event on the service
  // i.e., a consumer has to call this method but also have success/error listeners/handlers
  doSomethingThatMightTimeout () {
    fastAjax();
    Ember.run.later(() => {
      if (!this.get('gotCPUpdate')) {
        this.trigger('asyncOperationError');
      }
    }, 2000);
  },

  // this will ensure a promise is returned that can be directly relied on
  // for both result and error, and doesn't emit separate path events
  doSomethingThatMightTimeoutBetter () {
    return Ember.RSVP.cast(fastAjax()).then(() => {
      if (this.get('gotCPUpdate')) {
        return Ember.RSVP.resolve();
      }

      // Deferred is controversial, but here, we want to be able to reject
      // while another event handler resolves, so it's an appropriate use case.
      // if you use new Promise here instead of deferred, you'll wait 2s for it to resolve,
      // even if handleCPUpdate fires immediately
      const deferred = Ember.RSVP.defer();
      this.set('cpUpdateDeferred', deferred);
      Ember.run.later(function () {
        deferred.reject(new Error('async operation timeout'));
      }, 2000);

      return deferred.promise;
    });
  },

  _handleServiceEventBetter () {
    Ember.Logger.log('trigger someServiceEventBetter');
    const data = { data: Ember.uuid() };
    this.set('someServiceEventBetter', data);
    this.trigger('someServiceEventBetter', data);
  }
});
