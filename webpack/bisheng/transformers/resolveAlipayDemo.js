const fs = require('fs');
const path = require('path');

const getContent = (fileName) => {
  try {
    const demoPath = path.join(process.cwd(), 'demo/src/pages');
    const axmlContent = fs.readFileSync(path.join(demoPath, fileName));
    const b = '```';
    if (axmlContent) {
      return `
  ${b}
  ${axmlContent}
  ${b}
    `;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}

module.exports = (fileContent) => {
  const oldContent = fileContent.split('## placeholder');
  const axmlContent = getContent('index.axml');
  const acssContent = getContent('index.acss');
  const jsContent = getContent('index.js');

  const content = `${oldContent[0] || ''}
## 示例代码
${axmlContent || ''}
${acssContent || ''}
${jsContent || ''}
${oldContent[1]}
`;
  console.log(content);
  return content;
}
