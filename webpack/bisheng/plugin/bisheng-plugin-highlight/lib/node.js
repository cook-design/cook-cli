

const Prism = require('node-prismjs');
const JsonML = require('jsonml.js/lib/utils');

function getCode(node) {
  return JsonML.getChildren(JsonML.getChildren(node)[0] || '')[0] || '';
}

function replaceCode(code) {
  let nCode = '';
  let components = [];
  var rg = /import (\w+) from (\'@alipay\/cook-[\w-]+\');/g;
  nCode = code.replace(rg, (str, $0) => {
    components.push($0);
    return '';
  });
  if (components.length) {
    nCode = 'import { ' + components.join(', ') + ' } from \'@alipay/cook\';\n' + nCode;
    nCode = nCode.replace(/\n{2,10}/g, '\n\n');
    nCode = nCode.replace(/\n{2,10}/g, '\n\n');
    nCode = nCode.replace(/\n{2,10}/g, '\n\n');
  }
  return nCode;
}

function highlight(node) {
  if (!JsonML.isElement(node)) return;

  if (JsonML.getTagName(node) !== 'pre') {
    JsonML.getChildren(node).forEach(highlight);
    return;
  }

  let code = getCode(node);
  let nCode = '';
  // 美化jsx, 将小屏组件库 import Button from '@alipay/cook-button'; 替换为 import { Button } from '@alipay/cook';
  if (JsonML.getAttributes(node).lang === 'jsx') {
    nCode = replaceCode(code);
  } else {
    nCode = code;
  }

  const language = Prism.languages[JsonML.getAttributes(node).lang] ||
          Prism.languages.autoit;
  JsonML.getAttributes(node).highlighted =
    Prism.highlight(nCode, language);
}

module.exports = (markdownData/* , config */) => {
  highlight(markdownData.content);
  return markdownData;
};
