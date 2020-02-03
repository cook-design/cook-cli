const colors = require('colors');
const { prompt } = require('inquirer');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const opn = require('opn');
const path = require('path');
const checkMentorCliVersion = require('../util/check-mentor-cli-version');
const { API_URL, GITLAB_KEY_URL, GITLAB_API_URL, MODE } = require('../config/dynamic-config.js');
const { createProject } = require('./gitlab.js');
const { init, checkComponent, getUsers, saveComponnetToDB, checkGitLabUser, updateComponent } = require('./service.js');
const { sleep } = require('./util.js');
let INITDATA = {};

/**
 * @desc 获取用户目录下存储的token
 * 
 * @return { string } token
 */
const saveTokenToLocal = (token) => {
  try {
    // 获取用户目录
    const userPath = os.homedir();
    const file = `${userPath}/.mentor/user.json`;
    const info = {};
    info.token = token;
    fs.writeFileSync(file, JSON.stringify(info, null, 2), {
      encoding: 'utf8',
    });
    return true;
  } catch (err) {
    return err;
    console.log(colors.red(err));
  }
  return false;
};

const getAuthor = (val, list) => {
  for (const item of list) {
    if (item.account === val) {
      return item;
    }
  }
  return '';
};

/**
 * @desc 获取用户目录下存储的token
 * 
 * @return { string } token
 */
const getToken = () => {
  try {
    // 获取用户目录
    const userPath = os.homedir();
    if (!fs.existsSync(`${userPath}/.mentor`)) {
      fs.mkdirSync(`${userPath}/.mentor`);
    }
    const file = `${userPath}/.mentor/user.json`;
    let token = '';
    if (fs.existsSync(file)) {
      token = require(file).token || '';
    }
    return token;
  } catch (err) {
    console.log(colors.red(err));
  }
  return '';
};

const getQuestions = () => {
  const {
    platform,
    tag,
    type,
  } = INITDATA;
  const questions = [{
    type: 'input',
    name: 'name',
    message: '输入组件名称(使用中划线命名法例如 button-group):',
    validate: async (val) => {
      if (val) {
        if (val.length <= 6 || val.match(/[A-Z]+/)) {
          return '请使用大于6位的中划线命名';
        } else {
          const { data } = await checkComponent({
            name: `@choicefe/${val}`,
          });
          if (data) {
            return '该组件已存在！';
          } else {
            return true;
          }
        }
      } else {
        return '不能为空';
      }
    },
  }, {
    type: 'input',
    name: 'description',
    message: '输入组件描述:',
    validate(val) {
      if (val) {
        return true;
      }
      return '不能为空!';
    },
  }, {
    type: 'input',
    name: 'author',
    message: '输入组件开发者(个人域账号):',
    validate: async (val) => {
      if (val) {
        const { data } = await getUsers();
        const authorItem = getAuthor(val, data);
        if (authorItem) {
          global.componentUser = authorItem;
          return true;
        } else {
          return '没有找到该用户!';
        }
      } else {
        return '不能为空!';
      }
    },
  }, {
    type: 'list',
    name: 'platform',
    choices: platform.map(item => item.name),
    message: '选择组件使用平台:',
  }, {
    type: 'list',
    name: 'tag',
    choices: tag.map(item => item.name),
    message: '选择组件标签:',
  }, {
    type: 'list',
    name: 'type',
    choices: type.map(item => item.name),
    message: '选择组件类型:',
  }];
  if (!getToken()) {
    // 自动打开 GITLAB_KEY_URL
    opn(GITLAB_KEY_URL);
    questions.unshift({
      type: 'input',
      name: 'token',
      message: '请输入Gitlab Private token:',
      validate: async (val) => {
        // 远程校验
        if (val) {
          let cb = true;
          const data = await checkGitLabUser(val);
          if (!data.id) {
            cb = `token 校验失败! 获取Gitlab Private token from ${GITLAB_KEY_URL}`;
          } else {
            if (!saveTokenToLocal(val)) {
              cb = `token 本地存储失败`;
            }
          }
          return cb;
        }
        return `不能为空! 获取Gitlab Private token from ${GITLAB_KEY_URL}`;
      },
    });
  }
  return questions;
};

/**
 * @desc 将component数据保存到用户目录便于webui使用
 * 
 * @param {object} data 
 * @return null
 */
const saveComponentToLocal = (data) => {
  // 获取用户目录
  const userPath = os.homedir();
  if (!fs.existsSync(`${userPath}/.mentor`)) {
    fs.mkdirSync(`${userPath}/.mentor`);
  }
  const file = `${userPath}/.mentor/component.json`;
  let componentList = {};
  if (fs.existsSync(file)) {
    componentList = require(file);
  }
  data.path = `${process.cwd()}/${data.name}`;
  componentList[data.name] = data;
  fs.writeFileSync(file, JSON.stringify(componentList, null, 2), {
    encoding: 'utf8',
  });
};

const filterComponentParam = (param) => {
  const index = INITDATA[param].map(item => item.name).indexOf(global.component[param]);
  return INITDATA[param].map(item => item.value)[index];
}

const npmInstall = () => new Promise((resolve, reject) => {
  console.log('正在安装依赖模块');
  const { name } = global.component;
  const ps = exec(`cd ${name} && ${MODE} install`, (err) => {
    if (err) {
      reject(err);
    } else {
      console.log('模块依赖安装完成');
      resolve();
    }
  });
  ps.stdout.on('data', (data) => {
    console.log(data);
  });
});

module.exports = async () => {
  try {
    await checkMentorCliVersion();
    const initRes = await init();
    INITDATA = initRes.data;
    prompt(getQuestions()).then(async ({
      platform: cPlatform,
      tag: cTag,
      type: cType,
      name: cName,
      description: cDescription
    }) => {
      try {
        global.component = {};
        global.component.platform = cPlatform;        
        global.component.tag = cTag;
        global.component.type = cType;
        global.component.name = cName;
        global.component.description = cDescription;
        global.component.token = getToken();
        global.component.author = `${global.componentUser.nickname}(${global.componentUser.account})`;
        global.component.platform = filterComponentParam('platform');          
        global.component.tag = filterComponentParam('tag');
        global.component.type = filterComponentParam('type');
        console.log(`创建组件：${JSON.stringify(global.component, null, 4)})`);
        const { name, platform, tag, type, description, author } = global.component;
        const { data } = await saveComponnetToDB({
          name: `@choicefe/${name}`,
          platform,
          tag: tag || 'None',
          type: type || 'None',
          description,
          author,
        });
        global.component.componentId = data.insertId;
        saveComponentToLocal(global.component);
        await createProject(global.component);
        await updateComponent({
          id: global.component.componentId,
          name: `@choicefe/${name}`,
          gid: global.component.gid,
          homepage: global.component.gitlabUrl,
        });
        await npmInstall();
        console.log(colors.green(`组件仓库地址：${global.component.gitlabUrl}`));
        console.log(colors.green('组件创建成功。'));
        process.exit(0);
      } catch (err) {
        console.log('init err:');
        console.log(colors.red(err));
      }
    });
  } catch (err) {
    console.log(colors.red(err));
  }
};