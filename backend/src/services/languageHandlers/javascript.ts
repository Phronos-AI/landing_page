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

    // Create minimal package.json for Jest
    const packageJson = {
      name: 'test',
      type: 'module',
      scripts: {
        test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js'
      }
    };
    await fs.writeFile(
      path.join(workDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Install Jest
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
    // Create timing wrapper script
    const wrapperScript = `
const { performance } = require('perf_hooks');
const solution = require('./solution.js');

// Find the main function to benchmark
let functionToTest = null;
for (const key in solution) {
  if (typeof solution[key] === 'function') {
    functionToTest = solution[key];
    break;
  }
}

if (!functionToTest) {
  console.log(JSON.stringify({ error: 'No function found in solution' }));
  process.exit(1);
}

// Run benchmark
const times = [];
for (let i = 0; i < ${runs}; i++) {
  const start = performance.now();
  try {
    functionToTest();
  } catch (e) {
    // Function might need arguments, that's ok
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

