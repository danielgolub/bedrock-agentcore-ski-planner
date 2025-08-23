#!/usr/bin/env node

import 'dotenv/config';
import { logger } from './services/logger.ts';
import { startServer, stopServer } from './services/fastify.ts';

/**
 * Start the Fastify server
 */
export async function startWebServer(): Promise<void> {
  logger.info('🚀 Starting Ski Planner Web Server...');
  
  try {
    const server = await startServer();
    
    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`📡 Received ${signal}, starting graceful shutdown...`);
      await stopServer(server);
      process.exit(0);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), '❌ Failed to start web server');
    process.exit(1);
  }
}

await startWebServer();
