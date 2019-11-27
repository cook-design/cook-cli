import Promise from 'es6-promise';
import fetch from 'isomorphic-fetch';
import URL from 'url-parse';

Promise.polyfill();

const MENTOR_SERVER = 'http://127.0.0.1:7001';

const { query: { theme, themeVersion, componentName, componentVersion, componentVersionId } } = new URL(window.location.href, true);

function lessCompile(param = {}) {
  const url = `${MENTOR_SERVER}/component/theme`;
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());
}

function inserDom() {
  const $style = document.querySelector('head').querySelectorAll('style');
  if ($style.length) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < $style.length; i++) {
      $style[i].remove();
    }
  }
  const $content = document.getElementById('react-content');
  const $body = document.querySelector('body');
  $content.style.display = 'none';
  const $cover = document.createElement('div');
  $cover.id = 'theme-cover';
  $cover.innerText = '编译中...';
  $cover.style.cssText = `
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    text-align: center;
    font-size: 0.4rem;
    color: #fff;
    box-sizing: border-box;
    padding: 60% 0 0;
  `;
  $body.appendChild($cover);
}

inserDom();

lessCompile({
  theme,
  themeVersion,
  componentName,
  componentVersion,
  componentVersionId,
}).then((res) => {
  if (res.success) {
    const cssPath = res.data;
    const $link = document.createElement('link');
    $link.type = 'text/css';
    $link.rel = 'stylesheet';
    $link.href = cssPath;
    document.getElementsByTagName('head')[0].appendChild($link);
    const $content = document.getElementById('react-content');
    $content.style.display = 'block';
    document.getElementById('theme-cover').remove();
  }
}).catch(err => console.log(err));
