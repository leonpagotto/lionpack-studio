/**
 * Spike #5 Prototype - Main Entry Point
 *
 * Investigation: Can we adapt KiloCode's multi-mode architecture for web/cloud?
 *
 * This prototype demonstrates:
 * 1. Mode Router - Intent detection from user input
 * 2. Coder Mode - Code + test generation
 * 3. Verifier - Test execution and coverage measurement
 * 4. Pipeline - Complete end-to-end flow
 *
 * @file spike-5-prototype/index.ts
 */

export { ModeRouter, ModeRouteResult, type ModeType } from './mode-router';
export { CoderMode, CoderModeResult, type CoderModeInput } from './coder-mode';
export { Verifier, VerificationResult, type TestResult } from './verifier';
export { Pipeline, PipelineResponse, type PipelineRequest } from './pipeline';

// Test functions
export {
  testModeRouter,
} from './mode-router';
export { testCoderMode } from './coder-mode';
export { testVerifier } from './verifier';
export { testPipeline } from './pipeline';

/**
 * Run all tests
 *
 * Usage:
 * ```typescript
 * import { runAllTests } from './spike-5-prototype';
 *
 * runAllTests();
 * ```
 */
export async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          SPIKE #5 PROTOTYPE - COMPLETE TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const { testModeRouter } = await import('./mode-router');
  const { testCoderMode } = await import('./coder-mode');
  const { testVerifier } = await import('./verifier');
  const { testPipeline } = await import('./pipeline');

  const results = {
    modeRouter: false,
    coder: false,
    verifier: false,
    pipeline: false,
  };

  try {
    console.log('\n📍 TEST SUITE 1: Mode Router');
    console.log('═'.repeat(60));
    results.modeRouter = await testModeRouter();
  } catch (error) {
    console.error('❌ Mode Router tests failed:', error);
  }

  try {
    console.log('\n\n📍 TEST SUITE 2: Coder Mode');
    console.log('═'.repeat(60));
    results.coder = await testCoderMode();
  } catch (error) {
    console.error('❌ Coder Mode tests failed:', error);
  }

  try {
    console.log('\n\n📍 TEST SUITE 3: Verifier');
    console.log('═'.repeat(60));
    results.verifier = await testVerifier();
  } catch (error) {
    console.error('❌ Verifier tests failed:', error);
  }

  try {
    console.log('\n\n📍 TEST SUITE 4: Pipeline (End-to-End)');
    console.log('═'.repeat(60));
    results.pipeline = await testPipeline();
  } catch (error) {
    console.error('❌ Pipeline tests failed:', error);
  }

  // Final summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   FINAL TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const components = Object.entries(results);
  const passed = components.filter(([_, result]) => result).length;
  const total = components.length;

  for (const [component, result] of components) {
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${component.charAt(0).toUpperCase() + component.slice(1)}`);
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`Overall: ${passed}/${total} component test suites passed`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(0)}%\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Spike prototype is functional.\n');
    return true;
  } else {
    console.log('⚠️  SOME TESTS FAILED. Review above for details.\n');
    return false;
  }
}

/**
 * Quick demo - Show what the pipeline does
 *
 * Usage:
 * ```typescript
 * import { quickDemo } from './spike-5-prototype';
 *
 * quickDemo();
 * ```
 */
export async function quickDemo() {
  const { Pipeline } = await import('./pipeline');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              SPIKE #5 PROTOTYPE - QUICK DEMO              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const pipeline = new Pipeline();

  const demoInputs = [
    'Create a function that sums an array',
    'Design the architecture for a real-time collaboration system',
    'Fix the bug where sorting returns NaN',
  ];

  for (const input of demoInputs) {
    const result = await pipeline.execute({ userInput: input });
    console.log(`\n✓ Processed: "${input}"`);
    console.log(`  → Mode: ${result.mode} (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
    if (result.code.code) {
      console.log(`  → Generated: ${result.code.filename} + ${result.test.filename}`);
      console.log(`  → Coverage: ${result.verification.coverage}%`);
    }
  }

  console.log('\n');
}

/**
 * Print prototype information
 */
export function printInfo() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          SPIKE #5: KILOCODE INVESTIGATION PROTOTYPE       ║
╚════════════════════════════════════════════════════════════╝

🎯 INVESTIGATION OBJECTIVE:
   Can we adapt KiloCode's multi-mode architecture for web/cloud?

📋 PROTOTYPE COMPONENTS:

   1. Mode Router (mode-router.ts)
      └─ Intent detection from user input
      └─ Keyword-based classification
      └─ Returns: mode, confidence, reasoning

   2. Coder Mode (coder-mode.ts)
      └─ Generates TypeScript code from task description
      └─ Creates matching unit tests
      └─ Returns: code file, test file

   3. Verifier (verifier.ts)
      └─ Validates generated code syntax
      └─ Simulates test execution
      └─ Measures code coverage
      └─ Returns: pass/fail, coverage metrics

   4. Pipeline (pipeline.ts)
      └─ Orchestrates: Mode Router → Coder → Verifier
      └─ Handles complete end-to-end flow
      └─ Returns: full result with timing

🧪 TESTING:
   - Each component has built-in test suite
   - Run: await runAllTests()
   - Or individual: testModeRouter(), testCoderMode(), etc.

📚 USAGE:

   // Run all tests
   import { runAllTests } from './spike-5-prototype';
   await runAllTests();

   // Run quick demo
   import { quickDemo } from './spike-5-prototype';
   await quickDemo();

   // Use pipeline directly
   import { Pipeline } from './spike-5-prototype';
   const pipeline = new Pipeline();
   const result = await pipeline.execute({
     userInput: 'Create a function that validates emails'
   });

📊 SUCCESS CRITERIA:
   ✅ All 4 components functional
   ✅ End-to-end pipeline works
   ✅ Tests pass with >80% coverage
   ✅ Can route to coder mode correctly
   ✅ Can generate code + tests
   ✅ Can verify with coverage measurement

🎯 GO/NO-GO DECISION:
   Based on: Mode routing accuracy, code generation quality,
   verification accuracy, performance, reliability

⏱️  TIMELINE:
   Day 1 (Today): Architecture analysis ✅
   Day 2 (Tomorrow): Prototype building ✅, Testing, Documentation
   Decision: End of Day 2
`);
}
