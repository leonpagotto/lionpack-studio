/**
 * @file Tests for the test generator module.
 */

import { estimateTestCoverage } from '../test-generator';

describe('Test Generator', () => {
  describe('estimateTestCoverage', () => {
    it('should estimate coverage for functions', () => {
      const sourceCode = `
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
`;

      const testCode = `
describe('Math functions', () => {
  it('should add numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should multiply numbers', () => {
    expect(multiply(2, 3)).toBe(6);
  });
});
`;

      const coverage = estimateTestCoverage(sourceCode, testCode);

      expect(coverage).toBe(100); // Both functions are tested
    });

    it('should return 0 for code with no testable items', () => {
      const sourceCode = `const PI = 3.14159;`;
      const testCode = `// No tests`;

      const coverage = estimateTestCoverage(sourceCode, testCode);

      expect(coverage).toBe(0);
    });

    it('should calculate partial coverage', () => {
      const sourceCode = `
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
`;

      const testCode = `
describe('Math functions', () => {
  it('should add numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
`;

      const coverage = estimateTestCoverage(sourceCode, testCode);

      expect(coverage).toBeGreaterThan(0);
      expect(coverage).toBeLessThan(100);
    });
  });
});
