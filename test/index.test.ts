import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { greet } from '../index.ts';

describe('Ski Planner', () => {
  describe('greet function', () => {
    test('should return a greeting message', () => {
      const result = greet('Test User');
      assert.equal(result, 'Hello, Test User! Welcome to Ski Planner!');
    });

    test('should handle empty string', () => {
      const result = greet('');
      assert.equal(result, 'Hello, ! Welcome to Ski Planner!');
    });
  });
});
