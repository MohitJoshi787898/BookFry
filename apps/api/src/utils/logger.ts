export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}]:`, ...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] [${new Date().toISOString()}]:`, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}]:`, ...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] [${new Date().toISOString()}]:`, ...args);
    }
  }
};
