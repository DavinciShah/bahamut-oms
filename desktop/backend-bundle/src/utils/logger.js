'use strict';

const LOG_LEVEL    = (process.env.LOG_LEVEL || 'info').toLowerCase();
const LEVELS       = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[LOG_LEVEL] !== undefined ? LEVELS[LOG_LEVEL] : LEVELS.info;

function format(level, message, meta) {
  const ts  = new Date().toISOString();
  const obj = { ts, level, message };
  if (meta !== undefined) obj.meta = meta;
  return JSON.stringify(obj);
}

const logger = {
  error(message, meta) {
    if (currentLevel >= LEVELS.error) console.error(format('error', message, meta));
  },
  warn(message, meta) {
    if (currentLevel >= LEVELS.warn)  console.warn(format('warn',  message, meta));
  },
  info(message, meta) {
    if (currentLevel >= LEVELS.info)  console.info(format('info',  message, meta));
  },
  debug(message, meta) {
    if (currentLevel >= LEVELS.debug) console.debug(format('debug', message, meta));
  },
};

module.exports = logger;
