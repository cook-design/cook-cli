const fs = require('fs');
const os = require('os');
const set = require('lodash/set');

const getDefaultConfig = () => {
  // 获取用户目录
  const userPath = os.homedir();
  if (!fs.existsSync(`${userPath}/.mentor`)) {
    fs.mkdirSync(`${userPath}/.mentor`);
  }
  const file = `${userPath}/.mentor/config.json`;
  let config = {};
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2), {
      encoding: 'utf8',
    });
  } else {
    config = require(file);
  }
  return config;
}

const sleep = (time) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(true), time);
});

const writeToFile = (file, key, value) => {
  try {
    // 获取用户目录
    const userPath = os.homedir();
    if (!fs.existsSync(`${userPath}/.mentor`)) {
      fs.mkdirSync(`${userPath}/.mentor`);
    }
    const filePath = `${userPath}/.mentor/${file}`;
    let data = {};
    if (fs.existsSync(filePath)) {
      data = require(filePath);
    }
    set(data, key, value);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
      encoding: 'utf8',
    });
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getDefaultConfig,
  sleep,
  writeToFile,
}