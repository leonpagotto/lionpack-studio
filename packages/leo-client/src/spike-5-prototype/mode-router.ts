/**
 * Mode Router - Detects user intent and routes to appropriate AI mode
 *
 * This is part of Spike #5 investigation: Can we adapt KiloCode's multi-mode
 * architecture for web/cloud?
 *
 * @file spike-5-prototype/mode-router.ts
 */

export type ModeType = 'architect' | 'coder' | 'debugger' | 'reviewer' | 'unknown';

export interface ModeRouteResult {
  mode: ModeType;
  confidence: number; // 0-1, higher = more confident
  reasoning: string;
  context: Record<string, any>;
}

/**
 * Detects user intent and routes to appropriate mode
 *
 * Mode Detection Rules:
 * - "architect" / "design" / "plan" → Architect Mode
 * - "code" / "implement" / "build" → Coder Mode
 * - "fix" / "debug" / "error" → Debugger Mode
 * - "review" / "check" / "quality" → Reviewer Mode
 * - Other → Ask user or default to Coder Mode
 */
export class ModeRouter {
  private architectKeywords = ['architect', 'design', 'plan', 'structure', 'diagram', 'blueprint'];
  private coderKeywords = ['code', 'implement', 'build', 'write', 'create', 'function', 'component'];
  private debuggerKeywords = ['fix', 'debug', 'error', 'bug', 'issue', 'broken', 'crash'];
  private reviewerKeywords = ['review', 'check', 'quality', 'coverage', 'lint', 'validate'];

  /**
   * Route a user request to the appropriate mode
   */
  route(userInput: string, fileContext?: string): ModeRouteResult {
    const input = userInput.toLowerCase();
    const scores = {
      architect: this.scoreMode(input, this.architectKeywords),
      coder: this.scoreMode(input, this.coderKeywords),
      debugger: this.scoreMode(input, this.debuggerKeywords),
      reviewer: this.scoreMode(input, this.reviewerKeywords),
    };

    // Find highest scoring mode
    const [bestMode, bestScore] = Object.entries(scores).reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    ) as [ModeType, number];

    // If confident match, return it
    if (bestScore > 0.5) {
      return {
        mode: bestMode as ModeType,
        confidence: Math.min(bestScore, 1.0),
        reasoning: `Detected intent: "${bestMode}" mode (score: ${bestScore.toFixed(2)})`,
        context: {
          userInput,
          fileContext: fileContext ? `(${fileContext.split('\n').length} lines)` : 'none',
        },
      };
    }

    // No confident match - default to Coder mode with low confidence
    return {
      mode: 'coder',
      confidence: 0.3,
      reasoning: 'No clear intent detected, defaulting to Coder mode',
      context: {
        userInput,
        suggestion: 'Consider using keywords like: code, design, fix, or review',
      },
    };
  }

  /**
   * Score how well a mode matches the input
   */
  private scoreMode(input: string, keywords: string[]): number {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (input.includes(keyword)) {
        matches++;
        score += 1;
      }
    }

    // Normalize score (higher = better match)
    // With one keyword match, score is 1
    // With multiple matches, score approaches 1
    return Math.min(matches / 3, 1.0);
  }
}

/**
 * Tests for ModeRouter
 */
export function testModeRouter() {
  const router = new ModeRouter();

  const testCases = [
    {
      input: 'Create a function that sums an array',
      expectedMode: 'coder',
      label: 'Function implementation',
    },
    {
      input: 'Design the architecture for a payment system',
      expectedMode: 'architect',
      label: 'Architecture design',
    },
    {
      input: 'Fix the bug where the sort function returns NaN',
      expectedMode: 'debugger',
      label: 'Bug fixing',
    },
    {
      input: 'Review this code for quality and coverage',
      expectedMode: 'reviewer',
      label: 'Code review',
    },
    {
      input: 'Hello world',
      expectedMode: 'coder',
      label: 'Unknown intent (default)',
    },
  ];

  console.log('🧪 ModeRouter Tests\n');
  let passed = 0;

  for (const test of testCases) {
    const result = router.route(test.input);
    const success = result.mode === test.expectedMode;
    const icon = success ? '✅' : '❌';

    console.log(`${icon} ${test.label}`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Result: ${result.mode} (confidence: ${result.confidence.toFixed(2)})`);
    console.log(`   Reasoning: ${result.reasoning}\n`);

    if (success) passed++;
  }

  console.log(`Result: ${passed}/${testCases.length} tests passed\n`);
  return passed === testCases.length;
}
