import Fastify, { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loggerConfig } from './logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure Fastify server instance
 */
export async function createServer(): Promise<FastifyInstance> {
  // Create Fastify instance with Pino logger integration
  const server = Fastify({
    logger: loggerConfig,
    // Use the existing Pino logger configuration
    disableRequestLogging: false,
    requestIdLogLabel: 'reqId',
    requestIdHeader: 'x-request-id'
  });

  // Register error handler
  server.setErrorHandler(async (error, request, reply) => {
    server.log.error(error, 'Unhandled error occurred');
    
    const statusCode = error.statusCode || 500;
    const message = statusCode >= 500 ? 'Internal Server Error' : error.message;
    
    await reply.status(statusCode).send({
      error: message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  });

  // Add request/response logging hooks
  server.addHook('onRequest', async (request) => {
    request.log.info(`${request.method} ${request.url} - Request received`);
  });

  server.addHook('onResponse', async (request, reply) => {
    request.log.info(`${request.method} ${request.url} - ${reply.statusCode} in ${reply.elapsedTime}ms`);
  });

  // Load all routes from the routes directory
  await loadRoutes(server);

  return server;
}

/**
 * Auto-load all route files from the routes directory
 */
async function loadRoutes(server: FastifyInstance): Promise<void> {
  const routesDir = path.resolve(__dirname, '../routes');
  
  try {
    // Check if routes directory exists
    if (!fs.existsSync(routesDir)) {
      server.log.warn(`Routes directory not found: ${routesDir}`);
      return;
    }

    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .filter(file => !file.endsWith('.test.ts') && !file.endsWith('.test.js'));

    server.log.info(`Loading ${routeFiles.length} route files from ${routesDir}`);

    for (const file of routeFiles) {
      const routePath = path.join(routesDir, file);
      try {
        // Import the route module
        const routeModule = await import(`file://${routePath}`);
        
        // Check if the module exports a default function or register function
        if (typeof routeModule.default === 'function') {
          await server.register(routeModule.default);
          server.log.info(`Loaded route: ${file}`);
        } else if (typeof routeModule.register === 'function') {
          await server.register(routeModule.register);
          server.log.info(`Loaded route: ${file}`);
        } else {
          server.log.warn(`Route file ${file} does not export a valid route function`);
        }
      } catch (error) {
        server.log.error(error, `Failed to load route file: ${file}`);
      }
    }
  } catch (error) {
    server.log.error(error, 'Failed to load routes directory');
  }
}

/**
 * Start the Fastify server
 */
export async function startServer(): Promise<FastifyInstance> {
  const server = await createServer();
  const port = parseInt(process.env.PORT || '8080', 10);
  const host = 'localhost';
  
  try {
    await server.listen({ port, host });
    server.log.info(`🚀 Server listening on http://${host}:${port}`);
    return server;
  } catch (error) {
    server.log.error(error, 'Failed to start server');
    process.exit(1);
  }
}

/**
 * Gracefully stop the server
 */
export async function stopServer(server: FastifyInstance): Promise<void> {
  try {
    await server.close();
    server.log.info('✅ Server stopped gracefully');
  } catch (error) {
    server.log.error(error, 'Error stopping server');
    process.exit(1);
  }
}
