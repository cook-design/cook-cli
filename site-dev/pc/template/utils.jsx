export function getQuery(key) {
  const val = window.location.search
    .replace(/^\?/, '')
    .split('&')
    .filter(item => item)
    .map(item => item.split('='))
    .find(item => item[0] && item[0] === key);

  return val && val[1];
}

export function isLocalStorageNameSupported() {
  const testKey = 'test';
  const storage = window.localStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
