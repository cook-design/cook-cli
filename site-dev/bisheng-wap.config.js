const os = require('os');
const pxtoremPlugin = require('postcss-pxtorem');
const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');

const commonConfig = require('./bisheng.common.config');

process.env.bishengType = 'mobile';

const { document, mentorPkg } = require(`${os.homedir()}/.mentor/pkg.json`);
const { mentorConfig } = mentorPkg;
let { platform } = mentorPkg;
platform = platform || mentorConfig.platform || '';

module.exports = Object.assign({}, commonConfig, {
  port: 9002,
  source: {
    document,
  },
  output: './_site-dev/kitchen-sink',
  theme: './site-dev/wap',
  themeConfig: {
    platform,
  },
  entryName: 'kitchen-sink',
  htmlTemplate: `./site-dev/wap/static/template-${process.env.NODE_ENV === 'development' ? 'dev' : 'build'}.html`,
  postcssConfig: {
    plugins: [
      rucksack(),
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
      pxtoremPlugin({
        rootValue: 100,
        propList: ['*'],
      }),
    ],
  },
});
