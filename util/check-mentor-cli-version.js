const { version } = require('../package.json');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const colors = require('colors');
const { API_URL } = require('../config/dynamic-config.js');

module.exports = async () => {
  return new Promise(async (resolve, reject) =>{
    const currentVersion = version;
    const url = `${API_URL}/mentor/select`;
    try {
      const response = await fetch(url);
      const body = await response.json();
      let msg = '';
      if (body.success) {
        const forceUpdate = body.data[0] ? body.data[0].force_update : false; 
        const versionn = body.data[0] ? body.data[0].version : '1.0.0';
        if (version !== versionn) {
          msg = `当前版本${version}, 最新版本为${versionn}`;
          if(forceUpdate === 'true') {
            msg = `当前版本${version}, 最新版本为${versionn}。请执行 npm i cook-cli -g 更新至最新版本使用!`;            
            reject(false);
          }
          console.log(colors.yellow(msg));
        }
        resolve(body);
      } else {
        reject(body);
      }
    } catch (err) {
      reject(err);
    }
  });
};
