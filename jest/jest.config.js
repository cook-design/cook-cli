const path = require('path');
const os = require('os');
const { cwd, mentorPkg: { name } } = require(`${os.homedir()}/.mentor/pkg.json`);
console.log(`current Folder: ${cwd}`);

const getAlias = () => {
  const alias = {};
  alias[name] = '../../es';
  alias["\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$"] = "<rootDir>/jest/fileMock.js";
  alias["\\.(css|less|scss)$"] = "<rootDir>/jest/styleMock.js";
  return alias;
}

module.exports = {
  roots: [cwd],
  moduleDirectories: [
    '<rootDir>/node_modules',
    `${cwd}/node_modules`,
  ],
  rootDir: path.join(__dirname, '../'),
  setupFiles: [
    'raf/polyfill',
    '<rootDir>/jest/setup.js',
  ],
  // modulePathIgnorePatterns: [
  //   `<rootDir>/node_modules`,
  //   `${cwd}/node_modules`,
  // ],
  // set alias
  moduleNameMapper: getAlias(),
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'md', 'less', 'css', 'scss'],
  transform: {
    '\\.tsx?$': '<rootDir>/node_modules/cook-bisheng/lib/jest/codePreprocessor',
    '\\.js$': '<rootDir>/node_modules/cook-bisheng/lib/jest/codePreprocessor',
    '\\.md$': '<rootDir>/node_modules/cook-bisheng/lib/jest/demoPreprocessor',
  },
  transformIgnorePatterns: [
    `<rootDir>/node_modules`,
  ],
};

