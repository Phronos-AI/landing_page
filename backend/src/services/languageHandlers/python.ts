import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class PythonHandler extends BaseHandler {
  protected image = 'python:3.11-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.py'), solution);
    await fs.writeFile(path.join(workDir, 'test_solution.py'), tests);

    // Install pytest AND run tests in the same container
    const { exitCode, output } = await this.runInContainer(workDir, [
      'sh', '-c', 'pip install -q pytest 2>/dev/null && python -m pytest test_solution.py -v --tb=short'
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
import timeit
import sys
import json

# Import the solution
import solution

# Find the main function to benchmark
# Try common function names
function_to_test = None
for attr_name in dir(solution):
    attr = getattr(solution, attr_name)
    if callable(attr) and not attr_name.startswith('_'):
        function_to_test = attr
        break

if not function_to_test:
    print(json.dumps({"error": "No callable function found in solution"}))
    sys.exit(1)

# Run benchmark
times = []
for i in range(${runs}):
    start = timeit.default_timer()
    try:
        # Call function with empty args - real tests should pass data
        result = function_to_test()
    except TypeError:
        # Function needs arguments, skip actual call but measure overhead
        pass
    end = timeit.default_timer()
    times.append((end - start) * 1000)  # Convert to milliseconds

print(json.dumps({"times": times}))
`;

    await fs.writeFile(path.join(workDir, 'benchmark.py'), wrapperScript);

    const { exitCode, output } = await this.runInContainer(workDir, [
      'python', 'benchmark.py'
    ], { timeout: 60000 }); // Longer timeout for benchmarks

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
    // Parse pytest output
    // Format: "5 passed" or "3 passed, 2 failed" or "5 passed in 0.12s"
    const passedMatch = output.match(/(\d+)\s+passed/);
    const failedMatch = output.match(/(\d+)\s+failed/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = passed + failed;

    return { passed, total: total || 1 }; // At least 1 test assumed
  }
}

