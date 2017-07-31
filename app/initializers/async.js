export function initialize(application) {
  window.app = application;
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'async',
  initialize
};
