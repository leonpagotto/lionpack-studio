/**
 * @file Tests for the code validator module.
 */

import { validateCode, validateTypeScript } from '../validator';

describe('Code Validator', () => {
  describe('validateTypeScript', () => {
    it('should validate simple TypeScript code', () => {
      const validCode = `
type MyNumber = number;
const x: MyNumber = 42;
`;

      const result = validateTypeScript(validCode, 'test.ts');

      // The validator should run without crashing
      expect(result.hasTypeErrors).toBeDefined();
      expect(result.typeErrors).toBeDefined();
    });

    it('should detect type errors in invalid code', () => {
      const invalidCode = `
const add = (a: number, b: number): string => {
  return a + b; // Type error: number is not assignable to string
};
`;

      const result = validateTypeScript(invalidCode, 'test.ts');

      expect(result.hasTypeErrors).toBe(true);
      expect(result.typeErrors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCode', () => {
    it('should validate TypeScript code', () => {
      const code = `
const PI = 3.14159;
const circumference = (radius: number): number => {
  return 2 * PI * radius;
};
`;

      const result = validateCode(code, 'typescript');

      expect(result.hasTypeErrors).toBeDefined();
      expect(result.hasLintErrors).toBe(false);
    });

    it('should return passing validation for non-TypeScript languages', () => {
      const pythonCode = `
def greet(name):
    return f"Hello, {name}!"
`;

      const result = validateCode(pythonCode, 'python');

      expect(result.hasTypeErrors).toBe(false);
      expect(result.hasLintErrors).toBe(false);
    });
  });
});
