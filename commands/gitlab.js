const colors = require('colors');
const fetch = require('node-fetch');
const template = require('./template');
const { execSync } = require('child_process');
const { createGitLabProject } = require('./service.js');

const cloneProject = async (project, componentId) => {
  try {
    // ssh_url_to_repo: 'git@gitlab.alipay-inc.com:mentor-components/mo-test-ssh-key-01.git',
    // http_url_to_repo: 'http://gitlab.alipay-inc.com/mentor-components/mo-test-ssh-key-01.git',
    // 使用 ssh_url_to_repo 需要在gitlab配置 ssh key, 不然会提示 Permission denied (publickey)
    execSync(`git clone ${project.ssh_url_to_repo}`);
    execSync(`cd ${project.name}`);
    // 模板初始化
    await template.generatorProject(project, componentId);
    execSync(`cd ${project.name} && git add . && git commit -m "feature: init project" && git push -u origin master`);
  } catch (err) {
    throw err;
  }
};

const createProject = async ({ token, name, description, componentId }) => {
  try {
    const project = await createGitLabProject({ token, name, description });
    if (project.id) {
      global.component.gid = project.id;
      global.component.gitlabUrl = project.web_url;
      await cloneProject(project, componentId);
    } else {
      console.log(`组件创建失败: ${JSON.stringify(project, null, 2)}`.red);
    }
  } catch (err){
    throw err;
  }
};

module.exports = {
  createProject,
};

