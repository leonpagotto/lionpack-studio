/**
 * Analysis Engine Tests
 *
 * Comprehensive tests for code analysis functionality
 */

import { AnalysisEngine } from '../analysis-engine';

describe('AnalysisEngine', () => {
  let engine: AnalysisEngine;

  beforeEach(() => {
    engine = new AnalysisEngine();
  });

  describe('analyzeCode', () => {
    it('should analyze code and return results', async () => {
      const code = `
const unused = 'test';
const user = await fetch('/api/user');
`;

      const result = await engine.analyzeCode(code);

      expect(result).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.metrics).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should detect unused variables', async () => {
      const code = `
const unused = 'this is never used';
const used = 'hello';
console.log(used);
`;

      const result = await engine.analyzeCode(code);
      const unusedVarIssue = result.issues.find(
        (i) => i.ruleId === 'no-unused-vars' && i.message.includes('unused')
      );

      expect(unusedVarIssue).toBeDefined();
      expect(unusedVarIssue?.type).toBe('warning');
      expect(unusedVarIssue?.severity).toBe('low');
      expect(unusedVarIssue?.category).toBe('best-practice');
    });

    it('should detect missing error handling', async () => {
      const code = `
const data = await fetch('/api/data');
const result = data.json();
`;

      const result = await engine.analyzeCode(code);
      const errorHandlingIssue = result.issues.find(
        (i) => i.ruleId === 'require-error-handling'
      );

      expect(errorHandlingIssue).toBeDefined();
      expect(errorHandlingIssue?.type).toBe('warning');
      expect(errorHandlingIssue?.message).toContain('error handling');
    });

    it('should provide quick fix for missing error handling', async () => {
      const code = `const data = await fetch('/api/data');`;

      const result = await engine.analyzeCode(code);
      const errorHandlingIssue = result.issues.find(
        (i) => i.ruleId === 'require-error-handling'
      );

      expect(errorHandlingIssue?.quickFixes).toBeDefined();
      expect(errorHandlingIssue?.quickFixes?.length).toBeGreaterThan(0);
      expect(errorHandlingIssue?.quickFixes?.[0].title).toContain('try-catch');
    });

    it('should detect hardcoded secrets', async () => {
      const code = `
const apiKey = "sk-1234567890abcdef";
const password = "mysecretpassword";
`;

      const result = await engine.analyzeCode(code);
      const secretIssues = result.issues.filter(
        (i) => i.ruleId === 'no-hardcoded-secrets'
      );

      expect(secretIssues.length).toBeGreaterThan(0);
      expect(secretIssues[0].type).toBe('error');
      expect(secretIssues[0].severity).toBe('critical');
      expect(secretIssues[0].category).toBe('security');
    });

    it('should detect SQL injection risks', async () => {
      const code = `
const query = \`SELECT * FROM users WHERE id = \${userId}\`;
db.query(query);
`;

      const result = await engine.analyzeCode(code);
      const sqlInjectionIssue = result.issues.find(
        (i) => i.ruleId === 'no-sql-injection'
      );

      expect(sqlInjectionIssue).toBeDefined();
      expect(sqlInjectionIssue?.type).toBe('error');
      expect(sqlInjectionIssue?.severity).toBe('critical');
    });

    it('should detect eval usage', async () => {
      const code = `
const result = eval(userInput);
`;

      const result = await engine.analyzeCode(code);
      const evalIssue = result.issues.find((i) => i.ruleId === 'no-eval');

      expect(evalIssue).toBeDefined();
      expect(evalIssue?.type).toBe('error');
      expect(evalIssue?.severity).toBe('critical');
      expect(evalIssue?.message).toContain('eval');
    });

    it('should detect synchronous file operations', async () => {
      const code = `
const content = fs.readFileSync('file.txt', 'utf8');
`;

      const result = await engine.analyzeCode(code);
      const syncIssue = result.issues.find(
        (i) => i.ruleId === 'prefer-async-fs'
      );

      expect(syncIssue).toBeDefined();
      expect(syncIssue?.type).toBe('warning');
      expect(syncIssue?.category).toBe('performance');
    });

    it('should detect var usage', async () => {
      const code = `
var oldStyle = 'should use const or let';
`;

      const result = await engine.analyzeCode(code);
      const varIssue = result.issues.find((i) => i.ruleId === 'no-var');

      expect(varIssue).toBeDefined();
      expect(varIssue?.type).toBe('suggestion');
      expect(varIssue?.quickFixes).toBeDefined();
      expect(varIssue?.quickFixes?.[0].newCode).toContain('const');
    });

    it('should detect missing alt text', async () => {
      const code = `
<img src="photo.jpg" />
`;

      const result = await engine.analyzeCode(code);
      const altIssue = result.issues.find(
        (i) => i.ruleId === 'jsx-a11y/alt-text'
      );

      expect(altIssue).toBeDefined();
      expect(altIssue?.type).toBe('warning');
      expect(altIssue?.category).toBe('accessibility');
      expect(altIssue?.severity).toBe('high');
    });

    it('should calculate metrics correctly', async () => {
      const code = `
function complexFunction() {
  if (condition1) {
    for (let i = 0; i < 10; i++) {
      if (condition2) {
        while (condition3) {
          // Complex logic
        }
      }
    }
  }
}
`;

      const result = await engine.analyzeCode(code);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.complexity).toBeGreaterThan(1);
      expect(result.metrics.linesOfCode).toBeGreaterThan(0);
      expect(result.metrics.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(result.metrics.maintainabilityIndex).toBeLessThanOrEqual(100);
      expect(result.metrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics.securityScore).toBeLessThanOrEqual(100);
    });

    it('should generate relevant suggestions', async () => {
      const code = `
const apiKey = "hardcoded-secret";
var oldStyle = "test";

function veryComplexFunction() {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            if (f) {
              // Too complex
            }
          }
        }
      }
    }
  }
}
`;

      const result = await engine.analyzeCode(code);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some((s) => s.includes('complex'))).toBe(true);
    });

    it('should respect analysis options', async () => {
      const code = `
const apiKey = "secret";
var oldStyle = "test";
`;

      const resultWithSecurity = await engine.analyzeCode(code, {
        includeSecurity: true,
        includeStyle: false,
      });

      const resultWithoutSecurity = await engine.analyzeCode(code, {
        includeSecurity: false,
        includeStyle: true,
      });

      const securityIssuesWithSecurity = resultWithSecurity.issues.filter(
        (i) => i.category === 'security'
      );
      const securityIssuesWithoutSecurity =
        resultWithoutSecurity.issues.filter((i) => i.category === 'security');

      expect(securityIssuesWithSecurity.length).toBeGreaterThan(0);
      expect(securityIssuesWithoutSecurity.length).toBe(0);
    });

    it('should detect console.log usage', async () => {
      const code = `
console.log('debug message');
console.error('error message');
`;

      const result = await engine.analyzeCode(code);
      const consoleIssues = result.issues.filter(
        (i) => i.ruleId === 'no-console'
      );

      expect(consoleIssues.length).toBeGreaterThan(0);
      expect(consoleIssues[0].type).toBe('suggestion');
    });

    it('should handle empty code', async () => {
      const code = '';

      const result = await engine.analyzeCode(code);

      expect(result.issues).toEqual([]);
      expect(result.metrics.linesOfCode).toBe(0);
      expect(result.metrics.complexity).toBe(1); // Base complexity
    });

    it('should handle code with only comments', async () => {
      const code = `
// This is a comment
// Another comment
`;

      const result = await engine.analyzeCode(code);

      expect(result.metrics.linesOfCode).toBe(0);
    });

    it('should count issues by severity correctly', async () => {
      const code = `
const apiKey = "secret123"; // Critical security issue
var oldStyle = "test"; // Low style issue
const unused = "test"; // Low best-practice issue
`;

      const result = await engine.analyzeCode(code);

      expect(result.metrics.issues.critical).toBeGreaterThan(0);
      expect(result.metrics.issues.low).toBeGreaterThan(0);
    });

    it('should detect missing semicolons', async () => {
      const code = `const x = 5`;

      const result = await engine.analyzeCode(code, {
        language: 'typescript',
      });

      const semiIssue = result.issues.find((i) => i.ruleId === 'semi');

      expect(semiIssue).toBeDefined();
      expect(semiIssue?.type).toBe('info');
    });

    it('should provide quick fix for unused variables', async () => {
      const code = `
const unused = 'test';
const used = 'hello';
console.log(used);
`;

      const result = await engine.analyzeCode(code);
      const unusedIssue = result.issues.find(
        (i) => i.ruleId === 'no-unused-vars'
      );

      expect(unusedIssue?.quickFixes).toBeDefined();
      expect(unusedIssue?.quickFixes?.[0].category).toBe('auto-fix');
      expect(unusedIssue?.quickFixes?.[0].newCode).not.toContain('const unused');
    });

    it('should calculate complexity for ternary operators', async () => {
      const code = `
const result = condition ? value1 : value2;
const another = cond1 ? v1 : cond2 ? v2 : v3;
`;

      const result = await engine.analyzeCode(code);

      expect(result.metrics.complexity).toBeGreaterThan(1);
    });

    it('should calculate complexity for logical operators', async () => {
      const code = `
if (condition1 && condition2 || condition3) {
  // Complex logic
}
`;

      const result = await engine.analyzeCode(code);

      expect(result.metrics.complexity).toBeGreaterThan(1);
    });

    it('should suggest fixing errors first', async () => {
      const code = `
const apiKey = "hardcoded-secret";
eval(userInput);
`;

      const result = await engine.analyzeCode(code);
      const errorCount = result.issues.filter((i) => i.type === 'error').length;

      expect(errorCount).toBeGreaterThan(0);
      expect(
        result.suggestions.some((s) => s.includes('Fix') && s.includes('error'))
      ).toBe(true);
    });
  });
});
