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
    // Read test file and extract a representative workload
    const testFilePath = path.join(workDir, 'SolutionTest.java');
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    // Extract test methods (look for @Test annotation)
    const testMatches = testContent.match(/@Test[\s\S]*?public\s+void\s+\w+\s*\(\)\s*\{[\s\S]*?\n    \}/g);
    
    if (!testMatches || testMatches.length === 0) {
      throw new Error('No test methods found in Java code');
    }
    
    // Pick middle test
    const middleIdx = Math.floor(testMatches.length / 2);
    let testMethod = testMatches[middleIdx];
    
    // Extract test body
    const bodyMatch = testMethod.match(/\{([\s\S]*)\}/);
    if (!bodyMatch) {
      throw new Error('Could not extract test body');
    }
    
    let workloadCode = bodyMatch[1]
      .replace(/assert\w+\(.*?\);/g, '') // Remove assertions
      .trim();
    
    // Create benchmark class
    const benchmarkCode = `
import com.google.gson.Gson;
import java.util.*;

public class Benchmark {
    public static void main(String[] args) {
        List<Double> times = new ArrayList<>();
        
        // Run the workload ${runs} times and measure
        for (int i = 0; i < ${runs}; i++) {
            long start = System.nanoTime();
            
            // Run extracted workload
            ${workloadCode}
            
            long elapsed = System.nanoTime() - start;
            times.add(elapsed / 1000000.0); // Convert to milliseconds
        }
        
        // Output as JSON
        Gson gson = new Gson();
        System.out.println(gson.toJson(Collections.singletonMap("times", times)));
    }
}
`;
    
    await fs.writeFile(path.join(workDir, 'Benchmark.java'), benchmarkCode);
    
    // Compile benchmark
    const compileResult = await this.runInContainer(workDir, [
      'javac', 'Benchmark.java'
    ]);
    
    if (compileResult.exitCode !== 0) {
      throw new Error(`Benchmark compilation failed: ${compileResult.output}`);
    }
    
    // Run benchmark
    const { exitCode, output } = await this.runInContainer(workDir, [
      'java', 'Benchmark'
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
    // Parse Java/JUnit test output
    // This is a simplified parser - in production, use JUnit XML output
    const passedTests = (output.match(/PASSED|OK/gi) || []).length;
    const failedTests = (output.match(/FAILED|ERROR/gi) || []).length;
    const total = passedTests + failedTests;

    return { passed: passedTests, total: total || 1 };
  }
}

