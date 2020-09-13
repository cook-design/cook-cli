const colors = require('colors');
const path = require('path');
const fs = require('fs');
const get = require('lodash/get');
const webpack = require('webpack');
const semver = require('semver');
const { execSync } = require('child_process');
const choiceUpload = require('choice-upload');

const {
  build
} = require('../webpack/bisheng/index');
const compile = require('../webpack/bisheng/config/compile');
const {
  pkgOption,
  useUmd,
} = require('../webpack/bisheng/config/getOption');
const compileWebpackConfig = require('../webpack/bisheng/config/compileWebpackConfig');
const { getNpmInfo } = require('./service');

const {
  getUmdConfig,
} = require('../webpack/bisheng/config/util');


process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

const buildUmd = () => new Promise((resolve, reject) => {
  const {
    filename,
    library
  } = getUmdConfig();
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
  const {
    filename,
    library
  } = getUmdConfig();
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

const installDependencies = (npmUser, npmPassword, npmEmail, npmRegistry) => {
  execSync(`npm-cli-login -u ${npmUser} -p ${npmPassword} -e ${npmEmail} -r ${npmRegistry}`);
  execSync(`npm install --registry ${npmRegistry}`);
}

const verifyVersion = (branchVersion) => {
  const { version } = pkgOption;
  console.log(`branchVersion: ${branchVersion}, version: ${version}`);
  if (branchVersion !== version) {
    throw '请修改package.json的版本号为迭代版本号！！！';
  }
}

const verifyNpmName = (appName) => {
  const { name } = pkgOption;
  console.log(`appName: ${appName}, name: ${name}`);
  if (`@choicefe/${appName}` !== name) {
    throw 'package.json中的name校验失败，请联系孤豹！';
  }
}

const verifyNpmVersion = async () => {
  const { name, version } = pkgOption;
  const npmRes = await getNpmInfo(name);
  const versionRes = get(npmRes, `versions['${version}']`, '');
  if (versionRes) {
    throw `${name}:${version} 已经发布过，请新建迭代！！！`;
  }
}

const generatorBetaVersion = async () => {
  try {
    const { name, version } = pkgOption;
    const npmRes = await getNpmInfo(name);
    if (npmRes.error === '[not_found] document not found') {
      return `${version}-beta.1`;
    } else {
      const versons = Object.keys(get(npmRes, 'versions', {}));
      const currentBetaVersions = versons.filter(item => item.includes(`${version}-beta`));
      if (!currentBetaVersions.length) {
        return `${version}-beta.1`;
      } else {
        const maxBetaVersion = currentBetaVersions.sort((a, b) => {
          const aIndex = a.replace(`${version}-beta.`, '');
          const bIndex = b.replace(`${version}-beta.`, '');
          return bIndex - aIndex;
        });
        return semver.inc(maxBetaVersion[0], 'prerelease');
      }
    }
  } catch (err) {
    throw err.message || err;
  }
}

const modifyBetaVersion = async () => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const betaVersion = await generatorBetaVersion();
  pkgOption.version = betaVersion;
  fs.writeFileSync(
    pkgPath,
    JSON.stringify(pkgOption, null, 2),
  );
}

const generatorNpmFolder = () => {
  execSync("if [ -d 'build' ]; then rm -rf build; fi");
  execSync("if [ ! -d 'build' ]; then mkdir build; fi");
  execSync("if [ -d 'es' ]; then cp -rf es build; fi");
  execSync("if [ -d 'lib' ]; then cp -rf lib build; fi");
  execSync("if [ -d 'library' ]; then cp -rf library build; fi");
  execSync("if [ -d 'dist' ]; then cp -rf dist build; fi");
  execSync("if [ -f 'package.json' ]; then cp -rf package.json build; fi");
}

const handleNpmPublish = () => {
  execSync("cd build && npm publish --registry http://npm.choicesaas.cn/");
}

const handleOssPublish = async (appName, ossToken) => {
  const { version } = pkgOption;
  await choiceUpload.umd(appName, version, 'build', ossToken);
}

console.log('开始执行build。。。');

/**
 * @param buildType 构建类型  local | cloud
 * @param buildEnv 构建环境  'project','daily','pre','prod'
 *  */
module.exports = async (options) => {
  try {
    console.log(JSON.stringify(options, null, 2));
    const {
      buildType,
      buildEnv,
      appName,
      npmName,
      branchVersion,
      ossToken,
      npmUser,
      npmPassword,
      npmEmail,
      npmRegistry,
    } = options;
    if (buildType === 'cloud') {
      // 安装依赖
      installDependencies(npmUser, npmPassword, npmEmail, npmRegistry);
      // 云构建时检测版本是否符合要求
      verifyVersion(branchVersion);
      // 云构建时检测npmName是否符合要求
      verifyNpmName(appName);
      // 检测当前版本的npm包是否已经存在
      await verifyNpmVersion();
      // 日常发布自动生成Beta版本
      if (buildEnv === 'daily') {
        await modifyBetaVersion();
      }
    }

    // 构建UMD
    if (useUmd) {
      await buildUmd();
      await buildUmdMin();
    }
    // 构建es、lib
    await compile();

    // 构建文档
    await build(async () => {
      // 构建完成的回调
      if (buildType === 'cloud') {
        // 拼接build目录（es、lib、library、dist）
        generatorNpmFolder();
  
        // npm 发布
        handleNpmPublish();

        // 文档 & umd发布CDN
        await handleOssPublish(appName, ossToken);

      }
    });
  } catch (err) {
    console.log(colors.red(err));
  }
};