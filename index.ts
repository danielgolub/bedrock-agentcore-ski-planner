#!/usr/bin/env node

import 'dotenv/config';
import { planSkiTrip, getDetailedSkiPlan, type SkiPlanningResult } from './langgraph/ski-planner-workflow.ts';
import { logger, loggerUtils, createChildLogger } from './services/logger.ts';
import { startServer, stopServer } from './services/fastify.ts';

/**
 * Ski Planner - A TypeScript Node.js application with LangGraph
 */

export function greet(name: string): string {
  return `Hello, ${name}! Welcome to Ski Planner powered by LangGraph!`;
}

/**
 * Simple ski trip planning function
 */
export async function planTrip(location: string, skillLevel: string): Promise<string> {
  const skiLogger = createChildLogger({ module: 'ski-planner', location, skillLevel });
  
  try {
    return await loggerUtils.timeAsync(
      `Planning ski trip for ${skillLevel} skier in ${location}`,
      () => planSkiTrip(location, skillLevel),
      skiLogger
    );
  } catch (error) {
    skiLogger.error(error instanceof Error ? error : new Error(String(error)), 'Error planning ski trip');
    return 'Unable to generate ski plan. Please check your AWS Bedrock API key and region settings.';
  }
}

/**
 * Detailed ski trip planning function
 */
export async function getDetailedPlan(location: string, skillLevel: string): Promise<SkiPlanningResult | null> {
  const skiLogger = createChildLogger({ module: 'ski-planner', location, skillLevel });
  
  try {
    return await loggerUtils.timeAsync(
      `Getting detailed ski plan for ${skillLevel} skier in ${location}`,
      () => getDetailedSkiPlan(location, skillLevel),
      skiLogger
    );
  } catch (error) {
    skiLogger.error(error instanceof Error ? error : new Error(String(error)), 'Error getting detailed ski plan');
    return null;
  }
}

/**
 * Interactive CLI function for ski planning
 */
export async function runInteractiveSkiPlanner(): Promise<void> {
  logger.info(greet('Skier'));
  logger.info('\n🎿 LangGraph Ski Planner Demo 🎿\n');

  // Demo with sample data
  const sampleLocation = 'Colorado, USA';
  const sampleSkillLevel = 'intermediate';

  logger.info(`Planning a ski trip for ${sampleSkillLevel} skier in ${sampleLocation}...\n`);

  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    logger.warn('⚠️  AWS Bedrock API key not found. Set AWS_BEARER_TOKEN_BEDROCK environment variable to use LangGraph with Bedrock.');
    logger.info('📄 Create a .env file with your Bedrock API key:');
    logger.info('   AWS_BEARER_TOKEN_BEDROCK=your_bedrock_api_key_here');
    logger.info('   AWS_REGION=eu-central-1');
    logger.info('📚 See .env.example for complete template');
    logger.info('🔑 Get your API key from: AWS Console → Bedrock → API keys');
    return;
  }

  try {
    logger.info('🔄 Running LangGraph workflow...\n');
    
    // Get the detailed plan
    const detailedPlan = await getDetailedPlan(sampleLocation, sampleSkillLevel);
    
    if (detailedPlan) {
      logger.info('🌤️  WEATHER ANALYSIS:');
      logger.info(detailedPlan.weatherInfo);
      logger.info('\n🏔️  RESORT RECOMMENDATIONS:');
      logger.info(detailedPlan.resortRecommendations);
      logger.info('\n🎿 GEAR SUGGESTIONS:');
      logger.info(detailedPlan.gearSuggestions);
      logger.info('\n📋 FINAL PLAN:');
      logger.info(detailedPlan.finalPlan);
    } else {
      logger.error('❌ Failed to generate ski plan.');
    }
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), '❌ Error running ski planner');
  }
}

/**
 * Start the Fastify server
 */
export async function startWebServer(): Promise<void> {
  const port = parseInt(process.env.PORT || '3000', 10);
  
  logger.info('🚀 Starting Ski Planner Web Server...');
  
  try {
    const server = await startServer(port);
    
    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
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

export async function main(): Promise<void> {
  // Check if we should start the web server or run interactive mode
  const mode = process.env.MODE || process.argv[2];
  
  if (mode === 'server' || mode === 'web') {
    await startWebServer();
  } else {
    await runInteractiveSkiPlanner();
  }
}

// Run main if this file is executed directly
if (import.meta.url.endsWith(process.argv[1] || '')) {
  main().catch((error) => logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to run main'));
}
