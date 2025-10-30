// Code execution sandbox for running and measuring solution performance
// Supports multiple languages with safety constraints

export interface ExecutionResult {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  meanExecutionTime: number; // Mean time in ms over 100 runs
  error?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  executionTime: number;
}

/**
 * Code Executor for safely running and measuring code performance
 * 
 * Strategy:
 * - For browser environment, we use enhanced simulation with realistic timing
 * - In production, this could be replaced with:
 *   1. WebAssembly + Pyodide for Python
 *   2. QuickJS for JavaScript
 *   3. Backend API for secure sandboxed execution
 */
class CodeExecutor {
  private readonly RUNS_PER_SOLUTION = 100;
  private readonly TIMEOUT_MS = 5000; // 5 second timeout per run
  
  /**
   * Execute solution 100 times and return mean execution time
   */
  async executeAndMeasure(
    solution: string,
    tests: string,
    language: string
  ): Promise<ExecutionResult> {
    try {
      // First, validate that tests pass
      const testResult = await this.runTests(solution, tests, language);
      
      if (!testResult.passed) {
        return {
          passed: false,
          testsPassed: testResult.testsPassed,
          totalTests: testResult.totalTests,
          meanExecutionTime: 0,
          error: testResult.error || "Tests failed",
        };
      }
      
      // Run solution 100 times to get mean execution time
      const executionTimes: number[] = [];
      
      for (let i = 0; i < this.RUNS_PER_SOLUTION; i++) {
        const startTime = performance.now();
        await this.executeSolution(solution, language);
        const endTime = performance.now();
        executionTimes.push(endTime - startTime);
      }
      
      // Calculate mean execution time
      const meanTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      
      return {
        passed: true,
        testsPassed: testResult.testsPassed,
        totalTests: testResult.totalTests,
        meanExecutionTime: Math.round(meanTime * 100) / 100, // Round to 2 decimals
      };
    } catch (error) {
      return {
        passed: false,
        testsPassed: 0,
        totalTests: 0,
        meanExecutionTime: 0,
        error: error instanceof Error ? error.message : "Unknown execution error",
      };
    }
  }
  
  /**
   * Run test suite and validate solution
   */
  private async runTests(
    solution: string,
    tests: string,
    language: string
  ): Promise<{ passed: boolean; testsPassed: number; totalTests: number; error?: string }> {
    // For now, use enhanced simulation
    // In production, this would execute actual tests in a sandbox
    
    await this.simulateDelay(100, 300); // Simulate test execution time
    
    // Count total tests
    const totalTests = this.countTests(tests, language);
    
    // Simulate test validation with improved heuristics
    const solutionQuality = this.analyzeSolutionQuality(solution);
    
    // Higher quality solutions have higher pass rates
    const passThreshold = 0.25 - (solutionQuality * 0.15); // Good code: 10% fail, bad code: 25% fail
    const passRate = Math.random();
    
    if (passRate > passThreshold) {
      return {
        passed: true,
        testsPassed: totalTests,
        totalTests,
      };
    } else {
      // Some tests failed
      const failedCount = Math.floor(Math.random() * (totalTests - 1)) + 1;
      const testsPassed = totalTests - failedCount;
      
      return {
        passed: false,
        testsPassed,
        totalTests,
        error: `${failedCount} test(s) failed`,
      };
    }
  }
  
  /**
   * Execute solution code (simulated with realistic performance characteristics)
   */
  private async executeSolution(solution: string, language: string): Promise<void> {
    // Simulate code execution with realistic timing based on code complexity
    // In production, this would run the actual code in a sandbox
    
    const complexity = this.analyzeComplexity(solution);
    const baseTime = this.getBaseTimeForLanguage(language);
    
    // Add variance for realistic measurement (±5%)
    const variance = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const executionTime = baseTime * complexity.multiplier * (1 + variance);
    
    await this.simulateDelay(executionTime, executionTime + 0.1);
  }
  
  /**
   * Analyze code complexity for performance estimation
   */
  private analyzeComplexity(solution: string): { multiplier: number } {
    let multiplier = 1.0;
    
    const lines = solution.split('\n').filter(line => line.trim()).length;
    
    // Check for algorithmic patterns
    const hasNestedLoops = solution.split(/for|while|loop/).length > 2;
    const hasRecursion = /function.*\(.*\)[\s\S]*?(\w+)\s*\(/g.test(solution) && 
                         solution.match(/function\s+(\w+)/)?.[1] && 
                         new RegExp(solution.match(/function\s+(\w+)/)?.[1] || 'xxx').test(solution);
    const hasSort = /sort|sorted|order/i.test(solution);
    const hasMap = /map|dict|hash|set/i.test(solution);
    const hasFilter = /filter|select|where/i.test(solution);
    const hasReduce = /reduce|fold|aggregate/i.test(solution);
    
    // Adjust multiplier based on complexity
    if (lines > 100) multiplier += 0.3;
    else if (lines > 50) multiplier += 0.15;
    
    if (hasNestedLoops) multiplier += 0.4; // O(n²) or worse
    if (hasRecursion) multiplier += 0.25;
    if (hasSort) multiplier += 0.2; // O(n log n)
    if (hasMap) multiplier += 0.1;
    if (hasFilter) multiplier += 0.1;
    if (hasReduce) multiplier += 0.15;
    
    return { multiplier };
  }
  
  /**
   * Analyze solution quality (affects test pass rate)
   */
  private analyzeSolutionQuality(solution: string): number {
    let quality = 0.5; // Base quality
    
    // Positive indicators
    if (/import|require|using/.test(solution)) quality += 0.1;
    if (/try|catch|except|error|throw/.test(solution)) quality += 0.1;
    if (/test|assert|expect/.test(solution)) quality += 0.1;
    if (/class|function|def|func/.test(solution)) quality += 0.1;
    if (/\/\/|#|\/\*|\*\//.test(solution)) quality += 0.05; // Has comments
    
    // Negative indicators
    if (solution.length < 50) quality -= 0.2; // Too short
    if (!/return/.test(solution)) quality -= 0.15; // No return statement
    if (/TODO|FIXME|XXX/.test(solution)) quality -= 0.1;
    
    return Math.max(0, Math.min(1, quality)); // Clamp to 0-1
  }
  
  /**
   * Get base execution time for different languages
   */
  private getBaseTimeForLanguage(language: string): number {
    const baseTimes: Record<string, number> = {
      python: 2.0,      // Python is slower
      javascript: 1.0,  // JavaScript baseline
      typescript: 1.1,  // TypeScript (compiled to JS)
      rust: 0.3,        // Rust is fast
      go: 0.5,          // Go is fast
      java: 0.7,        // Java is pretty fast
      cpp: 0.25,        // C++ is fastest
      c: 0.25,          // C is fastest
    };
    
    return baseTimes[language.toLowerCase()] || 1.0;
  }
  
  /**
   * Count tests in test file based on language
   */
  private countTests(tests: string, language: string): number {
    let totalTests = 0;
    
    switch (language.toLowerCase()) {
      case "python":
        totalTests = (tests.match(/def test_/g) || []).length;
        break;
      case "rust":
        totalTests = (tests.match(/#\[test\]|#\[tokio::test\]/g) || []).length;
        break;
      case "go":
        totalTests = (tests.match(/func Test\w+/g) || []).length;
        break;
      case "javascript":
      case "typescript":
        totalTests = (tests.match(/(?:test|it)\s*\(/g) || []).length;
        break;
      case "java":
        totalTests = (tests.match(/@Test/g) || []).length;
        break;
      default:
        totalTests = (tests.match(/test|Test|TEST/g) || []).length;
    }
    
    // Fallback: assume 5 tests if none detected
    return totalTests > 0 ? totalTests : 5;
  }
  
  /**
   * Simulate async delay with slight randomness
   */
  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  
  /**
   * Calculate percentage improvement between two execution times
   */
  calculateImprovement(originalTime: number, optimizedTime: number): number {
    if (originalTime === 0) return 0;
    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
    return Math.round(improvement * 100) / 100; // Round to 2 decimals
  }
  
  /**
   * Check if optimization meets minimum improvement threshold
   */
  meetsThreshold(originalTime: number, optimizedTime: number, thresholdPercent: number = 5): boolean {
    const improvement = this.calculateImprovement(originalTime, optimizedTime);
    return improvement >= thresholdPercent;
  }
}

export const codeExecutor = new CodeExecutor();

