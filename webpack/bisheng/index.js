const open = require('open');
const fs = require('fs');
const path = require('path');
const get = require('lodash/get');
const mkdirp = require('mkdirp');
const portfinder = require('portfinder');
const nunjucks = require('nunjucks');
const webpack = require('webpack');
const chokidar = require('chokidar');
const querystring = require('querystring');
const WebpackDevServer = require('webpack-dev-server');
const getWebpackCommonConfig = require('./config/getWebpackCommonConfig');
const getBishengConfig = require('./utils/get-bisheng-config');
const context = require('./context');

const {
  reactVersion,
  appConfig,
  injectHeads,
  injectBodies,
} = require('./config/getOption');

const { viewType } = appConfig;

nunjucks.configure('*', {
  autoescape: false,
});

const entryTemplate = fs.readFileSync(path.join(__dirname, 'entry.nunjucks')).toString();
const tmpDirPath = path.join(process.cwd(), 'tmp');
mkdirp.sync(tmpDirPath);

function generateEntryFile(componentPath, entryName) {
  const entryPath = path.join(tmpDirPath, `entry.${entryName}.js`);
  const mdPath = path.join(__dirname, 'utils/data.js').replace(/\\/g, '\\\\');
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      mdPath,
      componentPath,
      appConfig: JSON.stringify({ viewType }),
    }),
  );
}

const getStartParam = async () => {
  try {
    const devServer = get(appConfig, 'webpack.devServer', {});
    devServer.port = devServer.port || await portfinder.getPortPromise();
    devServer.host = devServer.host || 'local.koubei.test';
    let url = `http://${devServer.host}:${devServer.port}/index.html`;
    if (devServer.path) {
      url += `#/${devServer.path}`
    }

    const query = querystring.stringify(devServer.query);
    if (query) {
      url += `?${query}`;
    }

    return {
      url,
      ...devServer,
    };
  } catch (err) {
    throw err;
  }
};

const generatorHtml = (bishengConfig) => {
  mkdirp.sync(bishengConfig.output);

  var entryName = 'index';
  const pcTemplate = fs.readFileSync(bishengConfig.pcHtmlTemplate).toString();
  const pcTemplatePath = path.join(bishengConfig.output, `${entryName}.html`);
  fs.writeFileSync(pcTemplatePath, nunjucks.renderString(pcTemplate, {
    reactVersion,
    injectHeads,
    injectBodies,
  }));
  generateEntryFile(
    bishengConfig.pcComponentPath,
    entryName,
  );

  var entryName = 'demo';
  const h5Template = fs.readFileSync(bishengConfig.h5HtmlTemplate).toString();
  const h5TemplatePath = path.join(bishengConfig.output, `${entryName}.html`);
  fs.writeFileSync(h5TemplatePath, nunjucks.renderString(h5Template, {
    reactVersion,
    injectHeads,
    injectBodies,
  }));
  generateEntryFile(
    bishengConfig.h5ComponentPath,
    entryName,
  );
}

const handleWatch = () => {
  chokidar.watch(path.join(process.cwd(), 'app.config.ts')).on('change', (path) => {
    // console.log(`File ${path} has been changed`);
    // process.send('restart');
    console.log(`配置文件变动， 请重新执行 cook dev`);
  });

  // chokidar.watch(path.join(process.cwd(), 'document/demo')).on('add', (path) => {
  //   console.log(`File ${path} has been added`);
  //   process.send('restart');
  // });
}

exports.start = async () => {
  process.env.NODE_ENV = 'development';
  const bishengConfig = getBishengConfig();
  context.initialize({
    bishengConfig
  });
  generatorHtml(bishengConfig);

  const webpackConfig = getWebpackCommonConfig({
    type: 'dev',
  });
  const compiler = webpack(webpackConfig);

  const startParam = await getStartParam();
  const serverOptions = {
    // contentBase控制去哪里访问本地目录的资源
    contentBase: bishengConfig.output,
    // publicPath控制内存资源输出目录
    publicPath: '/',
    hot: true,
    compress: true,
    disableHostCheck: true,
    quiet: false,
    host: startParam.host,
  }
  const server = new WebpackDevServer(compiler, serverOptions);
  // 第一次编译成功时： 打开页面
  let hasCompile = false;
  compiler.plugin('done', async stats => {
    if (!stats.hasErrors() && !hasCompile) {
      open(startParam.url);
      handleWatch();
      hasCompile = true;
    }
  });
  server.listen(startParam.port, '0.0.0.0');
};

exports.build = function build(callback) {
  process.env.NODE_ENV = 'production';
  const bishengConfig = getBishengConfig();
  context.initialize({
    bishengConfig,
    isBuild: true,
  });

  console.log(`bishengConfig: ${JSON.stringify(bishengConfig, null, 2)}`);
  generatorHtml(bishengConfig);

  const webpackConfig = getWebpackCommonConfig({
    type: 'build',
  });
  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      return console.error(err);
    }
    if (stats.hasErrors()) {
      console.log(stats.toString('errors-only'));
      return;
    }

    require('./loaders/common/boss').jobDone();

    callback && callback();
  });
};
