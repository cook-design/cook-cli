const colors = require('colors');
const path = require('path');
var sftpUpload = require('sftp-upload');

const { FTP, ASSETS_URL } = require('../config/dynamic-config.js');

const getFtpConfig = () => ({
  host: FTP.HOST,
  port: FTP.PORT,
  username: FTP.USERNAME,
  password: FTP.PASSWORD,
});

exports.upLoadImg = (cName) => new Promise((resolve, reject) => {
  if (!cName) reject('组件名称不能为空');
  const config = getFtpConfig();
  config.path = path.join(process.cwd(), 'src/');
  config.remoteDir = `/opt/cook/cook-components-assets/${cName}/src`;
  // console.log(`ftp config: ${JSON.stringify(config, null, 2)}`);
  const sftp = new sftpUpload(config);
  sftp.on('error', (err) => {
    reject(err);
  })
  .on('uploading', function(progress) {
    // console.log('Uploading', progress.file);
    console.log(progress.percent+'% completed');
  })
  .on('completed', () => {
    resolve(`${ASSETS_URL}/${cName}/src/logo.png`);
  })
  .upload();
});

exports.upLoadDemo = (cName, version) => new Promise((resolve, reject) => {
  if (!cName || !version) reject('组件名称或版本不能为空');
  const config = getFtpConfig();
  config.path = path.join(process.cwd(), 'dist/');
  config.remoteDir = `/opt/cook/cook-components-assets/${cName}/${version}/`;
  // console.log(`sftp config: ${JSON.stringify(config, null, 2)}`);
  const sftp = new sftpUpload(config);
  sftp.on('error', (err) => {
    reject(err);
  })
  .on('uploading', function(progress) {
    console.log('Uploading', progress.file);
    console.log(progress.percent+'% completed');
  })
  .on('completed', () => {
    resolve(`${ASSETS_URL}/${cName}/${version}`);
    console.log(`文档上传成功`);
  })
  .upload();
});
