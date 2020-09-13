const path = require('path');
const fs = require('fs');
const get = require('lodash/get');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const WebpackBar = require('webpackbar');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const {
  getBabelLoaderOption,
  tsLoaderOption,
  indexPostcssOption,
  demoPostcssOption,
  themeOption,
  pkgOption,
} = require('./getOption');
const bishengLib = path.join(__dirname, '../');
const bishengLibLoaders = path.join(bishengLib, 'loaders');

const mPath = [
  'node_modules',
  path.join(process.cwd(), "node_modules"),
  path.join(__dirname, "../../../", "node_modules"),
];

const excludePath = [
  path.join(process.cwd(), "node_modules"),
  path.join(__dirname, "../../../", "node_modules"),
];

const getExcludePath = (file) => {
  if(!file.startsWith(excludePath[0]) && !file.startsWith(excludePath[1])) {
    return true;
  }
  return false;
};

const resolveAppConfig = (baseConfig) => {
  const { appConfig } = require('./getOption');
  const CB = get(appConfig, 'webpack.config', '');
  if (typeof CB === 'function') {
    return CB(baseConfig);
  } else {
    return baseConfig;
  }
}

module.exports = (appConfig) => {
  const jsFileName = '[name].js';
  const cssFileName = '[name].css';
  const mode = appConfig.type === 'dev' ? 'development' : 'production';

  const webpackConfig = (type) => {
    const cssOption = {
      index: indexPostcssOption,
      demo: demoPostcssOption,
    };
    const postcssOption = cssOption[type];

    let wConfig = {
      entry: {},

      mode,

      output: {
        filename: jsFileName,
        chunkFilename: jsFileName,
      },
  
      resolve: {
        modules: mPath,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.less'],
        alias: {
          'cook-bisheng': path.join(__dirname, '..'),
          '@alipay/kobe-fetch': '@alipay/kb-m-fetch',
          [pkgOption.name]: path.join(process.cwd(), 'src'),
        },
      },
  
      resolveLoader: {
        modules: mPath,
      },
  
      externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        history: 'History',
      },
  
      module: {
        rules: [{
            test(filename) {
              if (filename === path.join(bishengLib, 'utils', 'data.js')) {
                return true;
              } else {
                return false;
              }
            },
            loader: path.join(bishengLibLoaders, 'bisheng-data-loader'),
          },
          {
            test(file) {
              if(/\.js|jsx$/.test(file) && getExcludePath(file)) {
                return true;
              }
            },
            loader: require.resolve('babel-loader'),
            options: getBabelLoaderOption({
              importHelper: true,
            }),
          },
          {
            test(file) {
              if(/\.ts|tsx$/.test(file) && getExcludePath(file)) {
                return true;
              }
            },
            use: [{
              loader: require.resolve('babel-loader'),
              options: getBabelLoaderOption({
                importHelper: true,
              }),
            }, {
              loader: require.resolve('ts-loader'),
              options: {
                transpileOnly: true,
                compilerOptions: tsLoaderOption,
              },
            }],
          },
          {
            test: /\.less?$/,
            use: [{
              loader: require.resolve('style-loader'),
            }, {
              loader: require.resolve('css-loader'),
              options: {
                autoprefixer: false,
              },
            }, {
              loader: require.resolve('postcss-loader'),
              options: postcssOption,
            }, {
              loader: require.resolve('less-loader'),
              options: {
                sourceMap: true,
                modifyVars: themeOption,
              },
            }],
          },
          {
            test: /\.css?$/,
            use: [{
              loader: require.resolve('style-loader'),
            }, {
              loader: require.resolve('css-loader'),
            }, {
              loader: require.resolve('postcss-loader'),
              options: postcssOption,
            }]
          },
          {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&minetype=application/font-woff',
          },
          {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&minetype=application/font-woff',
          },
          {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&minetype=application/octet-stream',
          },
          {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&minetype=application/vnd.ms-fontobject',
          },
          {
            test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
            loader: 'url-loader?limit=10000',
          },
          {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&minetype=image/svg+xml',
          },
        ],
      },
  
      plugins: [
        new ExtractTextPlugin({
          filename: cssFileName,
          disable: false,
          allChunks: true,
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          },
        }),
        new SpriteLoaderPlugin(),
        // css压缩去重
        new OptimizeCssAssetsPlugin(),
        new WebpackBar(),
        new FriendlyErrorsWebpackPlugin(),
      ],
    };

    if (type === 'index') {
      const { appConfig } = require('./getOption');
      const analyze = get(appConfig, 'webpack.analyze', false);
      const antdCdn = get(appConfig, 'runtime.antd.cdn', false);
      // chunk分析
      if (analyze) {
        wConfig.plugins.push(new BundleAnalyzerPlugin())
      }
      // 使用外链antd
      if (antdCdn) {
        wConfig.externals['antd'] = 'antd';
      }
    }
    resolveAppConfig(wConfig);

    return wConfig
  }

  // 初始化index config
  const indexConfig = webpackConfig('index');
  indexConfig.entry = {
    index: path.join(process.cwd(), 'tmp', `entry.index.js`),
  };

  // 初始化demo config
  const demoConfig = webpackConfig('demo');
  demoConfig.entry = {
    demo: path.join(process.cwd(), 'tmp', `entry.demo.js`),    
  };

  return [
    indexConfig,
    demoConfig,
  ];
}
