const path = require('path');

module.exports = Object.assign({}, {
  source: {
    document: path.join(process.cwd(), 'document'),
  },
  output: path.join(process.cwd(), 'dist'),
  theme: path.join(__dirname, 'theme.js'),
  // pc模板配置
  pcComponentPath: path.join(__dirname, './pc/template/index.jsx').replace(/\\/g, '\\\\'),
  pcHtmlTemplate: path.join(__dirname, `./pc/static/template-${process.env.NODE_ENV === 'development' ? 'dev' : 'build'}.html`).replace(/\\/g, '\\\\'),

  // h5模板配置
  h5ComponentPath: path.join(__dirname, './h5/template/index.jsx').replace(/\\/g, '\\\\'),
  h5HtmlTemplate: path.join(__dirname, `./h5/static/template-${process.env.NODE_ENV === 'development' ? 'dev' : 'build'}.html`).replace(/\\/g, '\\\\'),
});

