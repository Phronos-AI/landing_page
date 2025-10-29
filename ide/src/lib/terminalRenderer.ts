export interface TerminalLine {
  id: string;
  type: "command" | "output" | "error" | "success" | "info";
  text: string;
  timestamp: Date;
}

export class TerminalRenderer {
  private lines: TerminalLine[] = [];
  private listeners: Array<(lines: TerminalLine[]) => void> = [];
  private commandHistory: string[] = [];
  private historyIndex = -1;

  addLine(type: TerminalLine["type"], text: string): void {
    const line: TerminalLine = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date(),
    };
    this.lines.push(line);
    this.notifyListeners();
  }

  addCommand(command: string): void {
    this.addLine("command", `$ ${command}`);
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
  }

  addOutput(text: string): void {
    this.addLine("output", text);
  }

  addError(text: string): void {
    this.addLine("error", `Error: ${text}`);
  }

  addSuccess(text: string): void {
    this.addLine("success", `✓ ${text}`);
  }

  addInfo(text: string): void {
    this.addLine("info", `ℹ ${text}`);
  }

  clear(): void {
    this.lines = [];
    this.notifyListeners();
  }

  getLines(): TerminalLine[] {
    return [...this.lines];
  }

  subscribe(listener: (lines: TerminalLine[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getLines());

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const lines = this.getLines();
    this.listeners.forEach((listener) => listener(lines));
  }

  getPreviousCommand(): string | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    }
    return null;
  }

  getNextCommand(): string | null {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    }
    this.historyIndex = this.commandHistory.length;
    return "";
  }
}

export const terminal = new TerminalRenderer();
