import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class JavaScriptHandler extends BaseHandler {
  protected image = 'node:20-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.js'), solution);
    await fs.writeFile(path.join(workDir, 'solution.test.js'), tests);

    // Create package.json with Jest and common dependencies
    const packageJson = {
      name: 'test',
      type: 'module',
      scripts: {
        test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js'
      },
      dependencies: {
        lodash: '^4.17.21',
        axios: '^1.6.0',
        'crypto-js': '^4.2.0',
        moment: '^2.30.1',
        uuid: '^9.0.1',
        express: '^4.18.2',
        bcrypt: '^5.1.1',
        jsonwebtoken: '^9.0.2',
        ramda: '^0.29.1',
        underscore: '^1.13.6',
        'node-fetch': '^3.3.2',
        dotenv: '^16.3.1',
        validator: '^13.11.0',
        chalk: '^5.3.0',
        dayjs: '^1.11.10'
      }
    };
    await fs.writeFile(
      path.join(workDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Install Jest and dependencies
    await this.runInContainer(workDir, [
      'sh', '-c', 'npm install --silent jest 2>/dev/null'
    ], { captureOutput: false, timeout: 60000 });

    // Run tests
    const { exitCode, output } = await this.runInContainer(workDir, [
      'npm', 'test', '--', '--verbose'
    ]);

    const testResults = this.parseTestOutput(output);

    return {
      passed: exitCode === 0,
      testsPassed: testResults.passed,
      totalTests: testResults.total,
      error: exitCode !== 0 ? output : undefined,
      output,
    };
  }

  async measurePerformance(solution: string, workDir: string, runs: number): Promise<MeasurementResult> {
    // Extract a representative test workload and run the solution 100 times
    const wrapperScript = `
const { performance } = require('perf_hooks');
const fs = require('fs');
const solution = require('./solution.js');

// Read and parse test file to extract a representative workload
const testContent = fs.readFileSync('solution.test.js', 'utf8');

// Find test function bodies (looking for test(...) or it(...) blocks)
// Extract a middle test as representative workload
const testMatches = testContent.match(/(?:test|it)\\s*\\([^,]+,\\s*(?:async\\s+)?\\([^)]*\\)\\s*=>\\s*\\{([^}]+)\\}/g);

if (!testMatches || testMatches.length === 0) {
  console.log(JSON.stringify({ error: 'No test functions found' }));
  process.exit(1);
}

// Pick middle test
const middleIdx = Math.floor(testMatches.length / 2);
let testBody = testMatches[middleIdx];

// Extract just the body part (everything inside the function)
const bodyMatch = testBody.match(/\\{([\\s\\S]+)\\}/);
if (!bodyMatch) {
  console.log(JSON.stringify({ error: 'Could not extract test body' }));
  process.exit(1);
}

const workloadCode = bodyMatch[1];

// Create benchmark function
const cleanedWorkload = workloadCode.replace(/expect.*$/gm, '');  // Remove expect assertions
const runWorkload = new Function('solution', cleanedWorkload);

// Run ${runs} times and measure
const times = [];
for (let i = 0; i < ${runs}; i++) {
  const start = performance.now();
  try {
    runWorkload(solution);
  } catch (e) {
    // Ignore errors during benchmark
  }
  const end = performance.now();
  times.push(end - start);
}

console.log(JSON.stringify({ times }));
`;

    await fs.writeFile(path.join(workDir, 'benchmark.js'), wrapperScript);

    const { exitCode, output } = await this.runInContainer(workDir, [
      'node', 'benchmark.js'
    ], { timeout: 60000 });

    if (exitCode !== 0) {
      throw new Error(`Benchmark failed: ${output}`);
    }

    try {
      const result = JSON.parse(output);
      if (result.error) {
        throw new Error(result.error);
      }

      const stats = this.calculateStatistics(result.times);
      return {
        meanExecutionTime: stats.mean,
        standardDeviation: stats.stdDev,
        executionTimes: result.times,
      };
    } catch (error) {
      throw new Error(`Failed to parse benchmark results: ${error}`);
    }
  }

  private parseTestOutput(output: string): { passed: number; total: number } {
    // Parse Jest output
    // Format: "Tests: 2 passed, 2 total" or "Tests: 1 failed, 2 passed, 3 total"
    const totalMatch = output.match(/Tests:.*?(\d+)\s+total/);
    const passedMatch = output.match(/(\d+)\s+passed/);
    
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;

    return { passed, total: total || 1 };
  }
}

