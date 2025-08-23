import { StateGraph, Annotation } from '@langchain/langgraph';
import { ChatBedrockConverse } from '@langchain/aws';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { BaseMessage } from '@langchain/core/messages';
import { loggerUtils, createChildLogger } from '../services/logger.ts';

// Define the state structure for our ski planning workflow
const SkiPlannerState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  location: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  skillLevel: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  weatherInfo: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  resortRecommendations: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  gearSuggestions: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  finalPlan: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
});

/**
 * Weather Analysis Agent
 * Analyzes weather conditions for ski planning
 */
async function weatherAgent(state: typeof SkiPlannerState): Promise<Partial<typeof SkiPlannerState>> {
  const workflowLogger = createChildLogger({ module: 'langgraph', workflow: 'ski-planner', step: 'weather-analysis' });
  
  return await loggerUtils.timeAsync(
    'Weather analysis',
    async (): Promise<Partial<typeof SkiPlannerState>> => {
      const llm = new ChatBedrockConverse({
        model: process.env.AWS_BEDROCK_MODEL || 'arn:aws:bedrock:eu-central-1:287012933369:inference-profile/eu.amazon.nova-lite-v1:0',
        region: process.env.AWS_REGION || 'eu-central-1',
        temperature: 0.1,
      });

      const systemMessage = new SystemMessage(
        `You are a weather analysis expert for ski planning. 
        Analyze weather conditions and provide recommendations for skiing based on the location.
        Focus on snow conditions, temperature, wind, and visibility.
        Keep your response concise and actionable.`
      );

      const humanMessage = new HumanMessage(
        `Analyze the weather for skiing at: ${state.State.location}. 
        Consider the skill level: ${state.State.skillLevel}.
        Provide weather insights and safety recommendations.`
      );

      workflowLogger.debug('Invoking weather analysis LLM');
      const response = await llm.invoke([systemMessage, humanMessage]);
      
      return {
        weatherInfo: response.content as string,
        messages: [humanMessage, response],
      } as Partial<typeof SkiPlannerState>;
    },
    workflowLogger
  );
}

/**
 * Resort Recommendation Agent
 * Recommends ski resorts based on preferences and conditions
 */
async function resortAgent(state: typeof SkiPlannerState): Promise<Partial<typeof SkiPlannerState>> {
  const workflowLogger = createChildLogger({ module: 'langgraph', workflow: 'ski-planner', step: 'resort-recommendations' });
  
  return await loggerUtils.timeAsync(
    'Resort recommendations',
    async (): Promise<Partial<typeof SkiPlannerState>> => {
      const llm = new ChatBedrockConverse({
        model: process.env.AWS_BEDROCK_MODEL || 'arn:aws:bedrock:eu-central-1:287012933369:inference-profile/eu.amazon.nova-lite-v1:0',
        region: process.env.AWS_REGION || 'eu-central-1',
        temperature: 0.3,
      });

      const systemMessage = new SystemMessage(
        `You are a ski resort expert. Recommend the best ski resorts based on location, 
        skill level, and weather conditions. Consider factors like terrain variety, 
        lift systems, amenities, and value for money. Provide 2-3 specific recommendations.`
      );

      const humanMessage = new HumanMessage(
        `Recommend ski resorts for:
        Location: ${state.State.location}
        Skill Level: ${state.State.skillLevel}
        Weather Info: ${state.State.weatherInfo}
        
        Provide specific resort names with brief explanations.`
      );

      workflowLogger.debug('Invoking resort recommendation LLM');
      const response = await llm.invoke([systemMessage, humanMessage]);
      
      return {
        resortRecommendations: response.content as string,
        messages: [humanMessage, response],
      } as Partial<typeof SkiPlannerState>;
    },
    workflowLogger
  );
}

/**
 * Gear Recommendation Agent
 * Suggests appropriate ski gear based on conditions and skill level
 */
async function gearAgent(state: typeof SkiPlannerState): Promise<Partial<typeof SkiPlannerState>> {
  const workflowLogger = createChildLogger({ module: 'langgraph', workflow: 'ski-planner', step: 'gear-suggestions' });
  
  return await loggerUtils.timeAsync(
    'Gear recommendations',
    async (): Promise<Partial<typeof SkiPlannerState>> => {
      const llm = new ChatBedrockConverse({
        model: process.env.AWS_BEDROCK_MODEL || 'arn:aws:bedrock:eu-central-1:287012933369:inference-profile/eu.amazon.nova-lite-v1:0',
        region: process.env.AWS_REGION || 'eu-central-1',
        temperature: 0.2,
      });

      const systemMessage = new SystemMessage(
        `You are a ski gear expert. Recommend appropriate ski equipment and clothing 
        based on weather conditions, skill level, and resort type. Include safety gear,
        skis/snowboard, boots, clothing layers, and accessories.`
      );

      const humanMessage = new HumanMessage(
        `Recommend ski gear for:
        Skill Level: ${state.State.skillLevel}
        Weather: ${state.State.weatherInfo}
        Resorts: ${state.State.resortRecommendations}
        
        Provide a categorized gear list with explanations.`
      );

      workflowLogger.debug('Invoking gear recommendation LLM');
      const response = await llm.invoke([systemMessage, humanMessage]);
      
      return {
        gearSuggestions: response.content as string,
        messages: [humanMessage, response],
      } as Partial<typeof SkiPlannerState>;
    },
    workflowLogger
  );
}

/**
 * Planning Coordinator Agent
 * Synthesizes all information into a comprehensive ski plan
 */
async function plannerAgent(state: typeof SkiPlannerState): Promise<Partial<typeof SkiPlannerState>> {
  const workflowLogger = createChildLogger({ module: 'langgraph', workflow: 'ski-planner', step: 'final-planning' });
  
  return await loggerUtils.timeAsync(
    'Final plan synthesis',
    async (): Promise<Partial<typeof SkiPlannerState>> => {
      const llm = new ChatBedrockConverse({
        model: process.env.AWS_BEDROCK_MODEL || 'arn:aws:bedrock:eu-central-1:287012933369:inference-profile/eu.amazon.nova-lite-v1:0',
        region: process.env.AWS_REGION || 'eu-central-1',
        temperature: 0.1,
      });

      const systemMessage = new SystemMessage(
        `You are a ski trip planning coordinator. Create a comprehensive, actionable 
        ski plan that synthesizes weather analysis, resort recommendations, and gear 
        suggestions into a cohesive itinerary. Include timing, priorities, and practical tips.`
      );

      const humanMessage = new HumanMessage(
        `Create a comprehensive ski plan using:
        
        Location: ${state.State.location}
        Skill Level: ${state.State.skillLevel}
        
        Weather Analysis: ${state.State.weatherInfo}
        
        Resort Recommendations: ${state.State.resortRecommendations}
        
        Gear Suggestions: ${state.State.gearSuggestions}
        
        Provide a structured plan with priorities and actionable steps.`
      );

      workflowLogger.debug('Invoking final planning LLM');
      const response = await llm.invoke([systemMessage, humanMessage]);
      
      return {
        finalPlan: response.content as string,
        messages: [humanMessage, response],
      } as Partial<typeof SkiPlannerState>;
    },
    workflowLogger
  );
}

/**
 * Creates the ski planning workflow graph
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createSkiPlannerWorkflow() {
  const workflow = new StateGraph(SkiPlannerState)
    .addNode('weather_agent', weatherAgent)
    .addNode('resort_agent', resortAgent)
    .addNode('gear_agent', gearAgent)
    .addNode('planner_agent', plannerAgent)
    .addEdge('__start__', 'weather_agent')
    .addEdge('weather_agent', 'resort_agent')
    .addEdge('resort_agent', 'gear_agent')
    .addEdge('gear_agent', 'planner_agent')
    .addEdge('planner_agent', '__end__');

  return workflow;
}

/**
 * High-level function to plan a ski trip
 */
export async function planSkiTrip(location: string, skillLevel: string): Promise<string> {
  const workflow = createSkiPlannerWorkflow();
  const app = workflow.compile();

  const result = await app.invoke({
    location,
    skillLevel,
  });

  return result.finalPlan;
}

/**
 * Interface for getting detailed planning results
 */
export interface SkiPlanningResult {
  location: string;
  skillLevel: string;
  weatherInfo: string;
  resortRecommendations: string;
  gearSuggestions: string;
  finalPlan: string;
}

/**
 * Get detailed ski planning results
 */
export async function getDetailedSkiPlan(location: string, skillLevel: string): Promise<SkiPlanningResult> {
  const workflow = createSkiPlannerWorkflow();
  const app = workflow.compile();

  const result = await app.invoke({
    location,
    skillLevel,
  });

  return {
    location: result.location,
    skillLevel: result.skillLevel,
    weatherInfo: result.weatherInfo,
    resortRecommendations: result.resortRecommendations,
    gearSuggestions: result.gearSuggestions,
    finalPlan: result.finalPlan,
  };
}
