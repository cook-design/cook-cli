const fetch = require('node-fetch');
const querystring = require('querystring');
const { API_URL, GITLAB_API_URL, GITLAB_GROUP, CHOICE_NPM_URL } = require('../config/dynamic-config.js');

const ajaxWrapper = ({ method = 'GET', url, param }) => {
  return new Promise((resolve, reject) => {
    let requestUrl = url;
    const requestData = {
      method,
      headers: { 'Content-type': 'application/json' },
    };
    if (method === 'GET') {
      requestUrl = `${requestUrl}?${querystring.stringify(param)}`;
    } else {
      requestData.body = JSON.stringify(param);
    }
    fetch(requestUrl, {
      ...requestData
    }).then(async (res) => {
      const result = await res.json();
      const { success, data } = result;
      if (success) {
        resolve({ data });
      } else {
        reject(result);
      }
    });
  });
}

// 组件信息（platform、tag、type）
const init = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',
    url: `${API_URL}/component/init`,
    param,
  });
};

const checkComponent = (param = {}) => {
  return ajaxWrapper({
    method: 'GET',    
    url: `${API_URL}/component/check`,
    param,
  });
}

const getUsers = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',    
    url: `${API_URL}/component/users`,
    param,
  });
}

const saveComponnetToDB = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',    
    url: `${API_URL}/component/save`,
    param,
  });
}

const updateComponent = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',    
    url: `${API_URL}/component/update`,
    param,
  });
}

const checkVersion = (param = {}) => {
  return ajaxWrapper({
    method: 'GET',    
    url: `${API_URL}/component/checkVersion`,
    param,
  });
}

const saveVersion = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',    
    url: `${API_URL}/component/versionSave`,
    param,
  });
}

// gitlab api
const checkGitLabUser = async (token) => {
  const url = `${GITLAB_API_URL}/user?private_token=${token}`;
  const response = await fetch(url);
  return await response.json();
}

const createGitLabProject = async ({ token, name, description }) => {
  const url = `${GITLAB_API_URL}/projects`;

  let namespace = {};
  if (global.component.platform.indexOf('base') > -1) {
    namespace = GITLAB_GROUP.BASE
  } else {
    namespace = GITLAB_GROUP.BIZ    
  }
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      namespace: namespace.NAME,
      namespace_id: namespace.ID,
      private_token: token,
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}

const getNpmInfo = async (npmName) => {
  const url = `${CHOICE_NPM_URL}/${npmName}`;
  const response = await fetch(url);
  return await response.json();
}

module.exports = {
  init,
  checkComponent,
  getUsers,
  saveComponnetToDB,
  updateComponent,
  checkVersion,
  saveVersion,
  checkGitLabUser,
  createGitLabProject,
  getNpmInfo,
};