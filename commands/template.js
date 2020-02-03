const fetch = require('node-fetch');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const tarfs = require('tar-fs');
const vfs = require('vinyl-fs');
const map = require('map-stream');
const rimraf = require('rimraf');
const writeJsonFile = require('write-json-file');
const fs = require('fs');
const nunjucks = require('nunjucks');
const get = require('lodash/get');

// 获取临时存放目录
const getBoilerplate = async () => {
  let pkgUrl = '';
  const name = get(global.component, 'name', 'normal').toLowerCase();
  const platfrom = get(global.component, 'platform', 'normal').toLowerCase();
  if (global.component.templatePath) {
    pkgUrl = `https://registry.npmjs.org/${global.component.templatePath}`;
  } else {
    pkgUrl = `https://registry.npmjs.org/${platfrom}`;
  }
  console.log(`模板下载中: ${pkgUrl}`);
  let response = await fetch(pkgUrl);
  const body = await response.json();
  const latestVersion = body['dist-tags'].latest;
  response = await fetch(body.versions[latestVersion].dist.tarball);
  const tmpdir = path.resolve(os.tmpdir(), name);
  console.log(`文件临时存放目录: ${tmpdir}`)
  return new Promise((resolve) => {
    const boilerplatePath = path.resolve(tmpdir, 'package');
    response.body
      .pipe(zlib.createGunzip())
      .pipe(tarfs.extract(tmpdir))
      .on('finish', () => resolve(boilerplatePath));
  });
};

const moveProject = async (boilerplatePath, project, componentId) => {
  const { name, description, platform, author } = global.component;
  const updatePkg = () => {
    const pkgJsonPath = path.resolve(name, 'package.json');
    const pkgJSon = require(pkgJsonPath);
    pkgJSon.version = '1.0.0';
    pkgJSon.name = `@choicefe/${name}`;
    pkgJSon.description = description;
    pkgJSon.homepage = project.web_url;
    pkgJSon.author = author;
    return writeJsonFile.sync(pkgJsonPath, pkgJSon, { detectIndent: true });
  };

  // 重写demo name
  const rewriteDemo = () => {
    const { name } = global.component;
    const demoPath = path.join(process.cwd(), `${name}/document/demo/basic.md`);
    const demoTemplate = fs.readFileSync(demoPath).toString();
    fs.writeFileSync(
      demoPath,
      nunjucks.renderString(demoTemplate, {
        name: `@choicefe/${name}`,
      }),
    );
  }

  // 重写app.config.ts
  const rewriteAppConfig = () => {
    const { name } = global.component;
    const appConfigPath = path.join(process.cwd(), `${name}/app.config.ts`);
    const appConfigTemplate = fs.readFileSync(appConfigPath).toString();
    fs.writeFileSync(
      appConfigPath,
      nunjucks.renderString(appConfigTemplate, {
        componentId,
        platform,
      }),
    );
  }

  const rewriteDotFiles = (file, cb) => {
    file.path = file.path.replace(/__(\.\w+)$/, '$1'); // eslint-disable-line no-param-reassign
    cb(null, file);
  };

  return new Promise((resolve) => {
    vfs
      .src('**/*', { cwd: boilerplatePath, dot: true })
      .pipe(map(rewriteDotFiles))
      .pipe(vfs.dest(path.resolve(process.cwd(), name)))
      .on('finish', () => {
        updatePkg();
        rewriteDemo();
        rewriteAppConfig();
        rimraf.sync(boilerplatePath);
        resolve();
      });
  });
};

exports.generatorProject = async (project, componentId) => {
  try {
    const temporaryFold = await getBoilerplate();
    await moveProject(temporaryFold, project, componentId);
  } catch (e) {
    console.log(e);
  }
};

exports.getBoilerplate = getBoilerplate;
