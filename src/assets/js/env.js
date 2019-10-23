// blank values are replaced at runtime by the set-config.js node script
(function(window) {
  window._env = window._env || {};

  window._env.url = '';
  window._env.realm = '';
  window._env.clientId = '';
  window._env.enabled = '';
  window._env.accessToken = '';
  window._env.pollingInterval = '';
})(this);
