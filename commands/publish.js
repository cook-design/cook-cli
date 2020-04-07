const colors = require('colors');
const webpack = require('webpack');
const { exec } = require('child_process');
const path = require('path');
const get = require('lodash/get');
const rimraf = require('rimraf');
const choiceUpload = require('choice-upload');
const { OSS_TOKEN } = require('../config/dynamic-config.js');
const { appConfig, pkgOption } = require('../webpack/bisheng/config/getOption');
const compileWebpackConfig = require('../webpack/bisheng/config/compileWebpackConfig');
const compile = require('../webpack/bisheng/config/compile');

const useCdn = get(appConfig, 'compile.cdn', false);
const filename = get(appConfig, 'compile.filename', '');
const library = get(appConfig, 'compile.library', '');

const check = () => new Promise((resolve, reject) => {
  if (!filename) {
    reject('app.config.ts中的filename不能为空！');
  }
  if (!library) {
    reject('app.config.ts中的library不能为空！');
  }
  resolve();
});

const buildUmd = () => new Promise((resolve, reject) => {
  compileWebpackConfig.mode = 'development';
  compileWebpackConfig.output = {
    path: path.join(process.cwd(), 'library', 'umd'),
    libraryExport: 'default',
    filename: `${filename}.js`,
    library,
    libraryTarget: 'umd',
  },

  webpack(compileWebpackConfig, (err, stats) => {
    if (err !== null) {
      reject(err);
    }
    if (stats.hasErrors()) {
      reject(stats.toString('errors-only'));
    }
    console.log(colors.blue('umd包构建完成'));
    resolve();
  });
});

const buildUmdMin = () => new Promise((resolve, reject) => {
  compileWebpackConfig.mode = 'production';
  compileWebpackConfig.output = {
    path: path.join(process.cwd(), 'library', 'umd'),
    libraryExport: 'default',
    filename: `${filename}-min.js`,
    library,
    libraryTarget: 'umd',
  },

  webpack(compileWebpackConfig, (err, stats) => {
    if (err !== null) {
      reject(err);
    }
    if (stats.hasErrors()) {
      reject(stats.toString('errors-only'));
    }
    console.log(colors.blue('umd min包构建完成'));
    resolve();
  });
});

const buildSystem = () => new Promise((resolve, reject) => {
  compileWebpackConfig.mode = 'development';
  compileWebpackConfig.output = {
    path: path.join(process.cwd(), 'library', 'system'),
    libraryExport: 'default',
    filename: `${filename}.js`,
    libraryTarget: 'system',
  },

  webpack(compileWebpackConfig, (err, stats) => {
    if (err !== null) {
      reject(err);
    }
    if (stats.hasErrors()) {
      reject(stats.toString('errors-only'));
    }
    console.log(colors.blue('system包构建完成'));
    resolve();
  });
});

const buildSystemMin = () => new Promise((resolve, reject) => {
  compileWebpackConfig.mode = 'production';
  compileWebpackConfig.output = {
    path: path.join(process.cwd(), 'library', 'system'),
    libraryExport: 'default',
    filename: `${filename}-min.js`,
    libraryTarget: 'system',
  },

  webpack(compileWebpackConfig, (err, stats) => {
    if (err !== null) {
      reject(err);
    }
    if (stats.hasErrors()) {
      reject(stats.toString('errors-only'));
    }
    console.log(colors.blue('system min包构建完成'));
    resolve();
  });
});

const upload = async () => {
  console.log('开始发布CDN');
  const { name, version } = pkgOption;
  const appName = name.indexOf('/') > -1 ? name.split('/')[1] : name; // 对name处理，去掉私域标识
  if (!OSS_TOKEN) {
    throw 'OSS_TOKEN错误，请执行 cook config进行配置';
  }
  const umdFolderPath = path.join(process.cwd(), 'library');
  const result = await choiceUpload.umd(appName, version, umdFolderPath, OSS_TOKEN);
  console.log(result);
  return result;
}

const tnpmPub = () => new Promise((resolve, reject) => {
  const shell = `cd ${process.cwd()} && npm run lint && npm publish`;
  console.log(`excute shell: ${shell}`)
  const ps = exec(shell, {
    maxBuffer: 1024 * 1024 * 1000
  }, async (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
  ps.stdout.on('data', (d) => {
    console.log(d);
  });
})

const rimrafLibrary = () => {
  rimraf.sync(path.join(process.cwd(), 'library'), {}, (err) => {
    throw err;
  });
}

console.log('开始执行生产发布。。。');

module.exports = async() => {
  try {
    if (useCdn) {
      await check();
      await rimrafLibrary();
      await buildUmd();
      await buildUmdMin();
      await buildSystem();
      await buildSystemMin();
      await compile();
      await tnpmPub();
      const uploadRes = await upload();
      console.log('CDN发布产物：');
      console.log(uploadRes);
    } else {
      await compile();
      await tnpmPub();
    }
    console.log(colors.blue('发布成功'));
  } catch (err) {
    console.log(colors.red('err:'));
    console.log(colors.red(err));
  }
}

