const path = require('path');
const zipper = require('zip-local');

(()=>{
  const file = path.join(__dirname, '../_site-dev');
  const zipFile = path.join(__dirname, '../site-dev.zip');
  zipper.sync.zip(file).compress().save(zipFile);
})()