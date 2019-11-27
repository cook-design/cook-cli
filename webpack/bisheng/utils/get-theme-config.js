const path = require('path');

const pluginHighlight = path.join(__dirname, '../plugin', 'bisheng-plugin-highlight');

const pluginAntdConfig = {
  noPreview: false,
  pxtorem: false,
};

const pluginCook = path.join(__dirname, '../plugin', `bisheng-plugin-cook?${JSON.stringify(pluginAntdConfig)}`);

module.exports = function getThemeConfig(configFile) {
  const customizedConfig = require(configFile);
  const config = Object.assign({ plugins: [] }, customizedConfig);
  config.plugins = [pluginHighlight, pluginCook];

  return config;
};
