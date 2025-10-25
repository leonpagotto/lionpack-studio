/**
 * Coder Mode - Generates code and tests
 *
 * Investigation Question: Can we generate code + tests and verify them?
 *
 * @file spike-5-prototype/coder-mode.ts
 */

export interface CoderModeInput {
  task: string;
  fileContext?: string;
  projectType?: 'typescript' | 'javascript' | 'python';
}

export interface GeneratedCode {
  filename: string;
  code: string;
  language: string;
}

export interface GeneratedTest {
  filename: string;
  code: string;
  language: string;
}

export interface CoderModeResult {
  success: boolean;
  code: GeneratedCode;
  test: GeneratedTest;
  reasoning: string;
  timestamp: string;
}

/**
 * Stub implementation of Coder Mode
 *
 * In full implementation, this would:
 * 1. Call Claude API to generate code from task description
 * 2. Call Claude API again to generate matching test
 * 3. Write both to filesystem
 * 4. Return structured result
 *
 * For spike purposes, this is a minimal stub that demonstrates the pattern
 */
export class CoderMode {
  private projectType: 'typescript' | 'javascript' | 'python';

  constructor(projectType: 'typescript' | 'javascript' | 'python' = 'typescript') {
    this.projectType = projectType;
  }

  /**
   * Execute Coder mode for a given task
   */
  async execute(input: CoderModeInput): Promise<CoderModeResult> {
    console.log(`🧑‍💻 Coder Mode: Processing task\n`);
    console.log(`Task: ${input.task}\n`);

    // Step 1: Generate code (stub)
    const code = this.generateCode(input.task);
    console.log(`✅ Generated code (${code.code.split('\n').length} lines)\n`);

    // Step 2: Generate test (stub)
    const test = this.generateTest(input.task, code.code);
    console.log(`✅ Generated test (${test.code.split('\n').length} lines)\n`);

    // Step 3: Prepare result
    return {
      success: true,
      code,
      test,
      reasoning: 'Code and test generated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate code stub
   *
   * In production: Call Claude API with prompt
   * In spike: Return example code based on task keywords
   */
  private generateCode(task: string): GeneratedCode {
    let code = '';
    let filename = 'generated.ts';

    // Very simple keyword-based code generation for spike
    if (task.toLowerCase().includes('sum')) {
      code = `
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}
`;
      filename = 'sum.ts';
    } else if (task.toLowerCase().includes('email')) {
      code = `
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}
`;
      filename = 'email-validator.ts';
    } else if (task.toLowerCase().includes('sort')) {
      code = `
export function bubbleSort(arr: number[]): number[] {
  const sorted = [...arr];
  const n = sorted.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (sorted[j] > sorted[j + 1]) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }

  return sorted;
}
`;
      filename = 'bubble-sort.ts';
    } else {
      // Default fallback
      code = `
export function process(input: string): string {
  // TODO: Implement logic for: ${task}
  return input;
}
`;
      filename = 'process.ts';
    }

    return {
      filename,
      code: code.trim(),
      language: 'typescript',
    };
  }

  /**
   * Generate test stub
   *
   * In production: Call Claude API with code
   * In spike: Generate test based on function name
   */
  private generateTest(task: string, code: string): GeneratedTest {
    let test = '';
    let filename = 'generated.test.ts';

    if (code.includes('sum')) {
      test = `
import { sum } from './sum';

describe('sum', () => {
  it('should sum an array of numbers', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('should handle empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(sum([-1, 1, 5])).toBe(5);
  });
});
`;
      filename = 'sum.test.ts';
    } else if (code.includes('validateEmail')) {
      test = `
import { validateEmail } from './email-validator';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });
});
`;
      filename = 'email-validator.test.ts';
    } else if (code.includes('bubbleSort')) {
      test = `
import { bubbleSort } from './bubble-sort';

describe('bubbleSort', () => {
  it('should sort array in ascending order', () => {
    expect(bubbleSort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
  });

  it('should handle already sorted array', () => {
    expect(bubbleSort([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle single element', () => {
    expect(bubbleSort([5])).toEqual([5]);
  });
});
`;
      filename = 'bubble-sort.test.ts';
    } else {
      test = `
describe('generated function', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
`;
    }

    return {
      filename,
      code: test.trim(),
      language: 'typescript',
    };
  }
}

/**
 * Tests for CoderMode
 */
export async function testCoderMode() {
  const coder = new CoderMode('typescript');

  const testCases = [
    {
      task: 'Create a function that sums an array',
      label: 'Sum function',
    },
    {
      task: 'Validate email address format',
      label: 'Email validator',
    },
    {
      task: 'Implement bubble sort algorithm',
      label: 'Bubble sort',
    },
  ];

  console.log('\n🧪 CoderMode Tests\n');
  let passed = 0;

  for (const test of testCases) {
    console.log(`\n📋 Test: ${test.label}`);
    try {
      const result = await coder.execute({ task: test.task });

      if (result.success && result.code.code && result.test.code) {
        console.log(`✅ PASS - Generated code and test\n`);
        passed++;
      } else {
        console.log(`❌ FAIL - Generation failed\n`);
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error}\n`);
    }
  }

  console.log(`\nResult: ${passed}/${testCases.length} tests passed\n`);
  return passed === testCases.length;
}
