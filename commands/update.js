const colors = require('colors');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const get = require('lodash/get');

const { API_URL } = require('../config/dynamic-config.js');
const { updateComponent, checkComponent } = require('./service.js');
const { upLoadImg } = require('./ftp.js');

function check() {
  let notice = '';
  const mentorPkg = require(path.join(process.cwd(), 'package.json'));
  const { name } = mentorPkg;
  const logo = fs.existsSync(path.join(process.cwd(), 'src/logo.png'));
  if (!name) {
    notice = 'package.json中组件名称(name)不能为空';
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

async function componentUpdate() {
  try {
    const mentorPkg = require(path.join(process.cwd(), 'package.json'));
    const appConfig = require(path.join(process.cwd(), 'app.config.ts'));
    const { name, description } = mentorPkg;
    const id = get(appConfig, 'componentId', '');
    const logo = await uploadLogo();
    await updateComponent({ id, name, description, logo });
    const { data } = await checkComponent({ id, name });
    console.log(JSON.stringify(data, null, 4));
    console.log('\n组件信息更新成功'.blue);
  } catch (err) {
    console.log(colors.red(err));
  }
}

async function update() {
  console.log('组件信息更新中...');
  const notice = check();
  if (notice) {
    console.log(colors.red(`Error:${notice}`));
    return;
  }

  // 判断组件是否已被保存
  const mentorPkg = require(path.join(process.cwd(), 'package.json'));
  const appConfig = require(path.join(process.cwd(), 'app.config.ts'));
  const { name } = mentorPkg;
  const id = get(appConfig, 'componentId', '');
  const checkRes = await checkComponent({ id, name });
  // 首次发布
  if (!checkRes.data) {
    console.log('该组件还未保存，请使用 mentor save 保存组件信息'.red);
  } else {
    await componentUpdate();
  }
}

module.exports = update;
