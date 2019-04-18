const { version } = require('../package.json');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const colors = require('colors');
const { API_URL } = require('../config/dynamic-config.js');

/**
 * @desc 将mentor发布信息保存到DB
 * 
 * @return null
 */
const saveMentorToDB = async () => {
  const url = `${API_URL}/mentor/publish`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ version }),
      headers: { 'Content-type': 'application/json' },
    });
    const body = await response.json();
    if (body.success) {
      console.log('mentor save success'.blue); // eslint-disable-line
    } else {
      console.log(colors.red(JSON.stringify(body))); // eslint-disable-line
    }
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
};

const ps = exec(`npm run lint && git tag cs-${version} && git push origin cs-${version} && npm publish`, (err) => {
  if (err) {
    console.log(`Error: ${err}`) // eslint-disable-line
  } else {
    saveMentorToDB();
    console.log('发布完成。。。') // eslint-disable-line
  }
});

ps.stdout.on('data', (d) => {
  console.log(d); // eslint-disable-line
});
