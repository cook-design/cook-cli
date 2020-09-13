const path = require('path');
const get = require('lodash/get');
const pkg = require(path.resolve(process.cwd(), 'package.json'));

const cookName = get(pkg, 'name', '');
const cookVersion = get(pkg, 'version', '');

const visitor = {
  Literal(path, state) {
    if (path.node.value === '@cookName@') {
      path.node.value = cookName;
    }
    if (path.node.value === '@cookVersion@') {
      path.node.value = cookVersion;
    }
  }
};
module.exports = function (babel) {
  return {
    visitor
  }
};