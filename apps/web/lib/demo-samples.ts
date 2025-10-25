/**
 * 🦁 LionPack Studio - Demo Samples for Mode Router
 * Sample prompts pre-categorized by intent for stakeholder presentation
 */

export const demoSamples = [
  // GENERATE
  {
    intent: "generate",
    label: "Generate a React component",
    prompt: "Write a React component for a user profile card with name, avatar, and bio fields"
  },
  {
    intent: "generate",
    label: "Generate TypeScript types",
    prompt: "Create TypeScript interfaces for a user authentication response with access token and refresh token"
  },
  {
    intent: "generate",
    label: "Generate API documentation",
    prompt: "Write API documentation for a POST /api/users endpoint that accepts email, username, and password"
  },

  // DEBUG
  {
    intent: "debug",
    label: "Fix a broken button",
    prompt: "The login button on my form is not responding when clicked. What could be wrong?"
  },
  {
    intent: "debug",
    label: "Fix database error",
    prompt: "I'm getting a 'constraint violation' error when trying to save a user record to PostgreSQL"
  },
  {
    intent: "debug",
    label: "Fix undefined error",
    prompt: "My component is crashing with 'Cannot read property of undefined' - help me debug this"
  },

  // REFACTOR
  {
    intent: "refactor",
    label: "Refactor for performance",
    prompt: "This function runs in 2 seconds but needs to be under 100ms. Can you refactor it?"
  },
  {
    intent: "refactor",
    label: "Simplify complex code",
    prompt: "This component has 300 lines and 5 nested if statements. Can you clean it up?"
  },
  {
    intent: "refactor",
    label: "Improve readability",
    prompt: "My variable names are confusing (x, y, tmp). Help me refactor with better names"
  },

  // DOCUMENT
  {
    intent: "document",
    label: "Document API endpoints",
    prompt: "Create Swagger documentation for my REST API with 10 endpoints"
  },
  {
    intent: "document",
    label: "Add code comments",
    prompt: "Add JSDoc comments to this authentication module so developers understand each function"
  },
  {
    intent: "document",
    label: "Write user guide",
    prompt: "Write a getting started guide for developers who want to use our SDK"
  },

  // OPTIMIZE
  {
    intent: "optimize",
    label: "Optimize database queries",
    prompt: "This search query is slow (300ms). How can I optimize it with indexes and caching?"
  },
  {
    intent: "optimize",
    label: "Optimize bundle size",
    prompt: "My frontend bundle is 5MB. What's the best way to reduce it?"
  },
  {
    intent: "optimize",
    label: "Optimize memory usage",
    prompt: "My application is using too much memory when processing large files"
  },

  // TEST
  {
    intent: "test",
    label: "Write unit tests",
    prompt: "Write unit tests for a payment processing function that handles credit cards"
  },
  {
    intent: "test",
    label: "Write E2E tests",
    prompt: "Create E2E tests for the entire checkout flow from product selection to order confirmation"
  },
  {
    intent: "test",
    label: "Improve test coverage",
    prompt: "My test coverage is 60% and needs to be 80%. What edge cases am I missing?"
  }
];

export const getRandomSample = () => {
  return demoSamples[Math.floor(Math.random() * demoSamples.length)];
};

export const getSamplesByIntent = (intent: string) => {
  return demoSamples.filter(sample => sample.intent === intent);
};
