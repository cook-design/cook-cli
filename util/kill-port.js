const { shell } = require('execa');

module.exports = (port, sudo) => {
  if (process.platform === 'win32') {
    return shell(
      `Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force`,
    );
  }
  if (sudo) {
    return shell(
      `sudo lsof -i tcp:${port} | grep LISTEN | awk '{print $2}' | sudo xargs kill -9`,
    );
  } else {
    return shell(
      `lsof -i tcp:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`,
    );
  }
};
