const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * @desc 获取组件solution
 * 
 * @return null
 */
module.exports = () => {
  try {
    // 获取用户目录
    const userPath = os.homedir();
    const file = `${userPath}/.mentor/pkg.json`;
    const { mentorPkg = {} } = require(file);
    const { platform, mentorConfig = {} } = mentorPkg;
    return platform || mentorConfig.solution || '';
  } catch (e) {
  }
  return '';
};