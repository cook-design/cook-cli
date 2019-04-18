import glob from 'glob';
import path from 'path';
import { render } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';

const files = glob.sync(path.join(__dirname, '../document/demo/*.md'));
files.forEach((file) => {
  test(`renders ${file} correctly`, () => {
    const demo = require(file).default;
    const wrapper = render(demo);
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });
});
