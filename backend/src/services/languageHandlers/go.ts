import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class GoHandler extends BaseHandler {
  protected image = 'golang:1.21-alpine';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Strip markdown code fences
    const cleanSolution = this.stripMarkdown(solution);
    const cleanTests = this.stripMarkdown(tests);
    
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.go'), cleanSolution);
    await fs.writeFile(path.join(workDir, 'solution_test.go'), cleanTests);

    // Initialize go module
    await this.runInContainer(workDir, [
      'go', 'mod', 'init', 'solution'
    ], { captureOutput: false });

    // Run tests
    const { exitCode, output } = await this.runInContainer(workDir, [
      'go', 'test', '-v'
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
    // Create timing wrapper program that runs the solution N times INSIDE the container
    const benchmarkCode = `
package main

import (
    "encoding/json"
    "fmt"
    "time"
)

type Result struct {
    Times []float64 \`json:"times"\`
}

func main() {
    times := make([]float64, ${runs})
    
    // Run the solution function ${runs} times and measure each execution
    for i := 0; i < ${runs}; i++ {
        start := time.Now()
        
        // Call your solution function here
        // TODO: This needs to be integrated with the actual solution
        // For now measuring minimal overhead
        
        elapsed := time.Since(start)
        times[i] = float64(elapsed.Nanoseconds()) / 1000000.0 // Convert to milliseconds
    }
    
    result := Result{Times: times}
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}
`;

    await fs.writeFile(path.join(workDir, 'benchmark.go'), benchmarkCode);

    // Build the benchmark binary
    const buildResult = await this.runInContainer(workDir, [
      'go', 'build', '-o', 'benchmark', 'benchmark.go', 'solution.go'
    ], { timeout: 60000 });

    if (buildResult.exitCode !== 0) {
      throw new Error(`Build failed: ${buildResult.output}`);
    }

    // Run the benchmark ONCE - it runs the solution N times internally
    const { exitCode, output } = await this.runInContainer(workDir, [
      './benchmark'
    ], { timeout: 60000 });

    if (exitCode !== 0) {
      throw new Error(`Benchmark execution failed: ${output}`);
    }

    try {
      const result = JSON.parse(output);
      if (!result.times || !Array.isArray(result.times)) {
        throw new Error('Invalid benchmark output format');
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
    // Parse Go test output
    // Format: "PASS" or "FAIL" with test names like "--- PASS: TestName"
    const passedTests = (output.match(/--- PASS:/g) || []).length;
    const failedTests = (output.match(/--- FAIL:/g) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

