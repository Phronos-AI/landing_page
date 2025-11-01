// Code execution backend client for real Docker-based code execution

export interface ExecutionResult {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  meanExecutionTime: number; // Mean time in ms over 100 runs
  standardDeviation?: number;
  error?: string;
  output?: string;
}

/**
 * Code Executor - calls backend API for real code execution in Docker containers
 */
class CodeExecutor {
  private readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  private readonly RUNS_PER_SOLUTION = 100;
  
  /**
   * Execute solution with real Docker containers and measure performance
   */
  async executeAndMeasure(
    solution: string,
    tests: string,
    language: string
  ): Promise<ExecutionResult> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/execute/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solution,
          tests,
          language,
          runs: this.RUNS_PER_SOLUTION,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execution failed');
      }

      const result: ExecutionResult = await response.json();
      return result;
    } catch (error) {
      return {
        passed: false,
        testsPassed: 0,
        totalTests: 0,
        meanExecutionTime: 0,
        error: error instanceof Error ? error.message : 'Backend connection error. Is the backend running?',
      };
    }
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

