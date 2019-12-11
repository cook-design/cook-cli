const colors = require('colors');
const { prompt } = require('inquirer');
const { writeToFile } = require('./util.js');

const getQuestions = () => {
  return [{
    type: 'list',
    name: 'MODE',
    choices: ['tnpm', 'cnpm', 'npm'],
    message: '选择模块发布源:',
  }, {
    type: 'input',
    name: 'FTP_USERNAME',
    message: 'ftp 用户名:',
  }, {
    type: 'input',
    name: 'FTP_PASSWORD',
    message: 'ftp 密码:',
  }, {
    type: 'input',
    name: 'OSS_TOKEN',
    message: 'OSS_TOKEN:',
  }];
}

module.exports = async () => {
  prompt(getQuestions()).then(async (res) => {
    writeToFile('config.json', 'MODE', res['MODE']);    
    writeToFile('config.json', 'FTP.USERNAME', res['FTP_USERNAME']);
    writeToFile('config.json', 'FTP.PASSWORD', res['FTP_PASSWORD']);
    writeToFile('config.json', 'OSS_TOKEN', res['OSS_TOKEN']);    
    console.log(colors.green('配置成功'));
  });
};