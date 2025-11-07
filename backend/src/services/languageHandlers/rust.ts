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
    
    // Balance braces in solution to auto-heal common "unclosed delimiter" issues
    const balanceBraces = (src: string) => {
      const opens = (src.match(/\{/g) || []).length;
      const closes = (src.match(/\}/g) || []).length;
      return opens > closes ? src + '\n' + '}'.repeat(opens - closes) + '\n' : src;
    };
    const balancedSolution = balanceBraces(solutionWithoutTests);
    // Auto-fix common iterator typo: `.count` → `.count()` (only when missing parentheses)
    const fixedSolution = balancedSolution.replace(/\.count\b(?!\s*\()/g, '.count()');

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
    const libRs = `${fixedSolution}\n\n${fixedTests}`;
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
      
      // Helper: extract only the tests module body to avoid matching signatures in solution
      const extractTestsBody = (src: string): string | null => {
        const modIdx = src.indexOf('mod tests');
        if (modIdx === -1) return null;
        const braceIdx = src.indexOf('{', modIdx);
        if (braceIdx === -1) return null;
        let depth = 0;
        for (let i = braceIdx; i < src.length; i++) {
          const ch = src[i];
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              return src.slice(braceIdx + 1, i);
            }
          }
        }
        return null;
      };

      const testsBody = extractTestsBody(testContent) ?? testContent;

      // Try to extract a call from assert_eq!(func(...), ...)
      let benchmarkCall: string | undefined;
      const assertCallRe = new RegExp(`assert_eq!\\s*\\(\\s*${funcName}\\s*\\([^)]*\\)`, 'm');
      const assertMatch = testsBody.match(assertCallRe);
      if (assertMatch) {
        const inner = assertMatch[0];
        const callOnly = inner.replace(/assert_eq!\s*\(\s*/, '').replace(/,\s*.*$/, '');
        benchmarkCall = callOnly.trim();
      }

      // Fallback: any func(...) occurrence inside tests, but exclude signatures (fn ...), types (: or ->)
      if (!benchmarkCall) {
        const callPattern = new RegExp(`${funcName}\\s*\\([^)]*\\)`, 'gm');
        for (const m of testsBody.matchAll(callPattern) as any) {
          const text = m[0] as string;
          const idx = (m.index as number) ?? 0;
          const before = testsBody.slice(Math.max(0, idx - 20), idx);
          const looksLikeSignature = /\bfn\s*$/.test(before) || text.includes(':') || text.includes('->');
          if (!looksLikeSignature) {
            benchmarkCall = text;
            break;
          }
        }
      }

      // Last resort: synthesize default args from parameter types
      if (!benchmarkCall) {
        const params = funcParams.split(',').map(p => p.trim()).filter(Boolean);
        const argFor = (p: string) => {
          if (p.includes('&str')) return '""';
          if (/(^|\\b)(u|i)(8|16|32|64|128|size)(\\b|$)/.test(p)) return '0';
          if (p.includes('bool')) return 'false';
          return 'Default::default()';
        };
        const args = params.map(argFor).join(', ');
        benchmarkCall = `${funcName}(${args})`;
      }
      
      // Create benchmark module with unique name to avoid conflicts
      const benchmarkCode = `

#[cfg(test)]
mod perf_benchmark {
    use super::*;
    use std::time::Instant;
    use serde_json::json;
    use std::hint::black_box;
    
    #[test]
    #[ignore]
    fn measure_perf() {
        // Warmup
        for _ in 0..10 {
            let _ = black_box(${benchmarkCall});
        }

        // Calibrate repeats to ~20ms per batch (cap at 1_000_000)
        let mut repeats: usize = 1;
        loop {
            let start = Instant::now();
            for _ in 0..repeats {
                let _ = black_box(${benchmarkCall});
            }
            let elapsed = start.elapsed();
            if elapsed.as_millis() >= 20 || repeats >= 1_000_000 {
                break;
            }
            repeats *= 10;
        }

        // Benchmark: record per-call ms
        let mut times = Vec::new();
        for _ in 0..${runs} {
            let start = Instant::now();
            for _ in 0..repeats {
                let _ = black_box(${benchmarkCall});
            }
            let duration = start.elapsed();
            times.push((duration.as_secs_f64() * 1000.0) / repeats as f64);
        }
        
        // Print results in a single JSON line to stdout for reliable parsing
        let payload = json!({ "times": times });
        println!("BENCHMARK_RESULTS_JSON:{}", serde_json::to_string(&payload).unwrap());
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

      // Parse results from JSON line
      let times: number[] | undefined;
      const jsonMatch = output.match(/BENCHMARK_RESULTS_JSON:(\{[\s\S]*?\})/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed && Array.isArray(parsed.times)) {
            times = parsed.times.map((t: any) => Number(t));
          }
        } catch {
          // fallthrough to skip
        }
      }
      if (!times) {
        console.log(`  → Could not parse benchmark results, skipping performance measurement`);
        return { meanExecutionTime: 0, standardDeviation: 0, executionTimes: [] };
      }
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

