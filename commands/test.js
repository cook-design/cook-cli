const colors = require('colors');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const writePkgToLocal = require('../util/write-pkg-to-local');

const checkTestFolder = () => {
  const { cwd } = require(`${os.homedir()}/.mentor/pkg.json`);
  if (!fs.existsSync(`${cwd}/__test__`)) {
    fs.mkdirSync(`${cwd}/__test__`);
    const demoTemplatePath = path.join(__dirname, '../jest/template/demo.test.js');
    const demoTemplate = fs.readFileSync(demoTemplatePath, 'utf-8').toString();
    fs.writeFileSync(`${cwd}/__test__/demo.test.js`, demoTemplate, {
      encoding: 'utf8',
    });

    const indexTemplatePath = path.join(__dirname, '../jest/template/index.test.js');
    const indexTemplate = fs.readFileSync(indexTemplatePath, 'utf-8').toString();
    fs.writeFileSync(`${cwd}/__test__/index.test.js`, indexTemplate, {
      encoding: 'utf8',
    });
  }
};

async function test() {
  try {
    writePkgToLocal();
    checkTestFolder();

    const shell = `cd ${process.cwd()} && npm run compile`;
    const ps = exec(shell, (err) => {
      if (err) {
        throw err;
      }
      spawn('npm', ['run', 'test'], {
        cwd: path.join(__dirname, '../'),
        stdio: [process.stdin, process.stdout, process.stderr],
      });
    });
    ps.stdout.on('data', (d) => {
      console.log(d);
    });
  } catch(err) {
    console.log(colors.red(err));
  }
}

module.exports = test;

