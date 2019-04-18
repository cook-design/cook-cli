const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * @desc 将pkg写入local. 便于不同进程共享数据
 * 
 * @return null
 */
module.exports = () => {
  try {
    // 获取用户目录
    const userPath = os.homedir();
    const file = `${userPath}/.mentor/pkg.json`;
    const mentorPkg = require(path.join(process.cwd(), 'package.json'))
    const info = {
      cwd: process.cwd(),
      document: path.join(process.cwd(), 'document'),
      src: path.join(process.cwd(), 'src'),
      mentorPkg,
    };
    fs.writeFileSync(file, JSON.stringify(info, null, 2), {
      encoding: 'utf8',
    });
    return mentorPkg;
  } catch (e) {
    console.log(e);
  }
  return '';
};