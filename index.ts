#!/usr/bin/env node

import 'dotenv/config';
import { planSkiTrip, getDetailedSkiPlan, type SkiPlanningResult } from './src/langgraph/ski-planner-workflow.ts';

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
  try {
    const plan = await planSkiTrip(location, skillLevel);
    return plan;
  } catch (error) {
    console.error('Error planning ski trip:', error);
    return 'Unable to generate ski plan. Please check your AWS Bedrock API key and region settings.';
  }
}

/**
 * Detailed ski trip planning function
 */
export async function getDetailedPlan(location: string, skillLevel: string): Promise<SkiPlanningResult | null> {
  try {
    const detailedPlan = await getDetailedSkiPlan(location, skillLevel);
    return detailedPlan;
  } catch (error) {
    console.error('Error getting detailed ski plan:', error);
    return null;
  }
}

/**
 * Interactive CLI function for ski planning
 */
export async function runInteractiveSkiPlanner(): Promise<void> {
  console.log(greet('Skier'));
  console.log('\n🎿 LangGraph Ski Planner Demo 🎿\n');

  // Demo with sample data
  const sampleLocation = 'Colorado, USA';
  const sampleSkillLevel = 'intermediate';

  console.log(`Planning a ski trip for ${sampleSkillLevel} skier in ${sampleLocation}...\n`);

  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    console.log('⚠️  AWS Bedrock API key not found. Set AWS_BEARER_TOKEN_BEDROCK environment variable to use LangGraph with Bedrock.');
    console.log('📄 Create a .env file with your Bedrock API key:');
    console.log('   AWS_BEARER_TOKEN_BEDROCK=your_bedrock_api_key_here');
    console.log('   AWS_REGION=eu-central-1');
    console.log('📚 See .env.example for complete template');
    console.log('🔑 Get your API key from: AWS Console → Bedrock → API keys');
    return;
  }

  try {
    console.log('🔄 Running LangGraph workflow...\n');
    
    // Get the detailed plan
    const detailedPlan = await getDetailedPlan(sampleLocation, sampleSkillLevel);
    
    if (detailedPlan) {
      console.log('🌤️  WEATHER ANALYSIS:');
      console.log(detailedPlan.weatherInfo);
      console.log('\n🏔️  RESORT RECOMMENDATIONS:');
      console.log(detailedPlan.resortRecommendations);
      console.log('\n🎿 GEAR SUGGESTIONS:');
      console.log(detailedPlan.gearSuggestions);
      console.log('\n📋 FINAL PLAN:');
      console.log(detailedPlan.finalPlan);
    } else {
      console.log('❌ Failed to generate ski plan.');
    }
  } catch (error) {
    console.error('❌ Error running ski planner:', error);
  }
}

export async function main(): Promise<void> {
  await runInteractiveSkiPlanner();
}

// Run main if this file is executed directly
if (import.meta.url.endsWith(process.argv[1] || '')) {
  main().catch(console.error);
}
