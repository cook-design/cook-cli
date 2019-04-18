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

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

const dev = async () => {
  try {
    await checkMentorCliVersion();
    const cookPkg = writePkgToLocal();
    const solution = get(cookPkg, 'mentorConfig.solution', '') || cookPkg.platform || '';
    const shell = /(h5|mobile)/i.test(solution) ? ['run', 'dev-double'] : ['run', 'dev'];
    console.log(`excute shell: ${shell.join(' ')}`)
    const child = spawn('npm', shell, {
      cwd: path.join(__dirname, '../'),
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  } catch (err) {
    console.log(colors.red(err));
  }
};

module.exports = dev;
