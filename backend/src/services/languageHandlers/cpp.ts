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
    // Read test file and extract a representative workload
    const testFilePath = path.join(workDir, 'test_solution.cpp');
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    // Extract test functions (look for TEST, TEST_CASE, etc.)
    const testMatches = testContent.match(/(?:TEST|TEST_CASE)\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g);
    
    if (!testMatches || testMatches.length === 0) {
      throw new Error('No test functions found in C++ code');
    }
    
    // Pick middle test
    const middleIdx = Math.floor(testMatches.length / 2);
    let testFunc = testMatches[middleIdx];
    
    // Extract test body
    const bodyMatch = testFunc.match(/\{([\s\S]*)\}/);
    if (!bodyMatch) {
      throw new Error('Could not extract test body');
    }
    
    let workloadCode = bodyMatch[1]
      .replace(/(?:ASSERT|EXPECT|REQUIRE|CHECK).*?;/g, '') // Remove assertions
      .trim();
    
    // Create benchmark program
    const benchmarkCode = `
#include <iostream>
#include <chrono>
#include <vector>
#include "solution.cpp"

int main() {
    std::vector<double> times;
    
    // Run the workload ${runs} times and measure
    for (int i = 0; i < ${runs}; i++) {
        auto start = std::chrono::high_resolution_clock::now();
        
        // Run extracted workload
        ${workloadCode}
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        times.push_back(duration.count() / 1000.0); // Convert to milliseconds
    }
    
    // Output as JSON
    std::cout << "{\\"times\\":[";
    for (size_t i = 0; i < times.size(); i++) {
        std::cout << times[i];
        if (i < times.size() - 1) std::cout << ",";
    }
    std::cout << "]}" << std::endl;
    
    return 0;
}
`;
    
    await fs.writeFile(path.join(workDir, 'benchmark.cpp'), benchmarkCode);
    
    // Compile benchmark in optimized mode
    const compileResult = await this.runInContainer(workDir, [
      'sh', '-c',
      'g++ -std=c++17 -O3 -o benchmark benchmark.cpp 2>&1'
    ]);

    if (compileResult.exitCode !== 0) {
      throw new Error(`Benchmark compilation failed: ${compileResult.output}`);
    }

    // Run benchmark
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
    // Parse C++ test output (depends on test framework used)
    // Simple parser for basic assertions
    const passedTests = (output.match(/PASS|passed|✓/gi) || []).length;
    const failedTests = (output.match(/FAIL|failed|✗/gi) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

