/**
 * @file Prompt templates for the Coder Agent.
 *
 * These templates structure user requests into prompts optimized for code generation.
 */

import { CodeGenerationRequest } from '../types';
import { FEW_SHOT_EXAMPLES } from './examples';

/**
 * Builds a user prompt for code generation.
 *
 * @param request - The code generation request.
 * @returns The formatted user prompt.
 */
export function buildCodeGenerationPrompt(request: CodeGenerationRequest): string {
  const { prompt, language = 'typescript', framework = 'react' } = request;

  const examplesSection = FEW_SHOT_EXAMPLES.map(
    (example) => `
Example Input: "${example.prompt}"
Example Output:
${example.code}
`
  ).join('\n');

  return `${examplesSection}

Now generate code based on this request:

Input: "${prompt}"

Requirements:
- Language: ${language}
- Framework: ${framework || 'none'}
- Follow the same quality standards as the examples
- Return ONLY the code, no markdown or explanations

Output:`;
}

/**
 * Builds a user prompt for test generation.
 *
 * @param code - The code to generate tests for.
 * @param language - The programming language.
 * @param targetCoverage - The target test coverage percentage.
 * @returns The formatted user prompt for test generation.
 */
export function buildTestGenerationPrompt(
  code: string,
  language: string,
  targetCoverage: number = 80
): string {
  return `Generate comprehensive unit tests for the following code:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Use Jest as the testing framework
- Achieve at least ${targetCoverage}% code coverage
- Test all exported functions/components
- Include edge cases and error scenarios
- Use descriptive test names
- Mock external dependencies
- Return ONLY the test code, no markdown or explanations

Output:`;
}
