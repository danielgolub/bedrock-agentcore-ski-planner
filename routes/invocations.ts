import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { getDetailedSkiPlan } from '../langgraph/ski-planner-workflow.ts';

/**
 * AgentCore invocations request interface
 */
interface InvocationsRequest {
  prompt: string;
  [key: string]: unknown; // Allow additional properties for flexibility
}

/**
 * AgentCore invocations response interface  
 */
interface InvocationsResponse {
  response: string;
  status: 'success' | 'error';
  metadata?: {
    location?: string;
    skillLevel?: string;
    weatherInfo?: string;
    resortRecommendations?: string;
    gearSuggestions?: string;
  };
}

/**
 * Parse the prompt to extract location and skill level
 */
function parsePrompt(prompt: string): { location: string; skillLevel: string } {
  // Simple parsing logic - can be enhanced with more sophisticated NLP
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract location (look for common location indicators)
  let location = 'general area';
  const locationPatterns = [
    /(?:at|in|to|near)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|for|with)/,
    /([a-zA-Z\s]+?)\s+(?:ski|resort|mountain)/i,
    /planning.*?(?:at|in|to|near)\s+([a-zA-Z\s]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      location = match[1].trim();
      break;
    }
  }
  
  // Extract skill level
  let skillLevel = 'intermediate';
  if (lowerPrompt.includes('beginner') || lowerPrompt.includes('new') || lowerPrompt.includes('first time')) {
    skillLevel = 'beginner';
  } else if (lowerPrompt.includes('expert') || lowerPrompt.includes('advanced') || lowerPrompt.includes('professional')) {
    skillLevel = 'expert';
  } else if (lowerPrompt.includes('intermediate') || lowerPrompt.includes('intermediate')) {
    skillLevel = 'intermediate';
  }
  
  return { location, skillLevel };
}

/**
 * Invocations route handler - Main AgentCore interface
 */
async function invocationsHandler(
  request: FastifyRequest<{ Body: InvocationsRequest }>,
  reply: FastifyReply
): Promise<InvocationsResponse> {
  const startTime = Date.now();
  
  try {
    const { prompt } = request.body;
    
    if (!prompt || typeof prompt !== 'string') {
      reply.status(400);
      return {
        response: 'Invalid request: prompt is required and must be a string',
        status: 'error'
      };
    }
    
    request.log.info({ prompt }, 'Processing ski planning request');
    
    // Parse the prompt to extract parameters
    const { location, skillLevel } = parsePrompt(prompt);
    
    request.log.debug({ location, skillLevel }, 'Parsed prompt parameters');
    
    // Execute the ski planning workflow
    const planningResult = await getDetailedSkiPlan(location, skillLevel);
    
    const processingTime = Date.now() - startTime;
    request.log.info({ processingTime }, 'Ski planning workflow completed');
    
    // Return AgentCore-compliant response
    const response: InvocationsResponse = {
      response: planningResult.finalPlan,
      status: 'success',
      metadata: {
        location: planningResult.location,
        skillLevel: planningResult.skillLevel,
        weatherInfo: planningResult.weatherInfo,
        resortRecommendations: planningResult.resortRecommendations,
        gearSuggestions: planningResult.gearSuggestions
      }
    };
    
    reply.status(200);
    return response;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    request.log.error({ error, processingTime }, 'Error processing ski planning request');
    
    reply.status(500);
    return {
      response: 'Internal server error occurred while processing your ski planning request',
      status: 'error'
    };
  }
}

/**
 * Register invocations route with Fastify
 */
export default async function invocationsRoute(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: 'POST',
    url: '/invocations',
    schema: {
      description: 'AgentCore primary agent interaction endpoint for ski planning',
      tags: ['AgentCore'],
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { 
            type: 'string',
            description: 'The user prompt for ski planning (e.g., "Plan a ski trip to Aspen for beginners")'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            status: { type: 'string', enum: ['success'] },
            metadata: {
              type: 'object',
              properties: {
                location: { type: 'string' },
                skillLevel: { type: 'string' },
                weatherInfo: { type: 'string' },
                resortRecommendations: { type: 'string' },
                gearSuggestions: { type: 'string' }
              }
            }
          },
          required: ['response', 'status']
        },
        400: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            status: { type: 'string', enum: ['error'] }
          },
          required: ['response', 'status']
        },
        500: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            status: { type: 'string', enum: ['error'] }
          },
          required: ['response', 'status']
        }
      }
    },
    handler: invocationsHandler
  });

  // Log route registration
  fastify.log.info('Registered route: POST /invocations - AgentCore primary agent interaction endpoint');
}

// Export route metadata for documentation or testing
export const routeInfo = {
  method: 'POST' as const,
  path: '/invocations',
  description: 'AgentCore primary agent interaction endpoint for ski planning'
};
