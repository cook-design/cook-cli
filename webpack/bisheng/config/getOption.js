const {
  existsSync
} = require('fs');
const path = require('path');
const fs = require('fs');
const get = require('lodash/get');
const autoprefixer = require('autoprefixer');
const pxtoremPlugin = require('postcss-pxtorem');
const os = require('os');

const useTransformRuntime = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'webpack.babel.plugins["@babel/plugin-transform-runtime"]', false);
}

const getAppConfig = () => {
  const appConfigPath = path.join(process.cwd(), 'app.config.ts');
  let appConfig = {};
  if (existsSync(appConfigPath)) {
    appConfig = require(appConfigPath);
  }
  return appConfig;
};

/**
 * @desc 获取babel配置
 * @param param.mergeBabelRuntime 是否需要配置babelruntime。目前只是在构建es/lib 时开启。 文档构建已经全局引入了babel-polyfill，不需要进行配置
 *  */
const getBabelLoaderOption = (param = {}) => {
  // modules false 标识不对 module编译
  const modules = get(param, 'modules', 'auto');
  const appConfig = getAppConfig();
  // 是否对antd/cook/qingtai组件按需加载, 默认false
  const importHelper = param.importHelper === undefined ? (get(appConfig, 'compile.importHelper', false) || get(appConfig, 'webpack.babel.importHelper', false)) : param.importHelper;
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
      path.resolve(__dirname, '../plugin/babal-plugin-cook'),
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

  const runtimeConfig = useTransformRuntime();
  if (runtimeConfig && param.mergeBabelRuntime) {
    const defaultRuntimeConfig = {
      "corejs": false,
      "helpers": true,
      "regenerator": true,
      "useESModules": false
    };
    const finalConfig = {
      ...defaultRuntimeConfig, ...runtimeConfig
    };
    console.log(`use babel runtime: ${JSON.stringify(finalConfig, null, 2)}`);
    config.plugins.push([
      require.resolve('@babel/plugin-transform-runtime'), finalConfig
    ]);
  }

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
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: '@alife/cook-pc',
      libraryDirectory: '',
      style: true,
    }, '@alife/cook-pc']);
    config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: '@alife/cook-h5',
      libraryDirectory: '',
      style: true,
    }, '@alife/cook-h5']);
    !antdCdn && config.plugins.push([require.resolve('babel-plugin-import'), {
      libraryName: 'antd',
      style: true,
    }, 'antd']);
  }

  return config;
}

const tsLoaderOption = () => {
  const defaultOptions = {
    target: 'es6',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: true,
    allowSyntheticDefaultImports: true,
    allowJs: true,
    lib: ['dom', 'es2015', 'es2016', 'es2017'],
    experimentalDecorators: true,
    skipLibCheck: true,
  };
  try {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const useOptions = get(require(tsConfigPath), 'compilerOptions', {});
      const finalOptions = { ...defaultOptions, ...useOptions };
      // console.log('ts options:');
      // console.log(JSON.stringify(finalOptions, null, 2));
      return finalOptions;
    }
    return defaultOptions;
  } catch (err) {
    console.log('请检查tsconfig.json, 需要符合json格式！！！');
    return defaultOptions;
  }
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
  const themes = get(appConfig, 'webpack.themes', '') || get(appConfig, 'webpack.postcss.less.themes', {});
  console.log(`themes: ${JSON.stringify(themes, null, 2)}`);
  return themes;
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

const resolvePlugins = () => {
  const appConfig = getAppConfig();
  const globalHeads = get(appConfig, 'runtime.heads', []);
  const globalBodies = get(appConfig, 'runtime.bodies', []);
  const plugins = get(appConfig, 'runtime.plugins', []);

  let resolveHeads = [];
  let resolveBodies = [];
  let resolveEntry = [];
  plugins.map(plugin => {
    const { name = '', status = false } = plugin;
    const pluginPkg = require(path.resolve(process.cwd(), 'node_modules', name, 'lib/index.js'));
    const { heads = [], bodies = [], entry = '' } = pluginPkg;
    if (status) {
      resolveHeads = resolveHeads.concat(heads);
      resolveBodies = resolveBodies.concat(bodies);
      entry && resolveEntry.push(entry);
    }
  });

  const resolveData = {
    resolveHeads: globalHeads.concat(resolveHeads),
    resolveBodies: globalBodies.concat(resolveBodies),
    resolveEntry,
  };

  return resolveData;
}

const getTmpDir = () => {
  const userPath = os.homedir();
  return `${userPath}/.mentor/tmp`;
}

const useDemo = () => {
  const appConfig = getAppConfig();
  const viewType = get(appConfig, 'viewType', '');
  if (viewType === 'h5' || viewType === 'h5-fix') {
    return true;
  }
  return false;
}

const useDebug = () => {
  const debug = process.env.cookDebug === 'true' ? true : false;
  console.log(`component debug: ${debug}`);
  return debug;
}

const useUmd = () => {
  const appConfig = getAppConfig();
  const umdStatus = get(appConfig, 'compile.cdn', false) || get(appConfig, 'webpack.output.umd', false);
  console.log(`useUmd: ${umdStatus}`);
  return umdStatus;
}

const getComponentName = (callback) => {
  //小程序聚合包组件
  try{
    const basePath = path.join(process.cwd(), 'src');
  fs.readdir(basePath, function(err, files) {
    if (err) {
      console.error(err)
      return
    }
    files.forEach((filename, index) => {
      let pathname = path.join(basePath, filename);
      fs.stat(pathname, (err, stats) => { // 读取文件信息
        if (err) {
          console.log('获取文件stats失败')
          return
        }
        if (stats.isDirectory()) {
          console.log(filename,'filename')
          callback && callback(filename);
        }
      })
    })
  }) 
  } catch(err) {
    throw err;
  }
};
const componentType = () => {
  const appConfig = getAppConfig();
  const viewType = get(appConfig, 'viewType', '');
  const types = {
    'util': 'util',
    'alipay': 'alipay',
    'miniapp': 'miniapp',
    'alipay-fix': 'alipayFix',
  };
  return types[viewType] || 'react';
}

const generatorCss = () => {
  const appConfig = getAppConfig();
  const generatorCss = get(appConfig, 'webpack.postcss.less.generatorCss', false);
  console.log(`generatorCss: ${generatorCss}`);
  return generatorCss;
}

const useHerbox = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'herbox.status', false);
}

const getBetaMaterials = () => {
  const appConfig = getAppConfig();
  return get(appConfig, 'webpack.betaMaterials', {});
}

const options = {
  getBabelLoaderOption,
  tsLoaderOption: tsLoaderOption(),
  indexPostcssOption,
  demoPostcssOption,
  getComponentName,
  appConfig: getAppConfig(),
  themeOption: getThemeOption(),
  pkgOption: getPkgOption(),
  reactVersion: getReactVersion(),
  injectHeads: getInjectheads(),
  injectBodies: getInjectBodies(),
  tmpDir: getTmpDir(),
  useDemo: useDemo(),
  useDebug: useDebug(),
  useUmd: useUmd(),
  componentType: componentType(),
  generatorCss: generatorCss(),
  useHerbox: useHerbox(),
  resolvePlugins: resolvePlugins(),
  betaMaterials: getBetaMaterials(),
};

module.exports = options;