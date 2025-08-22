#!/usr/bin/env node

import 'dotenv/config';
import { planSkiTrip, getDetailedSkiPlan, type SkiPlanningResult } from './langgraph/ski-planner-workflow.ts';
import { logger, loggerUtils, createChildLogger } from './services/logger.ts';

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
    skiLogger.error('Error planning ski trip:', error instanceof Error ? error.message : error);
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
    skiLogger.error('Error getting detailed ski plan:', error instanceof Error ? error.message : error);
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
    logger.error('❌ Error running ski planner:', error instanceof Error ? error.message : error);
  }
}

export async function main(): Promise<void> {
  await runInteractiveSkiPlanner();
}

// Run main if this file is executed directly
if (import.meta.url.endsWith(process.argv[1] || '')) {
  main().catch((error) => logger.error('Failed to run main:', error instanceof Error ? error.message : error));
}
