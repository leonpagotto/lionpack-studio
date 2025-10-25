/**
 * @file Test generator module for the Coder Agent.
 *
 * This module analyzes generated code and creates appropriate unit tests.
 */

/**
 * Analyzes code to estimate test coverage.
 * 
 * @param code - The source code.
 * @param tests - The test code.
 * @returns The estimated coverage percentage.
 */
export function estimateTestCoverage(code: string, tests: string): number {
  // Extract function and class names from the source code
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  const arrowFunctionRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;

  const sourceItems = new Set<string>();
  
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    sourceItems.add(match[1]);
  }
  while ((match = classRegex.exec(code)) !== null) {
    sourceItems.add(match[1]);
  }
  while ((match = arrowFunctionRegex.exec(code)) !== null) {
    sourceItems.add(match[1]);
  }

  if (sourceItems.size === 0) {
    return 0;
  }

  // Count how many source items are tested
  let testedCount = 0;
  for (const item of sourceItems) {
    // Check if the test file mentions this item
    if (tests.includes(item)) {
      testedCount++;
    }
  }

  return Math.round((testedCount / sourceItems.size) * 100);
}
