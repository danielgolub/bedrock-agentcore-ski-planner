#!/usr/bin/env node

/**
 * Ski Planner - A TypeScript Node.js application
 */

export function greet(name: string): string {
  return `Hello, ${name}! Welcome to Ski Planner!`;
}

export function main(): void {
  console.log(greet('Skier'));
}

// Run main if this file is executed directly
main();
