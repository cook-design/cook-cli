const colors = require('colors');
const path = require('path');
const get = require('lodash/get');
const fetch = require('node-fetch');
const { exec, execSync } = require('child_process');
const spawn = require('cross-spawn');
const fs = require('fs');
const checkMentorCliVersion = require('../util/check-mentor-cli-version');
const { API_URL } = require('../config/dynamic-config.js');
const { upLoadImg, upLoadDemo } = require('./ftp.js');
const sudo = require('../util/sudo');
const writePkgToLocal = require('../util/write-pkg-to-local');
const rimraf = require('rimraf');
const { updateComponent, checkComponent, checkVersion, saveVersion, checkNpmVersion } = require('./service.js');

let solution = '';

async function upload() {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const { name, version } = pkg;
  const pkgName = name.replace(/@alipay/, '');
  try {
    const demoUrl = await upLoadDemo(pkgName, version);
    console.log(`Demo文档上传成功: ${demoUrl}`.yellow);
  } catch (e) {
    throw new Error("上传Demo失败-ftp配置错误");     
  }
}

async function clean() {
  exec(`cd ${path.join(__dirname, '../')} && rimraf site-dev.zip`);
}

async function watchUpdate() {
  return new Promise((resolve, reject) => {
    console.log('正在上传Demo文档文档, 请勿关闭控制台...');
    const shellType = /(h5|mobile)/i.test(solution) ? 'save-double' : 'save';
    const shell = `npm run ${shellType}`;
    console.log(`excute shell: ${shell}`)
    const ps = exec(shell, {
      cwd: path.join(__dirname, '../'),
    }, async (err) => {
      try {
        if (err) {
          reject(err);
        } else {
          await upload();
          await clean();
          resolve();
        }
      } catch(e) {
        reject(e);
      }
    });
    ps.stdout.on('data', (d) => {
      console.log(d);
    });
  });
}

function check() {
  let notice = '';
  const mentorPkg = require(path.join(process.cwd(), 'package.json'));
  const { name, version } = mentorPkg;
  const logo = fs.existsSync(path.join(process.cwd(), 'src/logo.png'));
  if (!name) {
    notice = 'package.json中组件名称(name)不能为空';
  } else if (!version) {
    notice = 'package.json的组件版本号(version)不能为空';
  } else if (!logo) {
    notice = '请在src文件夹中添加缩略图(logo.png)';
  }
  return notice;
}

async function uploadLogo() {
  const { name } = require(path.join(process.cwd(), 'package.json'));
  const logo = path.join(process.cwd(), 'src/logo.png');
  const pkgName = name.replace(/@alipay/, '');
  if (fs.existsSync(logo)) {
    try {
      const logoUrl = await upLoadImg(pkgName);
      console.log(`组件logo上传成功: ${logoUrl}`.yellow);
      return logoUrl;
    } catch (err) {
      throw new Error("ftp配置错误");       
    }
  } else {
    throw new Error("src目录下图片不能为空"); 
  }
}

async function checkNpmByName(name, version) {
  const npmRes = await checkNpmVersion(name);
  const versionRes = get(npmRes, `versions['${version}']`, '');
  if (!versionRes) {
    throw `${name}:${version} 未发布到tnpm, 请先执行 cook publish 进行发布`;
  }
}

/**
 * @desc 将component数据保存到DB
 * 
 * @return null
 */
async function save() {
  try {
    await checkMentorCliVersion();  
    const notice = check();
    if (notice) {
      console.log(colors.red(`Error:${notice}`));
      return;
    }
    const cookPkg = writePkgToLocal();
    solution = get(cookPkg, 'mentorConfig.solution', '') || cookPkg.platform || '';
    // 判断组件是否存在
    const mentorPkg = require(path.join(process.cwd(), 'package.json'));
    const { name, description, version, mentorConfig = {} } = mentorPkg;
    let { id } = mentorPkg;
    id = id || mentorConfig.id || '';
    // 判断该版本的TNPM包是否已发布
    await checkNpmByName(name, version);
    const { data } = await checkComponent({ id, name });
    if (data) {
      const { data: versionData } = await checkVersion({ cid: id, version });
      if (!versionData) {
        await watchUpdate();
        const logo = await uploadLogo();
        await updateComponent({ id, name, description, logo });
        await saveVersion({ id, name, version, pkg: JSON.stringify(mentorPkg) });
        console.log(colors.blue(`组件 ${name}: ${version} 成功发布到组件市场`));      
      } else {
        console.log(colors.red('该版本已存在，请在package.json修改版本号再提交'));
      }
    } else {
      console.log(colors.red('组件不存在!'));
    }
  } catch(err) {
    console.log(colors.red(err));
  }
}

module.exports = save;
