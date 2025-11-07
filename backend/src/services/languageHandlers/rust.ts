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
    const solutionWithoutTests = this.removeTestsModules(cleanSolution);
    
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

    // Ensure tests are in a proper #[cfg(test)] mod tests { ... } block and braces are balanced
    let fixedTests = cleanTests.trim();
    if (fixedTests) {
      if (!/mod\s+tests\s*\{/.test(fixedTests)) {
        fixedTests = `#[cfg(test)]
mod tests {
    use super::*;
${fixedTests}
}`;
      }
      const opens = (fixedTests.match(/\{/g) || []).length;
      const closes = (fixedTests.match(/\}/g) || []).length;
      if (opens > closes) {
        fixedTests += '\n' + '}'.repeat(opens - closes) + '\n';
      }
    }

    // Combine solution and tests in lib.rs
    const libRs = `${solutionWithoutTests}\n\n${fixedTests}`;
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
    try {
      // For Rust, extract first function call from first test
      const testFilePath = path.join(workDir, 'src', 'lib.rs');
      const testContent = await fs.readFile(testFilePath, 'utf-8');
      
    // Find first function (public or private)
    const funcMatch = testContent.match(/(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)/);
      if (!funcMatch) {
      console.log('  → No function found, skipping performance measurement');
        return { meanExecutionTime: 0, standardDeviation: 0, executionTimes: [] };
      }
      
      const funcName = funcMatch[1];
      const funcParams = funcMatch[2];
      
      // Find ANY call to this function in the tests
      const callPattern = new RegExp(`${funcName}\\s*\\([^)]*\\)`, 'm');
      const callMatch = testContent.match(callPattern);
      
      let benchmarkCall;
      if (callMatch) {
        benchmarkCall = callMatch[0];
      } else {
        // Generate a default call based on parameters
        if (funcParams.includes('&str')) {
          benchmarkCall = `${funcName}("")`;
        } else if (funcParams.includes('usize') || funcParams.includes('i32')) {
          benchmarkCall = `${funcName}(0)`;
        } else {
          benchmarkCall = `${funcName}()`;
        }
      }
      
      // Create benchmark module with unique name to avoid conflicts
      const benchmarkCode = `

#[cfg(test)]
mod perf_benchmark {
    use super::*;
    use std::time::Instant;
    
    #[test]
    #[ignore]
    fn measure_perf() {
        // Warmup
        for _ in 0..10 {
            let _ = ${benchmarkCall};
        }
        
        // Benchmark
        let mut times = Vec::new();
        for _ in 0..${runs} {
            let start = Instant::now();
            let _ = ${benchmarkCall};
            let duration = start.elapsed();
            times.push(duration.as_secs_f64() * 1000.0);
        }
        
        // Print results with clear markers
        eprint!("BENCH_START:");
        for (i, t) in times.iter().enumerate() {
            if i > 0 { eprint!(","); }
            eprint!("{}", t);
        }
        eprintln!(":BENCH_END");
    }
}
`;

      await fs.appendFile(testFilePath, benchmarkCode);

      // Run benchmark
      const { exitCode, output } = await this.runInContainer(workDir, [
        'cargo', 'test', '--release', 'measure_perf', '--', '--nocapture', '--ignored'
      ], { timeout: 120000 });

      if (exitCode !== 0) {
        console.log(`  → Benchmark compilation failed, skipping performance measurement`);
        console.log(`  → Error: ${output.slice(-500)}`);
        return { meanExecutionTime: 0, standardDeviation: 0, executionTimes: [] };
      }

      // Parse results
      const resultsMatch = output.match(/BENCH_START:([\d.,]+):BENCH_END/);
      if (!resultsMatch) {
        console.log(`  → Could not parse benchmark results, skipping performance measurement`);
        return { meanExecutionTime: 0, standardDeviation: 0, executionTimes: [] };
      }

      const times = resultsMatch[1].split(',').map(t => parseFloat(t));
      const stats = this.calculateStatistics(times);
      
      return {
        meanExecutionTime: stats.mean,
        standardDeviation: stats.stdDev,
        executionTimes: times,
      };
    } catch (error) {
      console.log(`  → Performance measurement error: ${error}`);
      return { meanExecutionTime: 0, standardDeviation: 0, executionTimes: [] };
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

  /**
   * Remove any #[cfg(test)] mod tests { ... } blocks from a Rust source string.
   * This prevents duplicate test modules when we append tests ourselves.
   */
  private removeTestsModules(content: string): string {
    let code = content;
    const findNextTestsModule = (startIdx: number) => {
      // Prefer to start from #[cfg(test)] if present just before mod tests
      const cfgIdx = code.indexOf('#[cfg(test)]', startIdx);
      const modIdx = code.indexOf('mod tests', startIdx);
      if (modIdx === -1) return null;
      let start = modIdx;
      if (cfgIdx !== -1 && cfgIdx < modIdx) {
        // Ensure there's no other code between cfg and mod
        const between = code.slice(cfgIdx + '#[cfg(test)]'.length, modIdx);
        if (!/\S/.test(between)) {
          start = cfgIdx;
        }
      }
      // Find the opening brace after "mod tests"
      const braceIdx = code.indexOf('{', modIdx);
      if (braceIdx === -1) {
        // No brace - treat the "mod tests" token as removable line
        return { start, end: modIdx + 'mod tests'.length };
      }
      // Walk to matching closing brace
      let depth = 0;
      for (let i = braceIdx; i < code.length; i++) {
        const ch = code[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            return { start, end: i + 1 };
          }
        }
      }
      // If unmatched, remove until end of file to avoid partial module
      return { start, end: code.length };
    };
    // Remove all test modules
    let pos = 0;
    while (true) {
      const span = findNextTestsModule(pos);
      if (!span) break;
      code = code.slice(0, span.start) + code.slice(span.end);
      pos = span.start;
    }
    return code.trim();
  }
}

