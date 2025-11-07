import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class PythonHandler extends BaseHandler {
  protected image = 'python:3.11-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    console.log('  → [PYTHON] Received solution:', solution.length, 'bytes');
    console.log('  → [PYTHON] Solution preview:', solution.substring(0, 150));
    console.log('  → [PYTHON] Received tests:', tests.length, 'bytes');
    console.log('  → [PYTHON] Tests preview:', tests.substring(0, 150));
    console.log('  → [PYTHON] Work directory:', workDir);
    
    // Strip markdown code fences before writing
    const cleanSolution = this.stripMarkdown(solution);
    const cleanTests = this.stripMarkdown(tests);
    
    console.log('  → [PYTHON] Cleaned solution preview:', cleanSolution.substring(0, 100));
    console.log('  → [PYTHON] Cleaned tests preview:', cleanTests.substring(0, 100));
    
    // Write solution and test files
    await fs.writeFile(path.join(workDir, 'solution.py'), cleanSolution);
    await fs.writeFile(path.join(workDir, 'test_solution.py'), cleanTests);
    console.log('  → [PYTHON] Files written to disk');

    // Install pytest and common packages, then run tests in the same container
    const command = 'pip install -q pytest numpy pandas scipy requests cryptography matplotlib pillow beautifulsoup4 flask sqlalchemy pydantic httpx aiohttp redis pymongo psycopg2-binary jwt pyyaml click 2>/dev/null && python -m pytest test_solution.py -v --tb=short';
    console.log('  → [PYTHON] Executing command:', command);
    
    const { exitCode, output } = await this.runInContainer(workDir, [
      'sh', '-c', command
    ]);
    
    console.log('  → [PYTHON] Container exited with code:', exitCode);
    console.log('  → [PYTHON] Container output length:', output.length);

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
    // This measures the actual solution performance, not test overhead
    const wrapperScript = `
import timeit
import sys
import json
import ast

# Parse test file to extract a representative workload
with open('test_solution.py', 'r') as f:
    test_content = f.read()

try:
    tree = ast.parse(test_content)
    
    # Find all test functions
    test_functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name.startswith('test_'):
            test_functions.append(node)
    
    if not test_functions:
        print(json.dumps({"error": "No test functions found"}))
        sys.exit(1)
    
    # Pick a middle test (not the first trivial one, not the last complex one)
    # This gives us a representative workload
    middle_idx = min(len(test_functions) // 2, len(test_functions) - 1)
    representative_test = test_functions[middle_idx]
    
    # Extract the test body as source code
    test_body_lines = []
    for stmt in representative_test.body:
        try:
            # Convert AST back to source code
            line = ast.unparse(stmt)
            test_body_lines.append(line)
        except:
            pass
    
    # Join without extra indentation - we'll indent properly in the f-string
    workload_code = '\\n'.join(test_body_lines)
    
except Exception as e:
    print(json.dumps({"error": f"Failed to parse tests: {str(e)}"}))
    sys.exit(1)

# Create benchmark script that runs the workload ${runs} times
# Indent each line of the workload properly
indented_workload = '\\n    '.join(workload_code.split('\\n'))

benchmark_code = f"""
from solution import *
import timeit
import json

def run_workload():
    {indented_workload}

# Run ${runs} times and measure each execution
times = []
for i in range(${runs}):
    start = timeit.default_timer()
    try:
        run_workload()
    except:
        pass  # Ignore errors during benchmark, just measure time
    end = timeit.default_timer()
    times.append((end - start) * 1000)  # Convert to milliseconds

print(json.dumps({{"times": times}}))
"""

# Execute the benchmark
exec(benchmark_code)
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

