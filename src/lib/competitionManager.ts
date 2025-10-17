import { openRouterClient, AVAILABLE_MODELS } from "./openRouterClient";
import { projectManager } from "./projectManager";

export interface ModelResult {
  model: string;
  modelName: string;
  status: "running" | "passed" | "failed" | "error";
  solution?: string;
  error?: string;
  timestamp: number;
  duration?: number;
}

export interface CompetitionResult {
  winner: ModelResult | null;
  results: ModelResult[];
  totalDuration: number;
}

export const competitionManager = {
  async runCompetition(
    selectedModels: string[],
    onProgress: (result: ModelResult) => void
  ): Promise<CompetitionResult> {
    const description = projectManager.getFile("descriptions.md");
    const tests = projectManager.getFile("tests/test_solution.py");

    if (!description || !tests) {
      throw new Error("Missing description or tests. Run 'phronos compile' first.");
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
        const solutionStartTime = Date.now();
        
        const response = await openRouterClient.complete({
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are a coding expert. Write code that passes all the given tests. Return ONLY the code implementation, no explanations or markdown.",
            },
            {
              role: "user",
              content: `Task Description:\n${description}\n\nTests to Pass:\n${tests}\n\nProvide the solution code:`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const solution = response.choices[0].message.content;
        const duration = Date.now() - solutionStartTime;

        // Simulate test validation (in real scenario, this would run actual tests)
        const passed = await this.simulateTestRun(solution, tests);

        result.solution = solution;
        result.status = passed ? "passed" : "failed";
        result.duration = duration;
        result.error = passed ? undefined : "Tests failed";

        if (passed && !winner) {
          winner = result;
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

  async simulateTestRun(solution: string, tests: string): Promise<boolean> {
    // Simulate test execution with random success
    // In production, this would use a sandboxed Python runner
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // For demo purposes, randomly pass/fail (70% pass rate)
    // In real implementation, this would execute tests in a secure sandbox
    return Math.random() > 0.3;
  },

  async adoptSolution(modelResult: ModelResult): Promise<void> {
    if (!modelResult.solution) {
      throw new Error("No solution to adopt");
    }

    projectManager.saveFile("src/solution.py", modelResult.solution);
  },
};
