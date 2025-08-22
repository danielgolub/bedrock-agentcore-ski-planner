import pino from 'pino';

/**
 * Logger service configuration
 */
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      errorLikeObjectKeys: ['err', 'error'],
    },
  },
};

/**
 * Create logger instance based on environment
 */
const createLogger = (): pino.Logger => {
  return pino(loggerConfig);
};

/**
 * Global logger instance
 */
export const logger = createLogger();

/**
 * Create child logger with additional context
 */
export const createChildLogger = (context: Record<string, unknown>): pino.Logger => {
  return logger.child(context);
};

/**
 * Logger utilities
 */
export const loggerUtils = {
  /**
   * Log execution time of an async function
   */
  async timeAsync<T>(
    label: string,
    fn: () => Promise<T>,
    contextLogger = logger
  ): Promise<T> {
    const start = Date.now();
    contextLogger.debug(`Starting: ${label}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      contextLogger.info(`Completed: ${label} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      contextLogger.error(`Failed: ${label} (${duration}ms)`, error instanceof Error ? error.message : error);
      throw error;
    }
  },

  /**
   * Log execution time of a synchronous function
   */
  time<T>(label: string, fn: () => T, contextLogger = logger): T {
    const start = Date.now();
    contextLogger.debug(`Starting: ${label}`);
    
    try {
      const result = fn();
      const duration = Date.now() - start;
      contextLogger.info(`Completed: ${label} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      contextLogger.error(`Failed: ${label} (${duration}ms)`, error instanceof Error ? error.message : error);
      throw error;
    }
  },


};

export default logger;
