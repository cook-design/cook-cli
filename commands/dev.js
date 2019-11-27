const colors = require('colors');
const path = require('path');
const get = require('lodash/get');
const { execSync } = require('child_process');
const opn = require('opn');
const spawn = require('cross-spawn');
const checkMentorCliVersion = require('../util/check-mentor-cli-version');
const writePkgToLocal = require('../util/write-pkg-to-local');
const killPort = require('../util/kill-port');
const sudo = require('../util/sudo');

const { start } = require('../webpack/bisheng/index');

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

const dev = async () => {
  try {
    await checkMentorCliVersion();
    await start({
      bishengConfigPath: path.join(__dirname, '../webpack/bishengconfig/index.js'),
    });
  } catch (err) {
    console.log(colors.red(err));
  }
};

module.exports = dev;
