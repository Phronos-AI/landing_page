import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class GoHandler extends BaseHandler {
  protected image = 'golang:1.21-alpine';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.go'), solution);
    await fs.writeFile(path.join(workDir, 'solution_test.go'), tests);

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
    // Create timing wrapper program
    const benchmarkCode = `
package main

import (
    "encoding/json"
    "fmt"
    "os"
    "time"
)

type Result struct {
    Times []float64 \`json:"times"\`
    Error string    \`json:"error,omitempty"\`
}

func main() {
    times := make([]float64, ${runs})
    
    for i := 0; i < ${runs}; i++ {
        start := time.Now()
        // Call the solution function here
        // For now, we measure minimal overhead
        _ = start
        elapsed := time.Since(start)
        times[i] = float64(elapsed.Nanoseconds()) / 1000000.0 // Convert to milliseconds
    }
    
    result := Result{Times: times}
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}
`;

    await fs.writeFile(path.join(workDir, 'benchmark.go'), benchmarkCode);

    // Build the benchmark
    const buildResult = await this.runInContainer(workDir, [
      'go', 'build', '-o', 'benchmark', 'benchmark.go', 'solution.go'
    ]);

    if (buildResult.exitCode !== 0) {
      throw new Error(`Build failed: ${buildResult.output}`);
    }

    // Run benchmark (run binary 100 times)
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const start = Date.now();
      const { exitCode } = await this.runInContainer(workDir, [
        './benchmark'
      ], { captureOutput: false });
      const elapsed = Date.now() - start;
      
      if (exitCode !== 0) {
        throw new Error('Benchmark execution failed');
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
    // Parse Go test output
    // Format: "PASS" or "FAIL" with test names like "--- PASS: TestName"
    const passedTests = (output.match(/--- PASS:/g) || []).length;
    const failedTests = (output.match(/--- FAIL:/g) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

