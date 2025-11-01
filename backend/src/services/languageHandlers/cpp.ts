import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class CppHandler extends BaseHandler {
  protected image = 'gcc:latest';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.cpp'), solution);
    await fs.writeFile(path.join(workDir, 'test.cpp'), tests);

    // Compile with tests
    const compileResult = await this.runInContainer(workDir, [
      'sh', '-c', 
      'g++ -std=c++17 -o test_solution test.cpp solution.cpp 2>&1'
    ]);

    if (compileResult.exitCode !== 0) {
      return {
        passed: false,
        testsPassed: 0,
        totalTests: 0,
        error: `Compilation failed: ${compileResult.output}`,
        output: compileResult.output,
      };
    }

    // Run tests
    const { exitCode, output } = await this.runInContainer(workDir, [
      './test_solution'
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
    // Compile solution in optimized mode
    const compileResult = await this.runInContainer(workDir, [
      'sh', '-c',
      'g++ -std=c++17 -O3 -o solution solution.cpp 2>&1'
    ]);

    if (compileResult.exitCode !== 0) {
      throw new Error(`Compilation failed: ${compileResult.output}`);
    }

    // Run the binary multiple times
    const times: number[] = [];
    
    for (let i = 0; i < runs; i++) {
      const start = Date.now();
      const { exitCode } = await this.runInContainer(workDir, [
        './solution'
      ], { captureOutput: false, timeout: 10000 });
      const elapsed = Date.now() - start;
      
      if (exitCode !== 0) {
        throw new Error('Execution failed');
      }
      
      times.push(elapsed);
    }

    const stats = this.calculateStatistics(times);
    return {
      meanExecutionTime: stats.mean,
      standardDeviation: stats.stdDev,
      executionTimes: times,
    };
  }

  private parseTestOutput(output: string): { passed: number; total: number } {
    // Parse C++ test output (depends on test framework used)
    // Simple parser for basic assertions
    const passedTests = (output.match(/PASS|passed|✓/gi) || []).length;
    const failedTests = (output.match(/FAIL|failed|✗/gi) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

