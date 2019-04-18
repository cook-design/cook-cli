const os = require('os');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;

const { src, mentorPkg, cwd } = require(`${os.homedir()}/.mentor/pkg.json`);
const { name } = mentorPkg;
const webpackConfigFile = path.join(cwd, 'webpack.config.js');

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`); // eslint-disable-line

module.exports = {
  webpackConfig(config) {
    // 定义热更新文件目录
    // if (process.env.bishengType === 'pc') {
    //   config.output.hotUpdateChunkFilename = '../hot/hot-pc-update.js';
    //   config.output.hotUpdateMainFilename = '../hot/hot-pc-update.json';
    // } else {
    //   config.output.hotUpdateChunkFilename = '../../hot/hot-mobile-update.js';
    //   config.output.hotUpdateMainFilename = '../../hot/hot-mobile-update.json';
    // }

    // set alias
    config.resolve.alias = {};
    config.resolve.alias[name] = src;
    config.resolve.alias['@alipay/kobe-fetch'] = '@alipay/kb-m-fetch';
    // react、react-dom执行工程依赖 避免重复打包
    // config.resolve.alias.react = path.join(__dirname, '../node_modules/react');
    // config.resolve.alias['react-dom'] = path.join(__dirname, '../node_modules/react-dom');
    config.resolve.alias['cook-bisheng'] = 'cook-bisheng';

    // set externals
    config.externals = {
      react: 'React',
      'react-dom': 'ReactDOM',
      history: 'History',
    };

    // set devtool
    // config.devtool = 'source-map';

    // set plugins
    // config.plugins.push(new CSSSplitWebpackPlugin({
    //   size: 4000,
    // }));

    config.plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }));

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            comparisons: false,
          },
          output: {
            comments: false,
            ascii_only: true,
          },
        },
      }));
    }

    // config.plugins.push(new BundleAnalyzerPlugin());

    // 添加svg loader
    config.module.rules.forEach((loader) => {
      if (loader.test && loader.test.toString().indexOf('.svg') > -1) {
        loader.exclude = /cook-/;
      }
    });

    config.module.rules.unshift({
      test: /\.svg$/,
      include: /cook-/,
      use: [{
        loader: require.resolve('svg-sprite-loader'),
        options: {
          extract: true,
          publicPath: './assets/',
        },
      }],
    });
    config.plugins.push(new SpriteLoaderPlugin());

    // 添加模板webpack配置
    if (fs.existsSync(webpackConfigFile)) {
      config = require(webpackConfigFile)(config);
    }

    // console.log(JSON.stringify(config.module.rules, null, 2));

    return config;
  },
  devServerConfig: {
    hot: true,
    quiet: true,
    disableHostCheck: true,
  },
};
