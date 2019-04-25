const { exec } = require('child_process');
const path = require('path');
const { version } = require(path.join(process.cwd(), 'package.json'));


function publish() {
  const cwdPath = path.join(process.cwd());
  const shell = `cd ${cwdPath} && npm run lint && npm run compile && npm run copyds && git tag ${version} && git push origin ${version} && npm publish`;
  const ps = exec(shell, (err) => {
    if (err) {
      console.log(`Error: ${err}`) // eslint-disable-line
    }
  });
  ps.stdout.on('data', (d) => {
    console.log(d); // eslint-disable-line
  });
}

module.exports = publish;

