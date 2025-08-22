import Fastify from "fastify";

/**
 * AgentCore ping response interface
 */
interface PingResponse {
  status: 'Healthy' | 'HealthyBusy';
  time_of_last_update: number;
}

/**
 * Ping route handler - AgentCore health check endpoint
 */
async function pingHandler(
  request: Fastify.FastifyRequest,
  reply: Fastify.FastifyReply
): Promise<PingResponse> {
  
  // For this implementation, we'll always return Healthy
  // In a production system, you might check:
  // - Database connectivity
  // - External service availability
  // - Resource usage thresholds
  // - Queue sizes, etc.
  
  const response: PingResponse = {
    status: 'Healthy',
    time_of_last_update: Math.floor(Date.now() / 1000) // Unix timestamp
  };

  // Log the ping request
  request.log.debug('AgentCore ping check requested');

  // Return 200 status with JSON response
  reply.status(200);
  return response;
}

/**
 * Register ping route with Fastify
 */
export default async function pingRoute(fastify: Fastify.FastifyInstance): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/ping',
    schema: {
      description: 'AgentCore health check endpoint that verifies agent operational status',
      tags: ['AgentCore'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['Healthy', 'HealthyBusy'],
              description: 'Agent health status - Healthy: ready for new work, HealthyBusy: operational but busy'
            },
            time_of_last_update: { 
              type: 'number',
              description: 'Unix timestamp of last status update'
            }
          },
          required: ['status', 'time_of_last_update']
        }
      }
    },
    handler: pingHandler
  });

  // Log route registration
  fastify.log.info('Registered route: GET /ping - AgentCore health check endpoint');
}

// Export route metadata for documentation or testing
export const routeInfo = {
  method: 'GET' as const,
  path: '/ping',
  description: 'AgentCore health check endpoint that verifies agent operational status'
};
