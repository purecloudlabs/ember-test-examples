import Ember from 'ember';

export default Ember.Component.extend({
  async: Ember.inject.service(),

  init () {
    this._super();
    const async = this.get('async');
    // async.on('someServiceEvent', Ember.run.bind(this, this.handleServiceEvent));
    // async.on('someServiceEventBetter', Ember.run.bind(this, this.handleServiceEventBetter));
    async.on('someServiceEvent', this.handleServiceEvent.bind(this));
    async.on('someServiceEventBetter', this.handleServiceEventBetter.bind(this));
  },

  someServiceEventData: null,
  someServiceEventDataBetter: null,
  showButton: true,

  willDestroyElement () {
    const async = this.get('async');
    async.off('someServiceEventBetter', this.handleServiceEvent);
  },

  handleServiceEvent (data) {
    Ember.Logger.log('handling someServiceEvent');
    this.set('someServiceEventData', JSON.stringify(data));
  },

  handleServiceEventBetter (data) {
    Ember.Logger.log('handling someServiceEventBetter', data);
    this.set('someServiceEventDataBetter', JSON.stringify(data));
  },

  delayHideMessage() {
    Ember.run.later(() => {
      this.set('message', null);
      this.set('showButton', true);
    }, 3000);
  },

  actions: {
    loadData () {
      this.set('showButton', false);
      this.get('async').doSomethingThatMightTimeoutBetter()
        .then(() => {
          this.set('message', 'Success!');
        }).catch(() => {
          this.set('message', 'Error!');
        }).finally(() => {
          // if you spin off another async event here, with no handle
          // to it in tests, you can't control how it gets run within the run loop
          Ember.run.later(() => {
            this.set('message', null);
            this.set('showButton', true);
          }, 3000);
        });
    }
  }
});
