/**
 * Verifier - Executes tests and extracts coverage
 *
 * Investigation Question: Can we run generated tests and verify quality?
 *
 * @file spike-5-prototype/verifier.ts
 */

export interface TestResult {
  testFile: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  passed_check: boolean; // All tests passed?
  coverage_check: boolean; // Coverage > 80%?
}

export interface VerificationResult {
  success: boolean;
  codeFile: string;
  testFile: string;
  testResult: TestResult;
  errors?: string[];
  reasoning: string;
  timestamp: string;
}

/**
 * Stub implementation of Test Verifier
 *
 * In full implementation, this would:
 * 1. Write code and test files to temp directory
 * 2. Run Jest or Vitest on the test file
 * 3. Parse coverage output (lcov format)
 * 4. Extract pass/fail and coverage metrics
 * 5. Return structured result
 *
 * For spike purposes, this simulates verification results
 */
export class Verifier {
  /**
   * Verify generated code and tests
   *
   * @param codeFile - Generated code file
   * @param testFile - Generated test file
   * @param codeContent - Actual code content
   * @param testContent - Actual test content
   */
  async verify(
    codeFile: string,
    testFile: string,
    codeContent: string,
    testContent: string
  ): Promise<VerificationResult> {
    console.log(`🔍 Verifier: Testing generated code\n`);
    console.log(`Code: ${codeFile}`);
    console.log(`Test: ${testFile}\n`);

    const errors: string[] = [];

    // Step 1: Validate syntax
    const syntaxValid = this.validateSyntax(codeContent, testContent);
    if (!syntaxValid) {
      errors.push('Syntax validation failed');
    }
    console.log(`${syntaxValid ? '✅' : '❌'} Syntax validation\n`);

    // Step 2: Simulate test execution
    const testResult = this.executeTests(codeFile, testFile, codeContent, testContent);
    console.log(`${testResult.passed === testResult.total ? '✅' : '⚠️ '} Tests: ${testResult.passed}/${testResult.total} passed`);
    console.log(`Coverage: ${testResult.coverage.lines}% lines, ${testResult.coverage.functions}% functions\n`);

    // Step 3: Verify quality gates
    const passedTests = testResult.passed === testResult.total;
    const goodCoverage = testResult.coverage.lines >= 80;

    if (!passedTests) {
      errors.push(`${testResult.failed} test(s) failed`);
    }
    if (!goodCoverage) {
      errors.push(`Coverage below 80%: ${testResult.coverage.lines}%`);
    }

    const success = passedTests && goodCoverage && syntaxValid;

    return {
      success,
      codeFile,
      testFile,
      testResult,
      errors: errors.length > 0 ? errors : undefined,
      reasoning: success
        ? 'All tests passed and coverage meets threshold'
        : `Verification failed: ${errors.join(', ')}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate TypeScript syntax (stub)
   *
   * In production: Run tsc --noEmit
   */
  private validateSyntax(codeContent: string, testContent: string): boolean {
    // Stub: Check for basic syntax issues
    const hasBasicStructure =
      codeContent.includes('function') || codeContent.includes('export') ||
      codeContent.includes('class');

    const hasTestStructure =
      testContent.includes('describe') || testContent.includes('test') ||
      testContent.includes('it(');

    return hasBasicStructure && hasTestStructure;
  }

  /**
   * Execute tests and measure coverage (stub)
   *
   * In production: Run jest/vitest and parse lcov output
   */
  private executeTests(
    codeFile: string,
    testFile: string,
    codeContent: string,
    testContent: string
  ): TestResult {
    // Stub: Simulate test results based on content quality

    // Count test cases (count "it(" or "test(")
    const testCases = (testContent.match(/\b(it|test)\(/g) || []).length || 1;

    // Estimate pass rate based on content structure
    const hasErrorHandling = codeContent.includes('try') || codeContent.includes('throw');
    const hasMultipleTests = testCases >= 3;
    const isWellFormatted = codeContent.split('\n').length > 3;

    // Simulate: Most tests pass if content looks reasonable
    const estimatedPass = hasErrorHandling && hasMultipleTests ? testCases : testCases - 1;
    const estimatedFail = testCases - estimatedPass;

    // Estimate coverage based on function count
    const functionCount = (codeContent.match(/\bfunction\b/g) || []).length;
    const hasTests = testContent.includes('expect');

    let estimatedCoverage = 60;
    if (hasTests && functionCount >= 1) estimatedCoverage = 75;
    if (hasErrorHandling && hasMultipleTests && isWellFormatted) estimatedCoverage = 85;
    if (estimatedPass === testCases) estimatedCoverage = Math.min(95, estimatedCoverage + 10);

    return {
      testFile,
      passed: estimatedPass,
      failed: estimatedFail,
      skipped: 0,
      total: testCases,
      coverage: {
        lines: estimatedCoverage,
        branches: estimatedCoverage - 5 > 0 ? estimatedCoverage - 5 : 50,
        functions: estimatedCoverage,
        statements: estimatedCoverage,
      },
      passed_check: estimatedPass === testCases,
      coverage_check: estimatedCoverage >= 80,
    };
  }
}

/**
 * Tests for Verifier
 */
export async function testVerifier() {
  const verifier = new Verifier();

  const testCases = [
    {
      label: 'Valid function with tests',
      code: `
export function add(a: number, b: number): number {
  return a + b;
}
`,
      test: `
import { add } from './add';
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
  });
});
`,
      shouldPass: true,
    },
    {
      label: 'Minimal function with basic test',
      code: `
export function greet(name: string): string {
  return \`Hello, \${name}\`;
}
`,
      test: `
describe('greet', () => {
  it('should greet', () => {
    expect(true).toBe(true);
  });
});
`,
      shouldPass: false, // Coverage likely too low
    },
  ];

  console.log('\n🧪 Verifier Tests\n');
  let passed = 0;

  for (const test of testCases) {
    console.log(`\n📋 Test: ${test.label}`);
    try {
      const result = await verifier.verify(
        'generated.ts',
        'generated.test.ts',
        test.code,
        test.test
      );

      const expectedSuccess = test.shouldPass;
      const actualSuccess = result.success;

      if (expectedSuccess === actualSuccess) {
        console.log(
          `✅ PASS - Verification ${actualSuccess ? 'succeeded' : 'failed'} as expected`
        );
        passed++;
      } else {
        console.log(
          `❌ FAIL - Expected ${expectedSuccess ? 'success' : 'failure'}, got ${actualSuccess ? 'success' : 'failure'}`
        );
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error}`);
    }
  }

  console.log(`\nResult: ${passed}/${testCases.length} tests passed\n`);
  return passed === testCases.length;
}
