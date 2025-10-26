/**
 * @file Defines the core types and interfaces for the Coder Agent.
 *
 * This file specifies the data structures for code generation requests,
 * responses, quality metrics, and other related entities.
 */

/**
 * Defines the request structure for generating code.
 * This is the primary input to the Coder Agent.
 */
export interface CodeGenerationRequest {
  /** The natural language prompt describing the code to generate. */
  prompt: string;

  /** The target programming language. */
  language?: "typescript" | "javascript" | "python";

  /** The target framework, if any. */
  framework?: "react" | "next" | "vue";

  /** Whether to include unit tests for the generated code. */
  includeTests?: boolean;

  /** The desired test coverage percentage. */
  testCoverage?: number;

  /** Whether to stream the response. */
  streaming?: boolean;
}

/**
 * Defines the structure of the generated code and its metadata.
 * This is the primary output of the Coder Agent.
 */
export interface GeneratedCode {
  /** The generated source code as a string. */
  code: string;

  /** The generated unit tests as a string. */
  tests: string;

  /** Quality metrics for the generated code. */
  quality: {
    /** Indicates if the generated code has TypeScript type errors. */
    hasTypeErrors: boolean;

    /** Indicates if the generated code has ESLint linting errors. */
    hasLintErrors: boolean;

    /** The actual test coverage percentage of the generated tests. */
    testCoverage: number;
  };

  /** Metadata about the generation process. */
  metadata: {
    /** The ISO 8601 timestamp of when the code was generated. */
    generatedAt: string;

    /** The AI model used for generation (e.g., "claude-3-sonnet"). */
    modelUsed: string;

    /** The total execution time in milliseconds. */
    executionTime: number;

    /** The number of tokens used in the generation process. */
    tokensUsed: number;
  };
}
