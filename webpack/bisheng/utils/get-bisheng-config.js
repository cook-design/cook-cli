const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const autoprefixer = require('autoprefixer');

const markdownTransformer = path.join(__dirname, '..', 'transformers', 'markdown');

const defaultConfig = {
  port: 8000,
  source: './posts',
  output: './_site',
  theme: './_theme',
  htmlTemplate: path.join(__dirname, '../template.html'),
  transformers: [],
  devServerConfig: {},
  postcssConfig: {
    plugins: [
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
    ],
  },
  webpackConfig(config) {
    return config;
  },

  entryName: 'index',
  root: '/',
  filePathMapper(filePath) {
    return filePath;
  },
};

module.exports = function getBishengConfig() {
  const customizedConfig = require('../../bishengConfig/index');
  console.log(`customizedConfig: ${JSON.stringify(customizedConfig, null, 2)}`);

  const config = Object.assign({}, defaultConfig, customizedConfig);
  // config.theme = resolve.sync(config.theme, { basedir: process.cwd() });
  config.transformers = config.transformers.concat({
    test: /\.md$/,
    use: markdownTransformer,
  }).map(({ test, use }) => ({
    test: test.toString(), // Hack, for we cannot send RegExp to child process
    use,
  }));
  return config;
};
