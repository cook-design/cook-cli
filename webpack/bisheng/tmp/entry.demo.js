import React from 'react';
import ReactDOM from 'react-dom';
const chain = require('ramda/src/chain');
const exist = require('exist.js');
const toReactElement = require('jsonml-to-react-element');
import mdData from '../utils/data.js';
import App from '/Users/yongbao.fyb/Desktop/sass/DEF/Cook/cook-cli/webpack/bishengconfig/h5/template/index.jsx';
const appConfig = JSON.parse('{"viewType":"pc"}');

const generateUtils = (data, props) => {
  const plugins = data.plugins.map(pluginTupple => pluginTupple[0](pluginTupple[1], props));
  const converters = chain(plugin => plugin.converters || [], plugins);
  const utils = {
    get: exist.get,
    toReactComponent(jsonml) {
      return toReactElement(jsonml, converters);
    },
  };
  plugins.map(plugin => plugin.utils || {})
    .forEach(u => Object.assign(utils, u));
  return utils;
}

const utils = generateUtils(mdData, {});

ReactDOM.render(
  <App data={mdData.markdown} utils={utils} appConfig={appConfig} />,
  document.getElementById('react-content'),
);

