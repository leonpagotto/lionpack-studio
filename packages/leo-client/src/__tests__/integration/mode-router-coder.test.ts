/**
 * @file Integration tests for Mode Router → Coder Agent workflow.
 *
 * Tests the complete flow from intent detection to code generation.
 */

import { detectMode } from '../../mode-router';
import type { ModeDetectionResponse } from '../../mode-router';
import { generateCode, GenerationResult } from '../../coder/generator';

// Mock the LLM client
jest.mock('../../lib/llm-client');

describe('Mode Router → Coder Agent Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Generate Intent Flow', () => {
    it('should detect generate intent and trigger code generation', async () => {
      const input = 'Create a React Button component with primary and secondary variants';

      // Step 1: Detect intent with Mode Router
      const modeResult: ModeDetectionResponse = detectMode(input);

      // Verify intent detection (Note: "Create" and "component" are keywords)
      expect(modeResult.intent).toBe('generate');
      expect(modeResult.confidence).toBeGreaterThan(0.5); // Realistic threshold
      expect(modeResult.reasoning).toContain('create');

      // Step 2: If intent is "generate", call Coder Agent
      if (modeResult.intent === 'generate') {
        // Mock LLM response (must match LLMClient response structure)
        const mockLLMClient = require('../../lib/llm-client').LLMClient;
        mockLLMClient.prototype.complete = jest.fn().mockResolvedValue({
          content: `interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', children }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded font-medium';
  const variantStyles = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button className={\`\${baseStyles} \${variantStyles}\`}>
      {children}
    </button>
  );
};`,
          tokensUsed: 250,
          model: 'claude-3-5-sonnet-20241022',
        });        const result: GenerationResult = await generateCode(
          {
            prompt: input,
            language: 'typescript',
            framework: 'react',
            includeTests: false,
          },
          'test-api-key'
        );

        // Verify code generation
        expect(result.code).toBeDefined();
        expect(result.code).toContain('Button');
        expect(result.code).toContain('ButtonProps');
        expect(result.tokensUsed).toBe(250);
        expect(result.executionTime).toBeGreaterThanOrEqual(0); // Can be 0 in fast tests
        expect(result.model).toBe('claude-3-5-sonnet-20241022');
      }
    });    it('should handle different generate prompts', async () => {
      const prompts = [
        'Build a login form component',
        'Generate a utility function for email validation',
        'Create a data fetching hook',
      ];

      for (const prompt of prompts) {
        const modeResult = detectMode(prompt);
        expect(modeResult.intent).toBe('generate');
      }
    });
  });

  describe('Non-Generate Intent Flow', () => {
    it('should not trigger code generation for debug intents', async () => {
      const input = 'Fix the error in my login component';

      const modeResult = detectMode(input);

      expect(modeResult.intent).toBe('debug');
      expect(modeResult.intent).not.toBe('generate');
      // Would route to debug agent (not yet implemented)
    });

    it('should not trigger code generation for test intents', async () => {
      const input = 'Write unit tests for the user service';

      const modeResult = detectMode(input);

      expect(modeResult.intent).toBe('test');
      expect(modeResult.intent).not.toBe('generate');
      // Would route to test agent (not yet implemented)
    });

    it('should not trigger code generation for docs intents', async () => {
      const input = 'Update the README with installation instructions';

      const modeResult = detectMode(input);

      // Mode Router uses "document" not "docs"
      expect(modeResult.intent).toBe('document');
      expect(modeResult.intent).not.toBe('generate');
      // Would route to document agent (not yet implemented)
    });
  });

  describe('Edge Cases', () => {
    it('should handle ambiguous prompts', async () => {
      const input = 'help me with the button';

      const modeResult = detectMode(input);

      // Should still detect an intent
      expect(modeResult.intent).toBeDefined();
      // Mode Router may classify as "unknown" for very ambiguous input
      expect(['generate', 'unknown']).toContain(modeResult.intent);
    });

    it('should handle empty input gracefully', async () => {
      const input = '';

      const modeResult = detectMode(input);

      expect(modeResult.intent).toBe('unknown');
      expect(modeResult.confidence).toBe(0);
    });
  });

  describe('Complete Workflow Validation', () => {
    it('should validate complete flow from input to code output', async () => {
      const input = 'Create a React card component with image and title';

      // Mock LLM for code generation (must match LLMClient response structure)
      const mockLLMClient = require('../../lib/llm-client').LLMClient;
      mockLLMClient.prototype.complete = jest.fn().mockResolvedValue({
        content: `interface CardProps {
  image: string;
  title: string;
}

export const Card = ({ image, title }: CardProps) => {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
    </div>
  );
};`,
        tokensUsed: 200,
        model: 'claude-3-5-sonnet-20241022',
      });

      // Step 1: Mode detection
      const modeResult = detectMode(input);
      expect(modeResult.intent).toBe('generate');

      // Step 2: Code generation
      const codeResult = await generateCode(
        {
          prompt: input,
          language: 'typescript',
          framework: 'react',
          includeTests: false,
        },
        'test-api-key'
      );

      // Step 3: Validate complete output
      expect(codeResult.code).toBeDefined();
      expect(codeResult.code).toContain('Card');
      expect(codeResult.code).toContain('CardProps');
      expect(codeResult.code).toContain('image');
      expect(codeResult.code).toContain('title');
      expect(codeResult.tokensUsed).toBe(200);
      expect(codeResult.executionTime).toBeGreaterThanOrEqual(0); // Can be 0 in fast tests
      expect(codeResult.model).toBe('claude-3-5-sonnet-20241022');
    });
  });
});
