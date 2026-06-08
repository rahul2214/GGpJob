const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'migration_log.txt');
try {
  const content = fs.readFileSync(logFile, 'utf16le');
  console.log(content.substring(0, 2000));
} catch (e) {
  console.error(e);
}
