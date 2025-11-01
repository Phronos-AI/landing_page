import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class RustHandler extends BaseHandler {
  protected image = 'rust:1.75-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Create Cargo.toml
    const cargoToml = `
[package]
name = "solution"
version = "0.1.0"
edition = "2021"

[dependencies]
`;
    await fs.writeFile(path.join(workDir, 'Cargo.toml'), cargoToml.trim());

    // Create src directory
    await fs.mkdir(path.join(workDir, 'src'), { recursive: true });

    // Combine solution and tests in lib.rs
    const libRs = `${solution}\n\n${tests}`;
    await fs.writeFile(path.join(workDir, 'src', 'lib.rs'), libRs);

    // Run tests
    const { exitCode, output } = await this.runInContainer(workDir, [
      'cargo', 'test', '--', '--nocapture'
    ], { timeout: 120000 }); // Rust compilation is slow

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
    // Build in release mode first
    const buildResult = await this.runInContainer(workDir, [
      'cargo', 'build', '--release'
    ], { timeout: 120000 });

    if (buildResult.exitCode !== 0) {
      throw new Error(`Build failed: ${buildResult.output}`);
    }

    // Create a benchmark binary
    const benchmarkCode = `
use std::time::Instant;

fn main() {
    let mut times = Vec::new();
    
    for _ in 0..${runs} {
        let start = Instant::now();
        // Call solution function here (minimal overhead for now)
        let duration = start.elapsed();
        times.push(duration.as_secs_f64() * 1000.0);
    }
    
    println!("{}", serde_json::to_string(&times).unwrap());
}
`;

    await fs.writeFile(path.join(workDir, 'src', 'main.rs'), benchmarkCode);

    // Run the binary multiple times and measure
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const start = Date.now();
      const { exitCode } = await this.runInContainer(workDir, [
        './target/release/solution'
      ], { captureOutput: false, timeout: 10000 });
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
    // Parse Rust test output
    // Format: "test result: ok. 5 passed; 0 failed"
    const match = output.match(/(\d+)\s+passed;\s+(\d+)\s+failed/);
    
    if (match) {
      const passed = parseInt(match[1]);
      const failed = parseInt(match[2]);
      return { passed, total: passed + failed };
    }

    // Alternative format: count "test ... ok"
    const passedTests = (output.match(/test \w+ \.\.\. ok/g) || []).length;
    return { passed: passedTests, total: passedTests || 1 };
  }
}

