const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
const errorLogPath = path.join(logsDir, 'errors.log');

function redactSensitiveData(message) {
  return String(message)
    .replace(/(password|token|authorization|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
}

function logError({ method, path: requestPath, statusCode, message }) {
  fs.mkdirSync(logsDir, { recursive: true });

  const entry = `${new Date().toISOString()} | ${method} ${requestPath} | ${statusCode} | ${redactSensitiveData(message)}\n`;
  fs.appendFileSync(errorLogPath, entry, 'utf8');
}

module.exports = { logError };