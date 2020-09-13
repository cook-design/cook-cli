const get = require('lodash/get');
const path = require('path');
const LessAutoprefix = require("less-plugin-autoprefix");
const {
  appConfig,
} = require('./getOption');

const checkViewType = () => {
  const viewType = get(appConfig, 'viewType', '');
  if (!viewType) {
    throw 'viewType 不能为空！';
  }
}

const checkUmd = () => new Promise((resolve, reject) => {
  const filename = get(appConfig, 'compile.filename', '');
  const library = get(appConfig, 'compile.library', '');
  if (!filename) {
    reject('app.config.ts中的filename不能为空！');
  }
  if (!library) {
    reject('app.config.ts中的library不能为空！');
  }
  resolve();
});

const getUmdConfig = () => {
  const filename = get(appConfig, 'compile.filename', '') || get(appConfig, 'webpack.output.filename', 'index');
  const library = get(appConfig, 'compile.library', '') || get(appConfig, 'webpack.output.library', 'Index');
  return {
    filename,
    library,
  };
}

const checkBeatVersion = () => new Promise((resolve, reject) => {
  const {
    version
  } = require(path.join(process.cwd(), 'package.json'));
  if (!/beta/.test(version)) {
    reject('版本不符合规范！Beta发布，版本格式参照示例：1.0.0-beta.01');
  }
  resolve();
});

const checkCloudVersion = () => new Promise((resolve, reject) => {
  const {
    version
  } = require(path.join(process.cwd(), 'package.json'));
  if (!/^\d{1,2}.\d{1,2}.\d{1,2}$/.test(version)) {
    reject('版本不符合规范！版本格式参照示例：1.0.0');
  }
  resolve();
});

const gulpLessConfig = () =>{
  return new LessAutoprefix({
    browsers: [
      "last 2 versions",
      "Firefox ESR",
      "> 1%",
      "ie >= 9",
      "iOS >= 8",
      "Android >= 4",
    ],
  })
}
module.exports = {
  checkViewType,
  checkUmd,
  getUmdConfig,
  checkBeatVersion,
  checkCloudVersion,
  lessAutoprefix: gulpLessConfig()
};