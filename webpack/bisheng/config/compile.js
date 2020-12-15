/**
 * @desc 模块打包配置
 */

const path = require('path');
const ts = require('gulp-typescript');
const gulp = require('gulp');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const del = require('del');
const { tsLoaderOption, getBabelLoaderOption } = require('./getOption');
const { existsSync } = require('fs');

const libDir = path.join(process.cwd(), 'lib');
const esDir = path.join(process.cwd(), 'es');

const tsCompile = (modules) => new Promise((resolve, reject) => {
  try {
    console.log(`构建 ${modules === false ? 'es' : 'commonjs'} module`);
    rimraf.sync(!modules ? esDir : libDir);
    const componentPath = path.join(process.cwd(), 'src');
    const source = [
      `${componentPath}/**/*.tsx`,
      `${componentPath}/**/*.ts`,
    ];
    if (tsLoaderOption.allowJs) {
      source.unshift(`${componentPath}/**/*.jsx`);
      source.unshift(`${componentPath}/**/*.js`);
    }

    let tsResult = null;
    if (existsSync(`${process.cwd()}/tsconfig.json`)) {
      tsResult = ts.createProject(`${process.cwd()}/tsconfig.json`).src();
    } else {
      tsResult = gulp.src(source).pipe(ts(tsLoaderOption));
    }

    tsResult.on('error', (err) => {
      reject(err);
      console.log('ts compile error:', err);
    })
    .pipe(gulp.dest(!modules ? esDir : libDir));

    const check = () => {
      resolve(tsResult);
    }
  
    tsResult.on('finish', check);
    tsResult.on('end', check);
  } catch (err) {
    console.log('ts compile error:', err);
    reject(err);
  }
});

const jsCompile = (modules) => new Promise((resolve, reject) => {
  try {
    const folder = !modules ? 'es' : 'lib';
    const componentPath = path.join(process.cwd(), folder);
    const source = [
      `${componentPath}/**/*.js`,
      `${componentPath}/**/*.jsx`,
    ];
    const jsResult = gulp.src(source)
      .pipe(babel(getBabelLoaderOption({
        modules,
      })))
      .on('error', (err) => {
        console.log('js compile error:', err);
        reject(err);
      })
      .pipe(gulp.dest(!modules ? esDir : libDir));

    const check = () => {
      resolve(jsResult);
    }
  
    jsResult.on('finish', check);
    jsResult.on('end', check);
  } catch (err) {
    console.log('js compile error:', err);
    reject(err);
  }
});

const copyAssets = (modules) => new Promise((resove) => {
  const componentPath = path.join(process.cwd(), 'src');
  const source = [
    `${componentPath}/**/*.less`,
    `${componentPath}/**/*.css`,
    `${componentPath}/**/*.svg`,
    `${componentPath}/**/*.png`,
    `${componentPath}/**/*.jpg`,
    `${componentPath}/**/*.jpeg`,
  ];
  gulp.src(source).pipe(gulp.dest(!modules ? esDir : libDir));
  resove(true);
});

const deleteJsx = (modules) => new Promise((resove) => {
  const folder = !modules ? 'es' : 'lib';
  const componentPath = path.join(process.cwd(), folder);
  const source = [
    `${componentPath}/**/*.jsx`,
  ];
  del(source);
  resove(true);
});

module.exports = async () => {
  try {
    // es module
    await tsCompile(false);
    await jsCompile(false);
    await copyAssets(false);
    await deleteJsx(false);

    // common module
    await tsCompile(true);
    await jsCompile(true);
    await copyAssets(true);
    await deleteJsx(true);
  } catch (err) {
    console.log(err);
    throw err.message || err;
  }
}
