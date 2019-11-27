/**
 *  @description 解决antd样式污染问题， 通过alias指定到文件
 * */

const fs = require('fs');
const path = require('path');

const toHump = (name) => {
  const str = name.replace(/\-(\w)/g, (all, letter) => {
      return letter.toUpperCase();
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = function(alias) {
  // if (!fs.existsSync(path.join(__dirname, '../mock'))) {
  //   fs.mkdirSync(path.join(__dirname, '../mock'));
  // }
  // if (!fs.existsSync(path.join(__dirname, '../mock/antd'))) {
  //   fs.mkdirSync(path.join(__dirname, '../mock/antd'));
  // }
  // const cssFileProxyPath = path.join(__dirname, '../mock/antd/empty.less');  
  // fs.writeFileSync(cssFileProxyPath, '');

  const antdFolder = path.join(__dirname, '../../node_modules/antd');
  const items = fs.readdirSync(path.join(antdFolder, 'lib'));
  items.filter(item => {
    if (!item.startsWith('_')) {
      const styleFilePath = `antd/lib/${item}/style`;
      alias[styleFilePath] = path.join(__dirname, '../mock/antd/empty.less');
      // const jsFilePath = `antd/lib/${item}`;
      // const jsFileProxyPath = path.join(__dirname, `../mock/antd/${item}.js`);  
      // fs.writeFileSync(jsFileProxyPath, `
      //   const ${toHump(item)} = window.antd['${toHump(item)}'];
      //   export { ${toHump(item)} as default };
      // `);
      // alias[jsFilePath] = jsFileProxyPath;
    }
  });

  console.log(alias);
};