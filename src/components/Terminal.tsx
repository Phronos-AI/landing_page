import { useState, useEffect, useRef } from "react";
import { terminal, TerminalLine } from "@/lib/terminalRenderer";
import { projectManager } from "@/lib/projectManager";
import { testCompiler } from "@/lib/testCompiler";
import { competitionManager, ModelResult } from "@/lib/competitionManager";
import { openRouterClient, AVAILABLE_MODELS } from "@/lib/openRouterClient";
import { cn } from "@/lib/utils";

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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

    terminal.addCommand(trimmed);
    setIsProcessing(true);

    const parts = trimmed.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    try {
      switch (command) {
        case "help":
          terminal.addOutput("Available commands:");
          terminal.addOutput("  phronos init              - Initialize new project");
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
          terminal.addError("OpenRouter API key not configured. Please set it in settings.");
          break;
        }

        const selectedModels = args.slice(1);
        const modelsToRun = selectedModels.length > 0
          ? selectedModels
          : AVAILABLE_MODELS.map((m) => m.id);

        terminal.addInfo(`Starting competition with ${modelsToRun.length} models...`);
        
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

            if (result.status === "passed") {
              terminal.addSuccess(`${result.modelName} - PASSED (${result.duration}ms)`);
            } else if (result.status === "failed") {
              terminal.addError(`${result.modelName} - FAILED`);
            } else if (result.status === "error") {
              terminal.addError(`${result.modelName} - ERROR: ${result.error}`);
            }
          }
        );

        if (competitionResult.winner) {
          terminal.addSuccess(
            `🏆 Winner: ${competitionResult.winner.modelName} (${competitionResult.winner.duration}ms)`
          );
          terminal.addInfo("Run 'phronos adopt' to save the winning solution");
        } else {
          terminal.addError("No model passed all tests");
        }
        break;
      }

      case "clean": {
        const result = projectManager.clean();
        terminal.addSuccess(result.message);
        break;
      }

      default:
        terminal.addError(`Unknown phronos command: ${subcommand}. Type 'help' for usage.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isProcessing) {
      handleCommand(input);
      setInput("");
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
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-terminal-bg text-foreground font-mono p-4 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {lines.map((line) => (
          <div key={line.id} className={cn("text-sm", getLineColor(line.type))}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-primary">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder={isProcessing ? "Processing..." : "Type a command..."}
          autoFocus
        />
      </div>
    </div>
  );
}
