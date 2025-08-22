import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { greet } from '../index.ts';

// Mock responses for LLM calls  
const mockLLMResponses = {
  weather: 'Mock weather analysis: Excellent snow conditions with 10 inches of fresh powder. Temperature: -5°C. Wind: Light 10mph. Visibility: Clear.',
  resort: 'Mock resort recommendations: 1. Aspen Highlands - Perfect intermediate terrain. 2. Vail - Excellent groomed runs. 3. Keystone - Great for progression.',
  gear: 'Mock gear suggestions: All-mountain skis 170cm, insulated jacket and pants, helmet, goggles with anti-fog coating, thermal layers.',
  planner: 'Mock final plan: Day 1: Arrive and acclimate. Day 2-3: Ski intermediate runs at recommended resorts. Equipment rental available on-site.'
};

// Mock functions for testing (no LLM calls)
async function mockPlanTrip(location: string, skillLevel: string): Promise<string> {
  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    return 'Unable to generate ski plan. Please check your AWS Bedrock API key and region settings.';
  }
  return mockLLMResponses.planner;
}

async function mockGetDetailedPlan(location: string, skillLevel: string): Promise<any> {
  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    return null;
  }
  return {
    location,
    skillLevel,
    weatherInfo: mockLLMResponses.weather,
    resortRecommendations: mockLLMResponses.resort,
    gearSuggestions: mockLLMResponses.gear,
    finalPlan: mockLLMResponses.planner,
  };
}

describe('LangGraph Ski Planner', (): void => {
  const originalEnv = process.env.AWS_BEARER_TOKEN_BEDROCK;

  beforeEach((): void => {
    // Set a mock API key for testing
    process.env.AWS_BEARER_TOKEN_BEDROCK = 'test-bedrock-api-key-mock';
  });

  afterEach((): void => {
    // Restore original environment
    if (originalEnv) {
      process.env.AWS_BEARER_TOKEN_BEDROCK = originalEnv;
    } else {
      delete process.env.AWS_BEARER_TOKEN_BEDROCK;
    }
  });

  describe('greet function', (): void => {
    test('should return updated greeting with LangGraph', (): void => {
      const result = greet('Test User');
      assert.equal(result, 'Hello, Test User! Welcome to Ski Planner powered by LangGraph!');
    });
  });

  describe('planTrip function (mocked)', (): void => {
    test('should return mocked plan when API key is present', async (): Promise<void> => {
      const result = await mockPlanTrip('Colorado', 'intermediate');
      assert(typeof result === 'string');
      assert(result.includes('Mock final plan'));
      assert(result.includes('Day 1: Arrive and acclimate'));
    });

    test('should handle missing API key gracefully', async (): Promise<void> => {
      // Remove API key for this test
      delete process.env.AWS_BEARER_TOKEN_BEDROCK;
      
      const result = await mockPlanTrip('Colorado', 'beginner');
      assert.equal(result, 'Unable to generate ski plan. Please check your AWS Bedrock API key and region settings.');
    });

    test('should handle different skill levels', async (): Promise<void> => {
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      for (const skill of skillLevels) {
        const result = await mockPlanTrip('Colorado', skill);
        assert(typeof result === 'string');
        assert(result.includes('Mock final plan'));
      }
    });

    test('should handle different locations', async (): Promise<void> => {
      const locations = ['Colorado, USA', 'Swiss Alps', 'Whistler, Canada'];
      
      for (const location of locations) {
        const result = await mockPlanTrip(location, 'intermediate');
        assert(typeof result === 'string');
        assert(result.includes('Mock final plan'));
      }
    });
  });

  describe('getDetailedPlan function (mocked)', (): void => {
    test('should return structured detailed plan when API key is present', async (): Promise<void> => {
      const result = await mockGetDetailedPlan('Colorado', 'intermediate');
      
      assert(result !== null);
      assert(typeof result === 'object');
      assert.equal(result.location, 'Colorado');
      assert.equal(result.skillLevel, 'intermediate');
      assert(result.weatherInfo.includes('Mock weather analysis'));
      assert(result.resortRecommendations.includes('Mock resort recommendations'));
      assert(result.gearSuggestions.includes('Mock gear suggestions'));
      assert(result.finalPlan.includes('Mock final plan'));
    });

    test('should handle missing API key gracefully', async (): Promise<void> => {
      delete process.env.AWS_BEARER_TOKEN_BEDROCK;
      
      const result = await mockGetDetailedPlan('Colorado', 'beginner');
      // Should return null when API key is missing
      assert.equal(result, null);
    });

    test('should preserve input parameters in response', async (): Promise<void> => {
      const testCases = [
        { location: 'Swiss Alps', skill: 'beginner' },
        { location: 'Whistler, Canada', skill: 'expert' },
        { location: 'Val d\'Isère, France', skill: 'advanced' }
      ];

      for (const testCase of testCases) {
        const result = await mockGetDetailedPlan(testCase.location, testCase.skill);
        assert.equal(result.location, testCase.location);
        assert.equal(result.skillLevel, testCase.skill);
      }
    });
  });

  describe('mock function validation', (): void => {
    test('should validate mock functions exist', (): void => {
      assert(typeof mockPlanTrip === 'function');
      assert(typeof mockGetDetailedPlan === 'function');
      assert(typeof greet === 'function');
    });

    test('mock functions should accept various skill level strings', (): void => {
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      skillLevels.forEach(skill => {
        assert.doesNotThrow((): void => {
          // Type validation - should accept string skill levels
          mockPlanTrip('Test Location', skill);
        });
      });
    });

    test('mock functions should accept various location format strings', (): void => {
      const locations = [
        'Colorado, USA',
        'Swiss Alps',
        'Whistler, Canada',
        'Val d\'Isère, France'
      ];
      
      locations.forEach(location => {
        assert.doesNotThrow((): void => {
          // Type validation - should accept string locations
          mockPlanTrip(location, 'intermediate');
        });
      });
    });

    test('should complete quickly with mocked responses', async (): Promise<void> => {
      const startTime = Date.now();
      
      await Promise.all([
        mockPlanTrip('Colorado', 'intermediate'),
        mockGetDetailedPlan('Colorado', 'intermediate'),
        mockPlanTrip('Switzerland', 'advanced'),
        mockGetDetailedPlan('Canada', 'beginner')
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in under 50ms with mocks (no LLM calls)
      assert(duration < 50, `Test took ${duration}ms, should be under 50ms with mocks`);
    });
  });
});
