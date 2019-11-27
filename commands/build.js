const colors = require('colors');
const path = require('path');
const get = require('lodash/get');
const { execSync } = require('child_process');
const spawn = require('cross-spawn');
const opn = require('opn');
const { build } = require('../webpack/bisheng/index');

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

module.exports = async () => {
  try {
    await build({
      bishengConfigPath: path.join(__dirname, '../webpack/bishengconfig/index.js'),
    });
  } catch(err) {
    console.log(colors.red(err));
  }
};
