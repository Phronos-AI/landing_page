import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class JavaHandler extends BaseHandler {
  protected image = 'openjdk:21-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'Solution.java'), solution);
    await fs.writeFile(path.join(workDir, 'SolutionTest.java'), tests);

    // Compile solution
    const compileResult = await this.runInContainer(workDir, [
      'javac', 'Solution.java', 'SolutionTest.java'
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

    // Run tests (assuming JUnit-style tests)
    const { exitCode, output } = await this.runInContainer(workDir, [
      'java', 'SolutionTest'
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
    // Run the compiled solution multiple times
    const times: number[] = [];
    
    for (let i = 0; i < runs; i++) {
      const start = Date.now();
      const { exitCode } = await this.runInContainer(workDir, [
        'java', 'Solution'
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
    // Parse Java/JUnit test output
    // This is a simplified parser - in production, use JUnit XML output
    const passedTests = (output.match(/PASSED|OK/gi) || []).length;
    const failedTests = (output.match(/FAILED|ERROR/gi) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

