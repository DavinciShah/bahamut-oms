'use strict';

const fs = require('fs');
const path = require('path');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL] !== undefined
  ? LEVELS[process.env.LOG_LEVEL]
  : LEVELS.info;

const logFile = process.env.LOG_FILE || null;

function formatMessage(level, message, meta) {
  const ts = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function write(level, message, meta) {
  if (LEVELS[level] > currentLevel) return;
  const line = formatMessage(level, message, meta);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
  if (logFile) {
    try {
      fs.appendFileSync(path.resolve(logFile), line + '\n');
    } catch (_) {
      // best-effort file logging; never throw from logger
    }
  }
}

const logger = {
  error: (message, meta) => write('error', message, meta),
  warn:  (message, meta) => write('warn',  message, meta),
  info:  (message, meta) => write('info',  message, meta),
  debug: (message, meta) => write('debug', message, meta),
};

module.exports = logger;
