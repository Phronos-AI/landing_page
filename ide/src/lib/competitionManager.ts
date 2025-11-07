import { openRouterClient, AVAILABLE_MODELS } from "./openRouterClient";
import { projectManager } from "./projectManager";
import { detectLanguageWithAI, getLanguageConfig } from "./languageConfig";
import { codeExecutor } from "./codeExecutor";

export interface ModelResult {
  model: string;
  modelName: string;
  status: "running" | "passed" | "failed" | "error";
  solution?: string;
  error?: string;
  timestamp: number;
  meanExecutionTime?: number; // Mean of 100 runs in ms
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
        
        // Build the input for backend: keep tests separate; send clean description (optionally with previous solution)
        const isOptimization = options?.optimizeLatency && options?.previousSolution;
        const finalDescription = isOptimization
          ? `${description}\n\nPREVIOUS_SOLUTION:\n${options.previousSolution}`
          : description;
        
        // Generate solution via backend (secure API key handling). Backend formats prompts and appends tests once.
        const solution = await openRouterClient.generateSolution(finalDescription, tests, modelId);
        const aiResponseTime = Date.now() - aiStartTime;

        // Execute and measure solution with real code execution (100 runs for mean)
        const executionResult = await codeExecutor.executeAndMeasure(
          solution,
          tests,
          language
        );

        result.solution = solution;
        result.status = executionResult.passed ? "passed" : "failed";
        result.meanExecutionTime = executionResult.meanExecutionTime;
        result.aiResponseTime = aiResponseTime;
        result.testsPassed = executionResult.testsPassed;
        result.totalTests = executionResult.totalTests;
        result.error = executionResult.passed ? undefined : executionResult.error;

        // Update winner if this is faster (among passing solutions)
        if (executionResult.passed) {
          if (!winner || (executionResult.meanExecutionTime < (winner.meanExecutionTime || Infinity))) {
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
