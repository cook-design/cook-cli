const markTwain = require('cook-mark-twain');
const get = require('lodash/get');
const { appConfig } = require('../config/getOption');
const resolveAlipayDemo = require('./resolveAlipayDemo');
const { toUriPath } = require('../utils/escape-win-path');

module.exports = function (filename, fileContent) {
  // 小程序需要动态组装Demo
  const viewType = get(appConfig, 'viewType', '');
  let content = fileContent;
  if (viewType === 'alipay') {
    content = resolveAlipayDemo(fileContent);
  }
  const markdown = markTwain(content);
  markdown.meta.filename = toUriPath(filename);
  return markdown;
};
