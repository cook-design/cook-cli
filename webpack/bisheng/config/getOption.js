const { existsSync } = require('fs');
const path = require('path');
const get = require('lodash/get');
const autoprefixer = require('autoprefixer');
const pxtoremPlugin = require('postcss-pxtorem');

const getAppConfig = () => {
  const appConfigPath = path.join(process.cwd(), 'app.config.ts');
  let appConfig = {};
  if (existsSync(appConfigPath)) {
    appConfig = require(appConfigPath);
  }
  return appConfig;
};

const getBabelLoaderOption = (param = {}) => {
  // modules false 标识不对 module编译
  const modules = get(param, 'modules', 'auto');
  const appConfig = getAppConfig();
  // 是否对antd/cook/qingtai组件按需加载, 默认false
  const importHelper = param.importHelper === undefined ? get(appConfig, 'compile.importHelper', false) : param.importHelper;
  // 是否使用外链Antd
  const antdCdn = get(appConfig, 'runtime.antd.cdn', false);

  const config = {
    compact: false,
    presets: [
      require.resolve('@babel/preset-react'),
      [
        require.resolve('@babel/preset-env'),
        {
          modules: modules === false ? false : 'auto',
          targets: {
            browsers: [
              'last 2 versions',
              'Firefox ESR',
              '> 1%',
              'ie >= 8',
              'iOS >= 8',
              'Android >= 4',
            ],
          },
        },
      ],
    ],
    plugins: [
      // Stage 0
      require.resolve('@babel/plugin-proposal-function-bind'),
      // Stage 1
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-logical-assignment-operators'),
      [require.resolve('@babel/plugin-proposal-optional-chaining'), {
        loose: false
      }],
      [require.resolve('@babel/plugin-proposal-pipeline-operator'), {
        proposal: 'minimal'
      }],
      [require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), {
        loose: false
      }],
      require.resolve('@babel/plugin-proposal-do-expressions'),
      // Stage 2
      [require.resolve('@babel/plugin-proposal-decorators'), {
        legacy: true
      }],
      require.resolve('@babel/plugin-proposal-function-sent'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-numeric-separator'),
      require.resolve('@babel/plugin-proposal-throw-expressions'),
      // Stage 3
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-syntax-import-meta'),
      [require.resolve('@babel/plugin-proposal-class-properties'), {
        loose: false
      }],
      require.resolve('@babel/plugin-proposal-json-strings'),
    ]
  };

  if (importHelper) {
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: 'antd-mobile',
      style: true,
    }, 'antd-mobile']);
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: '@alipay/qingtai',
      style: true,
    }, '@alipay/qingtai']);
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: '@alipay/cook',
      style: true,
    }, '@alipay/cook']);
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: 'kb-cook',
      libraryDirectory: 'es',
      style: true,
    }, 'kb-cook']);

    !antdCdn && config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: 'antd',
      style: true,
    }, 'antd']);
  }

  return config;
}

const tsLoaderOption = {
  target: 'es6',
  jsx: 'preserve',
  moduleResolution: 'node',
  declaration: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  experimentalDecorators: true,
  skipLibCheck: true, //忽略所有库中的声明文件（ *.d.ts）的类型检查
};

const indexPostcssOption = {
  plugins: [
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    }),
  ],
};

const demoPostcssOption = {
  plugins: [
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    }),
    pxtoremPlugin({
      rootValue: 100,
      propList: ['*'],
    }),
  ],
};

const getThemeOption = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'webpack.themes', {});
}

const getPkgOption = () => {
  const pkgConfig = require(path.join(process.cwd(), 'package.json'));
  return pkgConfig;
}

const getReactVersion = () => {
  const pkgConfig = getPkgOption();
  let reactVersion = get(pkgConfig, 'devDependencies[react]', '16');
  return reactVersion.replace(/\^|~/g, '').startsWith('15') ? '15' : '16';
}

const getInjectheads = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'runtime.heads', []);
}

const getInjectBodies = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'runtime.bodies', []);
}

const options = {
  getBabelLoaderOption,
  tsLoaderOption,
  indexPostcssOption,
  demoPostcssOption,
  appConfig: getAppConfig(),
  themeOption: getThemeOption(),
  pkgOption: getPkgOption(),
  reactVersion: getReactVersion(),
  injectHeads: getInjectheads(),
  injectBodies: getInjectBodies(),
};

// console.log(options);

module.exports = options;
