import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { greet } from '../index.ts';

describe('Ski Planner', (): void => {
  describe('greet function', (): void => {
    test('should return a greeting message with LangGraph', (): void => {
      const result = greet('Test User');
      assert.equal(result, 'Hello, Test User! Welcome to Ski Planner powered by LangGraph!');
    });

    test('should handle empty string', (): void => {
      const result = greet('');
      assert.equal(result, 'Hello, ! Welcome to Ski Planner powered by LangGraph!');
    });

    test('should include LangGraph in message', (): void => {
      const result = greet('Skier');
      assert(result.includes('LangGraph'));
      assert(result.includes('Ski Planner'));
    });
  });
});
