const get = require('lodash/get');
const { getDefaultConfig } = require('../commands/util.js');

const defaultConfig = getDefaultConfig();

const getConfig = (key, defaultValue) => {
  return get(defaultConfig, key, '') || defaultValue;
}

const config = {
  // cook server url
  API_URL: getConfig('API_URL', 'http://api.cook.choicesaas.cn'),
  // API_URL: 'http://127.0.0.1:7001',
  ASSETS_URL: getConfig('ASSETS_URL', 'http://assets.cook.choicesaas.cn'),
  // gitlab api url
  GITLAB_API_URL: getConfig('GITLAB_API_URL', 'http://gitlab.choicesoft.com.cn/api/v3'),
  // gitlab Private token url
  GITLAB_KEY_URL: getConfig('GITLAB_KEY_URL', 'http://gitlab.choicesoft.com.cn/profile/account'),
  NPM_URL: getConfig('NPM_URL', 'https://registry.npmjs.org'),
  // set component group for gitlab
  GITLAB_GROUP: {
    // 业务组件
    BIZ: {
      NAME: getConfig('GITLAB_GROUP.BIZ.NAME', 'cook-biz-component'),
      ID: getConfig('GITLAB_GROUP.BIZ.ID', 319),
    },
    // 基础组件
    BASE: {
      NAME: getConfig('GITLAB_GROUP.BASE.NAME', 'cook-base-component'),
      ID: getConfig('GITLAB_GROUP.BASE.ID', 320),
    }
  },
  // 设置发布源
  MODE: getConfig('MODE', 'npm'), // tnpm、cnpm、npm
  // ftp配置
  FTP: {
    HOST: getConfig('FTP.HOST', '47.98.58.111'),
    PORT: getConfig('FTP.PORT', 10241),
    USERNAME: getConfig('FTP.USERNAME', ''),
    PASSWORD: getConfig('FTP.PASSWORD', ''),
  },
};

module.exports = config;