const colors = require('colors');
const { prompt } = require('inquirer');
const path = require('path');
const vfs = require('vinyl-fs');
const { getBoilerplate } = require('./template');
const { init } = require('./service.js');

let INITDATA = {};

const platform = [{
  value: 'cs-h5biz',
  name: '辰森移动端业务组件', 
}, {
  value: 'cs-pcbiz',
  name: '辰森PC端业务组件', 
}];

const getQuestions = () => {
  const questions = [{
      type: 'input',
      name: 'name',
      message: '输入组件名称(使用中划线命名法例如 button-group):',
      validate: async (val) => {
        let cb = true;
        if (val) {
          if (val.length <= 6 || val.match(/[A-Z]+/)) {
            cb = '请使用大于6位的中划线命名';
          }
          return cb;
        }
        return '不能为空!';
      },
    },
  ];

  if (!global.component.templatePath) {
    questions.unshift({
      type: 'list',
      name: 'platform',
      choices: platform.map(item => item.name),
      message: '选择组件使用平台:',
      validate() {
        return true;
      },
    });
  }

  return questions;
};

const filterPlatform = (name) => {
  return (platform.find(item => item.name === name)).value;
}

module.exports = async () => {
  try {
    // const initRes = await init();
    // INITDATA = initRes.data;
    global.component = {};
    global.component.templatePath = process.argv[3] || '';
    prompt(getQuestions()).then(async (promptRes) => {
      global.component.platform = filterPlatform(promptRes.platform);
      global.component.name = `mo-${promptRes.name}`;
      console.log(`添加组件: ${JSON.stringify(global.component, null, 2)}`);
      const temporaryFold = path.join(await getBoilerplate(), 'src');
      vfs.src(['**/*', '!./logo.png'], { cwd: temporaryFold, dot: false })
        .pipe(vfs.dest(path.resolve(process.cwd(), global.component.name)))
        .on('finish', () => {
          console.log(colors.green(`组件创建成功:${global.component.name}`));
          process.exit(0);
        });
    });
  } catch (err) {
    console.log(colors.red(err));
  }
};
