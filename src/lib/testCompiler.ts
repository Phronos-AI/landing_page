import { openRouterClient } from "./openRouterClient";
import { projectManager } from "./projectManager";

export interface CompileResult {
  success: boolean;
  message: string;
  testsGenerated: number;
}

export const testCompiler = {
  async compile(): Promise<CompileResult> {
    const description = projectManager.getFile("descriptions.md");
    
    if (!description) {
      return {
        success: false,
        message: "No descriptions.md found. Run 'phronos init' first.",
        testsGenerated: 0,
      };
    }

    try {
      const tests = await openRouterClient.generateTests(description);
      
      // Save generated tests
      projectManager.saveFile("tests/test_solution.py", tests);
      
      return {
        success: true,
        message: "Compiled descriptions into unit tests.",
        testsGenerated: 1,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to compile: ${error instanceof Error ? error.message : "Unknown error"}`,
        testsGenerated: 0,
      };
    }
  },

  async syncDescriptionFromTests(): Promise<CompileResult> {
    const tests = projectManager.getFile("tests/test_solution.py");
    
    if (!tests) {
      return {
        success: false,
        message: "No tests found to sync from.",
        testsGenerated: 0,
      };
    }

    try {
      const response = await openRouterClient.complete({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a documentation expert. Given test code, write a clear task description in markdown. Return ONLY the description.",
          },
          {
            role: "user",
            content: `Generate a task description for these tests:\n\n${tests}`,
          },
        ],
      });

      const description = response.choices[0].message.content;
      projectManager.saveFile("descriptions.md", description);

      return {
        success: true,
        message: "Synced descriptions.md from tests.",
        testsGenerated: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to sync: ${error instanceof Error ? error.message : "Unknown error"}`,
        testsGenerated: 0,
      };
    }
  },
};
