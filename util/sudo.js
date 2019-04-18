const { execSync } = require('child_process');

module.exports = async () => {
  console.log('获取sudo权限：');
  execSync('sudo ls');
};
