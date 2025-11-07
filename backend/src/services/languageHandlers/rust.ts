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
    
    // Create Cargo.toml with essential lightweight dependencies
    // NOTE: Avoiding heavy crates like tokio/reqwest to prevent compilation timeouts
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
base64 = "0.21"
hex = "0.4"
itertools = "0.12"
`;
    await fs.writeFile(path.join(workDir, 'Cargo.toml'), cargoToml.trim());

    // Create src directory
    await fs.mkdir(path.join(workDir, 'src'), { recursive: true });

    // Combine solution and tests in lib.rs
    const libRs = `${cleanSolution}\n\n${cleanTests}`;
    await fs.writeFile(path.join(workDir, 'src', 'lib.rs'), libRs);

    // Run tests with longer timeout for first-time dependency compilation
    const { exitCode, output } = await this.runInContainer(workDir, [
      'cargo', 'test', '--', '--nocapture'
    ], { timeout: 180000 }); // 3 minutes for dependency download + compilation

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
    // For Rust, we'll create a simple benchmark that calls a main function
    // Extract the first public function from solution
    const testFilePath = path.join(workDir, 'src', 'lib.rs');
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    // Find the first public function to benchmark
    const funcMatch = testContent.match(/pub\s+fn\s+(\w+)\s*\([^)]*\)/);
    if (!funcMatch) {
      throw new Error('No public function found to benchmark');
    }
    
    const funcName = funcMatch[1];
    
    // Try to extract a simple test call to this function
    const testCallMatch = testContent.match(new RegExp(`let\\s+\\w+\\s*=\\s*${funcName}\\s*\\([^)]*\\)`, 'g'));
    let benchmarkCall = testCallMatch ? testCallMatch[0] : `let _ = ${funcName}("")`;
    
    // Remove let statement, just keep the function call
    benchmarkCall = benchmarkCall.replace(/let\s+\w+\s*=\s*/, '');
    
    // Append benchmark code to lib.rs
    const benchmarkCode = `

#[cfg(test)]
mod benchmark {
    use super::*;
    use std::time::Instant;
    
    #[test]
    #[ignore] // Ignored by default test runs
    fn benchmark_performance() {
        let mut times = Vec::new();
        
        // Warmup
        for _ in 0..10 {
            ${benchmarkCall};
        }
        
        // Actual benchmark
        for _ in 0..${runs} {
            let start = Instant::now();
            ${benchmarkCall};
            let duration = start.elapsed();
            times.push(duration.as_secs_f64() * 1000.0);
        }
        
        // Output results
        let json = format!("BENCHMARK_RESULTS:{}", 
            times.iter()
                .map(|t| t.to_string())
                .collect::<Vec<_>>()
                .join(",")
        );
        println!("{}", json);
    }
}
`;

    // Append benchmark to lib.rs
    await fs.appendFile(testFilePath, benchmarkCode);

    // Run the benchmark test
    const { exitCode, output } = await this.runInContainer(workDir, [
      'cargo', 'test', '--release', 'benchmark_performance', '--', '--nocapture', '--ignored'
    ], { timeout: 120000 });

    if (exitCode !== 0) {
      throw new Error(`Benchmark failed: ${output}`);
    }

    // Parse results from output
    const resultsMatch = output.match(/BENCHMARK_RESULTS:([\d.,]+)/);
    if (!resultsMatch) {
      throw new Error('Could not find benchmark results in output');
    }

    const times = resultsMatch[1].split(',').map(t => parseFloat(t));
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

