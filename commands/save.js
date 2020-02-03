const colors = require('colors');
const path = require('path');
const get = require('lodash/get');
const { exec } = require('child_process');
const fs = require('fs');
const checkMentorCliVersion = require('../util/check-mentor-cli-version');
const { upLoadImg, upLoadDemo } = require('./ftp.js');
const writePkgToLocal = require('../util/write-pkg-to-local');
const { updateComponent, checkComponent, checkVersion, saveVersion, checkNpmVersion } = require('./service.js');
const { build } = require('../webpack/bisheng/index');

async function uploadDocument() {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const { name, version } = pkg;
  try {
    const demoUrl = await upLoadDemo(name, version);
    console.log(`文档上传成功: ${demoUrl}`.yellow);
  } catch (e) {
    throw new Error("文档上传失败-ftp配置错误");     
  }
}

async function clean() {
  exec(`cd ${path.join(__dirname, '../')} && rimraf site-dev.zip`);
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
  if (fs.existsSync(logo)) {
    try {
      const logoUrl = await upLoadImg(name);
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
    // 判断组件是否存在
    const mentorPkg = require(path.join(process.cwd(), 'package.json'));
    const appConfig = require(path.join(process.cwd(), 'app.config.ts'));
    const { name, description, version } = mentorPkg;
    const id = get(appConfig, 'componentId', '');
    if (!id) throw '组件Id获取异常';
    // 判断该版本的TNPM包是否已发布
    // await checkNpmByName(name, version);
    const { data } = await checkComponent({ id, name });
    if (data) {
      const { data: versionData } = await checkVersion({ cid: id, version });
      if (!versionData) {
        await build({
          bishengConfigPath: path.join(__dirname, '../webpack/bishengconfig/index.js'),
          callback: async () => {
            await uploadDocument();
            const logo = await uploadLogo();
            await updateComponent({ id, name, description, logo });
            await saveVersion({ id, name, version, pkg: JSON.stringify(mentorPkg) });
            console.log(colors.blue(`组件 ${name}: ${version} 成功发布到组件市场`));
          }
        });
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
