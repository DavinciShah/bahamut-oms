const timestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...args) => console.log(`[${timestamp()}] INFO: ${message}`, ...args),
  error: (message, ...args) => console.error(`[${timestamp()}] ERROR: ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[${timestamp()}] WARN: ${message}`, ...args),
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${timestamp()}] DEBUG: ${message}`, ...args);
    }
  },
};

module.exports = logger;
