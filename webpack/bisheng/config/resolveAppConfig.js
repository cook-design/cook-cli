const get = require('lodash/get');
const { appConfig } = require('./getOption');
const CB = get(appConfig, 'compile.config', '');

module.exports = function(baseConfig) {
  if (typeof CB === 'function') {
    return CB(baseConfig);
  } else {
    return baseConfig;
  }
};
