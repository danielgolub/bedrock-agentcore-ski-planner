import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

/**
 * Health check route configuration
 */
const route = {
  method: 'GET' as const,
  path: '/health',
  description: 'Health check endpoint that returns server status'
};

/**
 * Health check response interface
 */
interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

/**
 * Health check route handler
 */
async function healthHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<HealthResponse> {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  // Log the health check request
  request.log.info('Health check requested');

  // Return 200 status with JSON response
  reply.status(200);
  return response;
}

/**
 * Register health check route with Fastify
 */
export default async function healthRoute(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: route.method,
    url: route.path,
    schema: {
      description: route.description,
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' }
          },
          required: ['status', 'timestamp', 'uptime', 'version', 'environment']
        }
      }
    },
    handler: healthHandler
  });

  // Log route registration
  fastify.log.info(`Registered route: ${route.method} ${route.path} - ${route.description}`);
}

// Export route metadata for documentation or testing
export const routeInfo = route;
