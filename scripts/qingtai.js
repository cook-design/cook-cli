const getSolution = require('../util/get-solution');
const solution = getSolution().toLowerCase();

let themes = {};
if (solution.indexOf('base') > -1 || solution.indexOf('cs-') > -1) {
  themes = {
    'hd': '2px',
  };
} else if (solution.indexOf('h5') > -1 || solution.indexOf('wap') > -1  || solution.indexOf('mobile') > -1) {
  themes = {
    'hd': '2px',
  };
} else if (solution.indexOf('plugin') > -1) {
  themes = {
    'hd': '1px',
    'brand-primary': '#f24e3e',
    'brand-primary-tap': '#cc3c1f',
    'brand-important': '#f24e3e',
    'primary-button-fill-tap': '#cc3c1f',
    'list-body-border-color': '#f5f5f5',
    'color-link': '#f96268',
    'switch-fill': '#f24e3e',
    'border-color-base': '#e5e5e5',
    'fill-body': '#f5f5f5',
    'notice-bar-fill': '#FFF1D5',
    'notice-bar-color': '#FF5724',
  };
}

console.log(`less-loader theme config: ${JSON.stringify(themes, null, 2)}`);

module.exports = () => {
  return themes;
};