import fs from 'fs/promises';
import path from 'path';
import { BaseHandler } from './base.js';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export class RustHandler extends BaseHandler {
  protected image = 'rust:1.75-slim';

  async validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult> {
    // Strip markdown code fences
    const cleanSolution = this.stripMarkdown(solution);
    const cleanTests = this.stripMarkdown(tests);
    
    // Create Cargo.toml with common dependencies
    const cargoToml = `
[package]
name = "solution"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sha2 = "0.10"
regex = "1.10"
rand = "0.8"
chrono = "0.4"
base64 = "0.21"
hex = "0.4"
uuid = { version = "1.6", features = ["v4"] }
anyhow = "1.0"
thiserror = "1.0"
tokio = { version = "1.35", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
itertools = "0.12"
rayon = "1.8"
lazy_static = "1.4"
once_cell = "1.19"
`;
    await fs.writeFile(path.join(workDir, 'Cargo.toml'), cargoToml.trim());

    // Create src directory
    await fs.mkdir(path.join(workDir, 'src'), { recursive: true });

    // Combine solution and tests in lib.rs
    const libRs = `${cleanSolution}\n\n${cleanTests}`;
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
    // Read test file and extract a representative workload
    const testFilePath = path.join(workDir, 'src', 'lib.rs');
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    // Extract test functions (look for #[test] or #[cfg(test)])
    const testMatches = testContent.match(/#\[test\]\s*fn\s+\w+\s*\(\)\s*\{[\s\S]*?\n\}/g);
    
    if (!testMatches || testMatches.length === 0) {
      throw new Error('No test functions found in Rust code');
    }
    
    // Pick middle test
    const middleIdx = Math.floor(testMatches.length / 2);
    let testFunc = testMatches[middleIdx];
    
    // Extract test body (between { and })
    const bodyMatch = testFunc.match(/\{([\s\S]*)\}/);
    if (!bodyMatch) {
      throw new Error('Could not extract test body');
    }
    
    let workloadCode = bodyMatch[1]
      .replace(/assert.*?;/g, '') // Remove assertions
      .trim();
    
    // Create a benchmark binary that runs the workload N times
    const benchmarkCode = `
use std::time::Instant;
use serde_json;

// Include solution module
mod solution;
use solution::*;

fn main() {
    let mut times = Vec::new();
    
    // Run the workload ${runs} times and measure each execution
    for _ in 0..${runs} {
        let start = Instant::now();
        
        // Run extracted workload
        ${workloadCode}
        
        let duration = start.elapsed();
        times.push(duration.as_secs_f64() * 1000.0); // Convert to milliseconds
    }
    
    // Output as JSON array
    println!("{}", serde_json::to_string(&times).unwrap());
}
`;

    await fs.writeFile(path.join(workDir, 'src', 'main.rs'), benchmarkCode);

    // Build in release mode (optimized)
    const buildResult = await this.runInContainer(workDir, [
      'cargo', 'build', '--release'
    ], { timeout: 120000 });

    if (buildResult.exitCode !== 0) {
      throw new Error(`Build failed: ${buildResult.output}`);
    }

    // Run the benchmark ONCE - it runs the solution N times internally
    const { exitCode, output } = await this.runInContainer(workDir, [
      './target/release/solution'
    ], { timeout: 60000 });

    if (exitCode !== 0) {
      throw new Error(`Benchmark execution failed: ${output}`);
    }

    try {
      const times = JSON.parse(output);
      if (!Array.isArray(times)) {
        throw new Error('Invalid benchmark output format');
      }

      const stats = this.calculateStatistics(times);
      return {
        meanExecutionTime: stats.mean,
        standardDeviation: stats.stdDev,
        executionTimes: times,
      };
    } catch (error) {
      throw new Error(`Failed to parse benchmark results: ${error}`);
    }
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

