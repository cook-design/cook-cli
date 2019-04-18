const os = require('os');
const commonConfig = require('./bisheng.common.config');

const { document, mentorPkg } = require(`${os.homedir()}/.mentor/pkg.json`);
const { mentorConfig } = mentorPkg;
let { platform } = mentorPkg;
platform = platform || mentorConfig.platform || '';

process.env.bishengType = 'pc';

module.exports = Object.assign({}, commonConfig, {
  port: 9001,
  source: {
    document,
  },
  output: './_site-dev',
  theme: './site-dev/pc',
  themeConfig: {
    platform,
  },
  htmlTemplate: `./site-dev/pc/static/template-${process.env.NODE_ENV === 'development' ? 'dev' : 'build'}.html`,
});
