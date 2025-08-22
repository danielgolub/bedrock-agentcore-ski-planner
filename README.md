# 🎿 Ski Planner

**Work in Progress** - AI-powered ski trip planning using multi-agent workflows.

## Tech Stack

- **Node.js 24** - Native TypeScript support (`--experimental-strip-types`)
- **TypeScript** - Type-safe development
- **LangGraph** - Multi-agent workflow orchestration
- **AWS Bedrock** - LLM inference (Amazon Nova Lite / Claude Sonnet 4)
- **ESLint 9** - Code linting with flat config
- **Node.js Test Runner** - Native testing framework

## Development

```bash
npm install
npm test    # Fast tests with mocked LLM calls
npm start   # Run the application
```

## Architecture

Multi-agent system with specialized agents:
- **Weather Agent** - Analyzes conditions
- **Resort Agent** - Recommends ski resorts  
- **Gear Agent** - Suggests equipment
- **Planning Agent** - Coordinates final itinerary

---

*This is an experimental project exploring LangGraph multi-agent workflows with AWS Bedrock.*