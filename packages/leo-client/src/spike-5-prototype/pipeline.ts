/**
 * Pipeline Integration - Connects Mode Router → Coder Mode → Verifier
 *
 * Investigation Question: Can we build a complete end-to-end pipeline?
 *
 * @file spike-5-prototype/pipeline.ts
 */

import { ModeRouter } from './mode-router';
import { CoderMode } from './coder-mode';
import { Verifier } from './verifier';

export interface PipelineRequest {
  userInput: string;
  fileContext?: string;
}

export interface PipelineResponse {
  mode: string;
  confidence: number;
  modeReasoning: string;
  code: {
    filename: string;
    code: string;
  };
  test: {
    filename: string;
    code: string;
  };
  verification: {
    success: boolean;
    testsPassed: number;
    testsTotal: number;
    coverage: number;
    message: string;
  };
  totalTime: number;
  timestamp: string;
}

/**
 * Main Pipeline orchestrator
 *
 * Flow:
 * 1. User input → Mode Router → Detect intent + select mode
 * 2. If Coder mode → Coder Mode → Generate code + tests
 * 3. Generated code + tests → Verifier → Run tests + measure coverage
 * 4. Return complete result
 */
export class Pipeline {
  private modeRouter: ModeRouter;
  private coder: CoderMode;
  private verifier: Verifier;

  constructor() {
    this.modeRouter = new ModeRouter();
    this.coder = new CoderMode('typescript');
    this.verifier = new Verifier();
  }

  /**
   * Execute complete pipeline
   */
  async execute(request: PipelineRequest): Promise<PipelineResponse> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 SPIKE #5: COMPLETE PIPELINE EXECUTION');
    console.log(`${'='.repeat(60)}\n`);

    console.log(`📝 User Input: "${request.userInput}"\n`);

    // Step 1: Route to mode
    console.log('Step 1️⃣ : Mode Detection');
    console.log('-'.repeat(40));
    const routeResult = this.modeRouter.route(request.userInput, request.fileContext || '');
    console.log(`Mode: ${routeResult.mode.toUpperCase()}`);
    console.log(`Confidence: ${(routeResult.confidence * 100).toFixed(0)}%`);
    console.log(`Reasoning: ${routeResult.reasoning}\n`);

    // Step 2: Only proceed if Coder mode
    if (routeResult.mode !== 'coder') {
      console.log(`⏭️  Skipping code generation (not Coder mode)\n`);
      return {
        mode: routeResult.mode,
        confidence: routeResult.confidence,
        modeReasoning: routeResult.reasoning,
        code: { filename: '', code: '' },
        test: { filename: '', code: '' },
        verification: {
          success: false,
          testsPassed: 0,
          testsTotal: 0,
          coverage: 0,
          message: `Spike only tests Coder mode. Detected mode: ${routeResult.mode}`,
        },
        totalTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 3: Generate code
    console.log('Step 2️⃣ : Code Generation');
    console.log('-'.repeat(40));
    const coderResult = await this.coder.execute({ task: request.userInput });
    console.log(`Generated: ${coderResult.code.filename}`);
    console.log(`Lines: ${coderResult.code.code.split('\n').length}\n`);

    // Step 4: Generate test
    console.log('Step 3️⃣ : Test Generation');
    console.log('-'.repeat(40));
    console.log(`Generated: ${coderResult.test.filename}`);
    console.log(`Lines: ${coderResult.test.code.split('\n').length}\n`);

    // Step 5: Verify
    console.log('Step 4️⃣ : Verification & Coverage');
    console.log('-'.repeat(40));
    const verifyResult = await this.verifier.verify(
      coderResult.code.filename,
      coderResult.test.filename,
      coderResult.code.code,
      coderResult.test.code
    );

    const totalTime = Date.now() - startTime;
    const success = verifyResult.success;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${success ? '✅ SUCCESS' : '⚠️  VERIFICATION ISSUES'}`);
    console.log(`${'='.repeat(60)}\n`);

    console.log(`Execution Time: ${totalTime}ms`);
    console.log(`Tests: ${verifyResult.testResult.passed}/${verifyResult.testResult.total} passed`);
    console.log(`Coverage: ${verifyResult.testResult.coverage.lines}% lines`);
    console.log(`Status: ${verifyResult.reasoning}\n`);

    return {
      mode: routeResult.mode,
      confidence: routeResult.confidence,
      modeReasoning: routeResult.reasoning,
      code: coderResult.code,
      test: coderResult.test,
      verification: {
        success: verifyResult.success,
        testsPassed: verifyResult.testResult.passed,
        testsTotal: verifyResult.testResult.total,
        coverage: verifyResult.testResult.coverage.lines,
        message: verifyResult.reasoning,
      },
      totalTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * End-to-end pipeline tests
 */
export async function testPipeline() {
  const pipeline = new Pipeline();

  const testScenarios = [
    {
      input: 'Create a function that sums an array of numbers',
      label: 'Sum Function',
    },
    {
      input: 'Build a function to validate email addresses',
      label: 'Email Validator',
    },
    {
      input: 'Implement a bubble sort algorithm',
      label: 'Bubble Sort',
    },
    {
      input: 'What is the weather today?',
      label: 'Non-coding query (should fail routing)',
    },
  ];

  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        SPIKE #5: END-TO-END PIPELINE TEST SUITE          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  let successCount = 0;
  const results: Array<{ scenario: string; mode: string; success: boolean; coverage: number }> = [];

  for (const scenario of testScenarios) {
    try {
      const result = await pipeline.execute({
        userInput: scenario.input,
      });

      const success = result.verification.success;
      results.push({
        scenario: scenario.label,
        mode: result.mode,
        success,
        coverage: result.verification.coverage,
      });

      if (success && result.mode === 'coder') {
        successCount++;
      }
    } catch (error) {
      console.error(`\n❌ Error in scenario: ${scenario.label}`);
      console.error(error);
      results.push({
        scenario: scenario.label,
        mode: 'error',
        success: false,
        coverage: 0,
      });
    }
  }

  // Summary
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                     RESULTS SUMMARY                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('Scenario Results:\n');
  for (const result of results) {
    const icon = result.mode === 'error' ? '❌' : result.success ? '✅' : '⚠️ ';
    console.log(
      `${icon} ${result.scenario.padEnd(25)} │ Mode: ${result.mode.padEnd(10)} │ Coverage: ${result.coverage}%`
    );
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`Successful Coder executions: ${successCount}/${testScenarios.length}`);
  console.log(`Success Rate: ${((successCount / testScenarios.length) * 100).toFixed(0)}%\n`);

  return successCount >= 3; // At least 3/4 scenarios should work
}
