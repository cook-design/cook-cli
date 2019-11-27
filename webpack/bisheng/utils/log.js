module.exports = (text) => {
  console.log('---def log---');
  if (typeof text === 'object') {
    console.log(JSON.stringify(text));
  } else {
    console.log(text);
  }
}