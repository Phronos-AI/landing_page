import { openRouterClient } from "./openRouterClient";
import { projectManager } from "./projectManager";
import { detectLanguageWithAI, getLanguageConfig } from "./languageConfig";
import { generateFlakeNix } from "./flakeGenerator";

export interface CompileResult {
  success: boolean;
  message: string;
  testsGenerated: number;
  language?: string;
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
      // Detect language from description using AI
      const language = await detectLanguageWithAI(description);
      const config = getLanguageConfig(language);
      
      // Generate flake.nix with appropriate packages
      const flakeContent = generateFlakeNix(language);
      projectManager.saveFile("flake.nix", flakeContent);
      
      // Generate language-specific tests
      const tests = await openRouterClient.generateTests(description, language);
      
      // Save generated tests
      projectManager.saveFile(config.testFilePattern, tests);
      
      return {
        success: true,
        message: `Compiled for ${config.name}. Generated ${config.testFramework} tests and flake.nix.`,
        testsGenerated: 1,
        language: language,
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
        model: "anthropic/claude-sonnet-4.5",
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
