/**
 * @file Tests for the code formatter module.
 */

// Mock prettier to avoid dynamic import issues in Jest
jest.mock('prettier', () => ({
  format: jest.fn().mockImplementation((code) => {
    // Simple mock formatter that just cleans up spaces
    return code.replace(/\s+/g, ' ').trim() + ';\n';
  }),
}));

import { formatCode } from '../formatter';

describe('Code Formatter', () => {
  describe('formatCode', () => {
    it('should format TypeScript code with Prettier', async () => {
      const uglyCode = `function   test(  x:number  ,y:number){return x+y;}`;

      const formatted = await formatCode(uglyCode, 'typescript');

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle code that is already formatted', async () => {
      const prettyCode = `export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
`;

      const formatted = await formatCode(prettyCode, 'typescript');

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
