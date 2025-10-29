import { openRouterClient, AVAILABLE_MODELS } from "./openRouterClient";
import { projectManager } from "./projectManager";
import { detectLanguageWithAI, getLanguageConfig } from "./languageConfig";

export interface ModelResult {
  model: string;
  modelName: string;
  status: "running" | "passed" | "failed" | "error";
  solution?: string;
  error?: string;
  timestamp: number;
  duration?: number; // Code execution time (simulated)
  aiResponseTime?: number; // AI generation time
  testsPassed?: number;
  totalTests?: number;
}

export interface CompetitionResult {
  winner: ModelResult | null;
  results: ModelResult[];
  totalDuration: number;
}

export const competitionManager = {
  async runCompetition(
    selectedModels: string[],
    onProgress: (result: ModelResult) => void,
    options?: {
      optimizeLatency?: boolean;
      optimizeMemory?: boolean;
      previousSolution?: string;
    }
  ): Promise<CompetitionResult> {
    const description = projectManager.getFile("descriptions.md");
    
    if (!description) {
      throw new Error("Missing description. Run 'phronos init' first.");
    }

    // Detect language and get config
    const language = await detectLanguageWithAI(description);
    const config = getLanguageConfig(language);
    
    // Get tests from the language-specific path
    const tests = projectManager.getFile(config.testFilePattern);

    if (!tests) {
      throw new Error(`Missing tests at ${config.testFilePattern}. Run 'phronos compile' first.`);
    }

    const startTime = Date.now();
    const results: ModelResult[] = [];
    let winner: ModelResult | null = null;

    const promises = selectedModels.map(async (modelId) => {
      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!model) return;

      const result: ModelResult = {
        model: modelId,
        modelName: model.name,
        status: "running",
        timestamp: Date.now(),
      };

      onProgress(result);

      try {
        const aiStartTime = Date.now();
        
        // Build the prompt based on whether this is an optimization run
        let systemPrompt = `You are a ${config.name} coding expert. Write code that passes all the given tests. Return ONLY the code implementation with proper imports, no explanations or markdown.`;
        let userPrompt = `Task Description:\n${description}\n\nTests to Pass (${config.testFramework}):\n${tests}\n\nProvide the ${config.name} solution code:`;
        
        const isOptimization = (options?.optimizeLatency || options?.optimizeMemory) && options?.previousSolution;
        
        if (isOptimization) {
          const goals: string[] = [];
          if (options.optimizeLatency) goals.push("lower latency (faster execution time)");
          if (options.optimizeMemory) goals.push("lower memory footprint (less memory usage)");
          const goalsText = goals.join(" and ");
          
          systemPrompt = `You are a ${config.name} coding expert specializing in code optimization. You will be given a working solution and your goal is to optimize it for ${goalsText}. The optimized code MUST still pass all tests. Return ONLY the optimized code implementation with proper imports, no explanations or markdown.`;
          
          userPrompt = `Task Description:\n${description}\n\nTests to Pass (${config.testFramework}):\n${tests}\n\nPrevious Working Solution:\n${options.previousSolution}\n\nOptimize this ${config.name} solution for ${goalsText}. Ensure all tests still pass:`;
        }
        
        const response = await openRouterClient.complete({
          model: modelId,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const solution = response.choices[0].message.content;
        const aiResponseTime = Date.now() - aiStartTime;

        // Simulate test validation (in real scenario, this would run actual tests)
        const testResult = await this.simulateTestRun(solution, tests);
        
        // Simulate code execution time based on solution quality
        const executionTime = this.simulateExecutionTime(solution, isOptimization);

        result.solution = solution;
        result.status = testResult.passed ? "passed" : "failed";
        result.duration = executionTime; // Code execution time
        result.aiResponseTime = aiResponseTime; // AI generation time
        result.testsPassed = testResult.testsPassed;
        result.totalTests = testResult.totalTests;
        result.error = testResult.passed ? undefined : "Tests failed";

        // Update winner if this is faster (among passing solutions)
        if (testResult.passed) {
          if (!winner || (executionTime < (winner.duration || Infinity))) {
            winner = result;
          }
        }

        onProgress(result);
        results.push(result);
      } catch (error) {
        result.status = "error";
        result.error = error instanceof Error ? error.message : "Unknown error";
        onProgress(result);
        results.push(result);
      }
    });

    await Promise.all(promises);

    const totalDuration = Date.now() - startTime;

    // Save winner if found
    if (winner) {
      const project = projectManager.getProject();
      if (project) {
        project.lastWinner = {
          model: winner.modelName,
          timestamp: new Date(winner.timestamp).toISOString(),
        };
        projectManager.saveFile("descriptions.md", description);
      }
    }

    return {
      winner,
      results,
      totalDuration,
    };
  },

  simulateExecutionTime(solution: string, isOptimization: boolean): number {
    // Simulate code execution time based on code complexity
    // In production, this would actually run the code and measure performance
    
    // Base time range
    let baseTime = 50 + Math.random() * 100; // 50-150ms base
    
    // Analyze code complexity (simple heuristics)
    const lines = solution.split('\n').length;
    const hasLoops = /for|while|loop|each|map|filter|reduce/i.test(solution);
    const hasRecursion = /function.*\(.*\)[\s\S]*?\1\s*\(/i.test(solution);
    const hasNestedLoops = solution.split(/for|while/).length > 2;
    
    // Add time based on complexity
    if (lines > 50) baseTime += 30;
    if (lines > 100) baseTime += 50;
    if (hasLoops) baseTime += 20;
    if (hasNestedLoops) baseTime += 50;
    if (hasRecursion) baseTime += 30;
    
    // If this is an optimization run, make it 15-30% faster
    if (isOptimization) {
      const improvement = 0.15 + Math.random() * 0.15; // 15-30% improvement
      baseTime = baseTime * (1 - improvement);
    }
    
    // Round to nearest millisecond
    return Math.round(baseTime);
  },

  async simulateTestRun(solution: string, tests: string): Promise<{ passed: boolean; testsPassed: number; totalTests: number }> {
    // Simulate test execution with random success
    // In production, this would use a sandboxed test runner
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Count tests in the test file - support multiple languages
    let totalTests = 0;
    
    // Python: def test_
    totalTests = (tests.match(/def test_/g) || []).length;
    
    // If no Python tests, try other patterns
    if (totalTests === 0) {
      // Rust: #[test] or #[tokio::test]
      totalTests = (tests.match(/#\[test\]|#\[tokio::test\]/g) || []).length;
    }
    
    if (totalTests === 0) {
      // Go: func Test
      totalTests = (tests.match(/func Test\w+/g) || []).length;
    }
    
    if (totalTests === 0) {
      // JavaScript/TypeScript: test( or it(
      totalTests = (tests.match(/(?:test|it)\s*\(/g) || []).length;
    }
    
    if (totalTests === 0) {
      // Java: @Test
      totalTests = (tests.match(/@Test/g) || []).length;
    }
    
    // Fallback: assume 5 tests if none detected
    if (totalTests === 0) {
      totalTests = 5;
    }
    
    // For demo purposes, randomly determine how many tests pass (70% overall pass rate)
    const passRate = Math.random();
    const testsPassed = passRate > 0.3 ? totalTests : Math.floor(Math.random() * totalTests);
    const passed = testsPassed === totalTests;
    
    return { passed, testsPassed, totalTests };
  },

  async adoptSolution(modelResult: ModelResult): Promise<void> {
    if (!modelResult.solution) {
      throw new Error("No solution to adopt");
    }

    // Detect language and save to appropriate file
    const description = projectManager.getFile("descriptions.md");
    if (!description) {
      throw new Error("Missing description");
    }
    
    const language = await detectLanguageWithAI(description);
    const config = getLanguageConfig(language);
    
    projectManager.saveFile(config.solutionFilePattern, modelResult.solution);
  },
};
