import { useState, useEffect, useRef } from "react";
import { terminal, TerminalLine } from "@/lib/terminalRenderer";
import { projectManager } from "@/lib/projectManager";
import { testCompiler } from "@/lib/testCompiler";
import { competitionManager, ModelResult } from "@/lib/competitionManager";
import { openRouterClient, AVAILABLE_MODELS } from "@/lib/openRouterClient";
import { chatManager } from "@/lib/chatManager";
import { detectLanguageWithAI, getLanguageConfig } from "@/lib/languageConfig";
import { codeExecutor } from "@/lib/codeExecutor";
import { cn } from "@/lib/utils";

type OptimizationState = {
  stage: "latency_question" | null;
  winningSolution: string | null;
  originalMeanTime: number | null;
  modelIds: string[]; // Will contain ALL model IDs for optimization
};

interface TerminalProps {
  onCloseAllTabs: () => void;
  projectName: string;
}

export function Terminal({ onCloseAllTabs, projectName }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    stage: null,
    winningSolution: null,
    originalMeanTime: null,
    modelIds: [],
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = terminal.subscribe(setLines);
    terminal.addInfo("Phronos IDE v1.0.0 - Type 'help' for available commands");
    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Check if we're waiting for optimization response
    if (optimizationState.stage !== null) {
      await handleOptimizationResponse(trimmed);
      return;
    }

    terminal.addCommand(trimmed);
    setIsProcessing(true);

    const parts = trimmed.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    // Clear input immediately
    setInput("");

    try {
      switch (command) {
        case "help":
          terminal.addOutput("Available commands:");
          terminal.addOutput("  phronos init              - Initialize new project");
          terminal.addOutput("  phronos examples          - List available example projects");
          terminal.addOutput("  phronos load <example>    - Load an example project");
          terminal.addOutput("  phronos compile           - Generate tests from descriptions");
          terminal.addOutput("  phronos run [models...]   - Run competition with selected models");
          terminal.addOutput("  phronos clean             - Clear project");
          terminal.addOutput("  clear                     - Clear terminal");
          terminal.addOutput("  help                      - Show this help");
          break;

        case "clear":
          terminal.clear();
          break;

        case "phronos":
          await handlePhronosCommand(args);
          break;

        default:
          terminal.addError(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      terminal.addError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
      // Re-focus the input after command execution
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleOptimizationResponse = async (response: string) => {
    const answer = response.trim().toLowerCase();
    terminal.addCommand(response);
    setInput("");
    
    if (answer !== "yes" && answer !== "no") {
      terminal.addError("Please answer 'yes' or 'no'");
      return;
    }

    const answerBool = answer === "yes";

    // Handle the latency optimization question
    if (optimizationState.stage === "latency_question") {
      // If user said no, skip optimization
      if (!answerBool) {
        terminal.addOutput("");
        terminal.addInfo("No optimization selected. Competition complete!");
        setOptimizationState({
          stage: null,
          winningSolution: null,
          originalMeanTime: null,
          modelIds: [],
        });
        return;
      }

      // Run optimization with ALL models
      setIsProcessing(true);

      try {
        terminal.addOutput("");
        terminal.addInfo(`Running optimization with all models for lower latency...`);
        terminal.addOutput("");
        terminal.addInfo(`Original winner: ${optimizationState.originalMeanTime}ms mean execution time`);
        terminal.addOutput("");

        const competitionResult = await competitionManager.runCompetition(
          optimizationState.modelIds, // Contains ALL model IDs
          () => {},
          {
            optimizeLatency: true,
            previousSolution: optimizationState.winningSolution!,
          }
        );

        // Display results table
        terminal.addOutput("");
        terminal.addInfo("Optimization Results:");
        terminal.addOutput("─".repeat(90));
        terminal.addOutput(
          `${"Model".padEnd(25)} | ${"Tests".padEnd(10)} | ${"Mean Time".padEnd(12)} | ${"Improvement".padEnd(15)} | Status`
        );
        terminal.addOutput("─".repeat(90));

        competitionResult.results.forEach((result) => {
          const testsInfo = result.totalTests 
            ? `${result.testsPassed}/${result.totalTests}`
            : "N/A";
          const timeInfo = result.meanExecutionTime 
            ? `${result.meanExecutionTime.toFixed(2)}ms` 
            : "N/A";
          const originalTime = optimizationState.originalMeanTime || 0;
          const improvement = result.meanExecutionTime && originalTime > 0
            ? codeExecutor.calculateImprovement(originalTime, result.meanExecutionTime)
            : 0;
          const improvementText = improvement > 0 
            ? `${improvement.toFixed(1)}% faster`
            : improvement < 0 
            ? `${Math.abs(improvement).toFixed(1)}% slower`
            : "no change";
          const status = result.status === "passed" ? "PASSED" : 
                        result.status === "failed" ? "FAILED" : "ERROR";
          
          terminal.addOutput(
            `${result.modelName.padEnd(25)} | ${testsInfo.padEnd(10)} | ${timeInfo.padEnd(12)} | ${improvementText.padEnd(15)} | ${status}`
          );
        });

        terminal.addOutput("─".repeat(90));
        terminal.addOutput("");

        if (competitionResult.winner) {
          const originalTime = optimizationState.originalMeanTime || 0;
          const optimizedTime = competitionResult.winner.meanExecutionTime || 0;
          
          // Check if optimization meets 5% threshold
          const meetsThreshold = codeExecutor.meetsThreshold(originalTime, optimizedTime, 5);
          const improvement = codeExecutor.calculateImprovement(originalTime, optimizedTime);
          
          if (meetsThreshold) {
            terminal.addSuccess(
              `Optimization accepted: ${optimizedTime.toFixed(2)}ms (${improvement.toFixed(1)}% improvement)`
            );
            
            await competitionManager.adoptSolution(competitionResult.winner);
            
            // Get the correct solution file path based on language
            const description = projectManager.getFile("descriptions.md");
            const language = description ? await detectLanguageWithAI(description) : "python";
            const config = getLanguageConfig(language);
            
            terminal.addSuccess(`Solution from ${competitionResult.winner.modelName} saved to ${config.solutionFilePattern}`);
          } else {
            terminal.addInfo(
              `Optimization < 5% (${improvement.toFixed(1)}%), keeping original solution`
            );
            terminal.addInfo(`Original: ${originalTime.toFixed(2)}ms → Optimized: ${optimizedTime.toFixed(2)}ms`);
          }
        } else {
          terminal.addError(`Optimization failed - no model passed all tests`);
        }

        terminal.addOutput("");
        terminal.addSuccess("Optimization process complete!");
      } catch (error) {
        terminal.addError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setOptimizationState({
          stage: null,
          winningSolution: null,
          originalMeanTime: null,
          modelIds: [],
        });
        setIsProcessing(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
  };

  const handlePhronosCommand = async (args: string[]) => {
    const subcommand = args[0];

    switch (subcommand) {
      case "init": {
        const result = projectManager.init();
        if (result.success) {
          terminal.addSuccess(result.message);
          result.filesCreated.forEach((file) => {
            terminal.addOutput(`  Created: ${file}`);
          });
        } else {
          terminal.addError(result.message);
        }
        break;
      }

      case "compile": {
        if (!openRouterClient.hasApiKey()) {
          terminal.addError("OpenRouter API key not configured. Please set it in settings.");
          break;
        }
        terminal.addInfo("Compiling descriptions into tests...");
        const result = await testCompiler.compile();
        if (result.success) {
          terminal.addSuccess(result.message);
        } else {
          terminal.addError(result.message);
        }
        break;
      }

      case "run": {
        if (!openRouterClient.hasApiKey()) {
          terminal.addError("OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in .env file.");
          break;
        }

        const selectedModels = args.slice(1);
        const modelsToRun = selectedModels.length > 0
          ? selectedModels
          : AVAILABLE_MODELS.map((m) => m.id);

        // Show which models are competing
        const modelNames = modelsToRun
          .map((id) => AVAILABLE_MODELS.find((m) => m.id === id)?.name)
          .filter(Boolean)
          .join(", ");
        
        terminal.addInfo(`Starting competition with models: ${modelNames}`);
        terminal.addOutput("");
        
        const results: ModelResult[] = [];
        
        const competitionResult = await competitionManager.runCompetition(
          modelsToRun,
          (result) => {
            const existing = results.findIndex((r) => r.model === result.model);
            if (existing >= 0) {
              results[existing] = result;
            } else {
              results.push(result);
            }
          }
        );

        // Display results table
        terminal.addOutput("");
        terminal.addInfo("Competition Results:");
        terminal.addOutput("─".repeat(80));
        terminal.addOutput(
          `${"Model".padEnd(25)} | ${"Tests".padEnd(10)} | ${"Mean Time".padEnd(12)} | Status`
        );
        terminal.addOutput("─".repeat(80));

        competitionResult.results.forEach((result) => {
          const testsInfo = result.totalTests 
            ? `${result.testsPassed}/${result.totalTests}`
            : "N/A";
          const timeInfo = result.meanExecutionTime 
            ? `${result.meanExecutionTime.toFixed(2)}ms` 
            : "N/A";
          const status = result.status === "passed" ? "PASSED" : 
                        result.status === "failed" ? "FAILED" : "ERROR";
          
          terminal.addOutput(
            `${result.modelName.padEnd(25)} | ${testsInfo.padEnd(10)} | ${timeInfo.padEnd(12)} | ${status}`
          );
        });

        terminal.addOutput("─".repeat(80));
        terminal.addOutput("");

        if (competitionResult.winner) {
          terminal.addSuccess(
            `Winner: ${competitionResult.winner.modelName} (${competitionResult.winner.meanExecutionTime?.toFixed(2)}ms mean over 100 runs)`
          );
          
          // Auto-adopt the winning solution
          try {
            await competitionManager.adoptSolution(competitionResult.winner);
            
            // Get the correct solution file path based on language
            const description = projectManager.getFile("descriptions.md");
            const language = description ? await detectLanguageWithAI(description) : "python";
            const config = getLanguageConfig(language);
            
            terminal.addSuccess(`Solution from ${competitionResult.winner.modelName} saved to ${config.solutionFilePattern}`);
            
            // Ask single optimization question
            terminal.addOutput("");
            terminal.addInfo("Do you want to optimize for lower latency? (yes/no)");
            setOptimizationState({
              stage: "latency_question",
              winningSolution: competitionResult.winner.solution || "",
              originalMeanTime: competitionResult.winner.meanExecutionTime || 0,
              modelIds: modelsToRun, // ALL models compete in optimization
            });
          } catch (error) {
            terminal.addError(`Failed to save solution: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        } else {
          terminal.addError("No model passed all tests");
        }
        break;
      }

      case "clean": {
        const result = projectManager.clean();
        terminal.addSuccess(result.message);
        
        // Close all open tabs
        onCloseAllTabs();
        
        // Clear chat history
        chatManager.clearHistory();
        
        terminal.addInfo("All tabs closed and chat cleared");
        break;
      }

      case "examples": {
        const examples = projectManager.listExamples();
        terminal.addInfo("Available example projects:");
        examples.forEach((ex) => {
          terminal.addOutput(`  ${ex.id.padEnd(20)} - ${ex.name} (${ex.difficulty})`);
        });
        terminal.addOutput("");
        terminal.addOutput("Load an example with: phronos load <example-id>");
        break;
      }

      case "load": {
        const exampleId = args[1];
        if (!exampleId) {
          terminal.addError("Please specify an example to load. Run 'phronos examples' to see available examples.");
          break;
        }
        const result = projectManager.loadExample(exampleId);
        if (result.success) {
          terminal.addSuccess(result.message);
          result.filesCreated.forEach((file) => {
            terminal.addOutput(`  Created: ${file}`);
          });
        } else {
          terminal.addError(result.message);
        }
        break;
      }

      default:
        terminal.addError(`Unknown phronos command: ${subcommand}. Type 'help' for usage.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isProcessing) {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = terminal.getPreviousCommand();
      if (prev !== null) setInput(prev);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = terminal.getNextCommand();
      if (next !== null) setInput(next);
    }
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "text-primary font-semibold";
      case "error":
        return "text-destructive";
      case "success":
        return "text-success";
      case "info":
        return "text-warning";
      default:
        return "text-white";
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-terminal-bg text-foreground font-mono overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="flex items-center px-3 py-1.5 border-b border-border bg-tabBar-bg">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Terminal</span>
      </div>

      {/* Terminal Output + Input Area (like real terminal) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0">
        {lines.map((line) => (
          <div key={line.id} className={cn("text-[13px] font-sans", getLineColor(line.type))} style={{ lineHeight: '1.4' }}>
            {line.text}
          </div>
        ))}
        
        {/* Current command line with inline prompt */}
        <div className="flex items-center gap-1 text-[13px] font-sans" style={{ lineHeight: '1.4' }}>
          <span className="text-green-400">{projectName}</span>
          <span className="text-foreground">:</span>
          <span className="text-blue-400">~/phronos</span>
          <span className="text-foreground ml-1">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 ml-2"
            placeholder={isProcessing ? "Processing..." : ""}
            autoFocus
            style={{ caretColor: '#fff' }}
          />
        </div>
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
