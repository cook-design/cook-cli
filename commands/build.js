const colors = require('colors');
const path = require('path');
const get = require('lodash/get');
const { execSync } = require('child_process');
const spawn = require('cross-spawn');
const opn = require('opn');
const checkMentorCliVersion = require('../util/check-mentor-cli-version');
const writePkgToLocal = require('../util/write-pkg-to-local');
const sudo = require('../util/sudo');

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

const build = async () => {
  try {
    const cookPkg = writePkgToLocal();
    const solution = get(cookPkg, 'mentorConfig.solution', '') || cookPkg.platform || '';
    const shell = /(h5|mobile)/i.test(solution) ? ['run', 'save-double'] : ['run', 'save'];
    console.log(`excute shell: ${shell.join(' ')}`)
    const child = spawn('npm', shell, {
      cwd: path.join(__dirname, '../'),
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  } catch(err) {
    console.log(colors.red(err));
  }
};

module.exports = build;
