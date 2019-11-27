const colors = require('colors');
const webpack = require('webpack');
const { exec } = require('child_process');
const path = require('path');
const get = require('lodash/get');
const glob = require('glob');
const { FileClient, fileZipClientConfig } = require('./config.js');
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
  const pkgName = name.replace(/(@alipay)|(@alife)|(@ali)/g, '');
  const libraryFolder = path.join(path.join(process.cwd(), 'library'));
  const files = glob.sync(`${libraryFolder}/**/*.*`);
  const result = [];
  for(let i = 0; i < files.length; i++) {
    const regPath = files[i].match(/library\/(.+)$/);
    const res = await FileClient.upload(`${pkgName}/${version}/${regPath[1]}`, files[i], fileZipClientConfig);
    result.push(res);
  }
  return result;
}

const tnpmPub = () => new Promise((resolve, reject) => {
  const shell = `cd ${process.cwd()} && npm run lint && npm publish`;
  console.log(`excute shell: ${shell}`)
  const ps = exec(shell, async (err) => {
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

console.log('开始执行生产发布。。。');

module.exports = async() => {
  try {
    if (useCdn) {
      await check();
      await buildUmd();
      await buildUmdMin();
      await buildSystem();
      await buildSystemMin();
      await compile();
      await tnpmPub();
      // const uploadRes = await upload();
      // console.log('CDN发布产物：');
      // console.log(uploadRes);
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

