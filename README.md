# Ski Planner

A Node.js 24 native TypeScript project with native test runner and ESLint.

## Features

- **Native TypeScript**: Uses Node.js 24's `--experimental-strip-types` flag - no compilation step needed
- **ESLint**: Configured with TypeScript rules for code quality
- **Native Testing**: Uses Node.js built-in test runner with TypeScript support
- **Modern Setup**: ES modules, strict TypeScript configuration

## Prerequisites

- Node.js 24 or higher

## Installation

```bash
npm install
```

## Usage

### Run the application
```bash
npm start
```

### Development with watch mode
```bash
npm run dev
```

### Run tests
```bash
# Using Node.js native test runner
npm test

# Native test runner with watch mode
npm run test:watch
```

### Linting
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix
```

## Project Structure

```
ski-planner/
├── index.ts              # Main application entry point
├── test/                 # Test directory
│   └── index.test.ts     # Example test file
├── package.json          # Node.js configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint v9 flat configuration
└── .gitignore            # Git ignore rules
```

## Development Notes

- TypeScript files are executed directly using Node.js 24's native TypeScript support
- No build/compilation step required
- Tests use Node.js built-in test runner with native TypeScript support
- ESLint is configured for TypeScript with strict rules
