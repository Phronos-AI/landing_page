import { openRouterClient } from "./openRouterClient";
import { projectManager } from "./projectManager";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileContext?: string[];
  codeChanges?: CodeChange[];
}

export interface CodeChange {
  id: string;
  filePath: string;
  oldContent: string;
  newContent: string;
  applied: boolean;
}

export interface ChatContext {
  currentFile: string | null;
  projectFiles: Record<string, string>;
}

class ChatManager {
  private messages: ChatMessage[] = [];
  private listeners: Array<(messages: ChatMessage[]) => void> = [];

  subscribe(listener: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getMessages());

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  addMessage(message: Omit<ChatMessage, "id" | "timestamp">): void {
    const newMessage: ChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const messages = this.getMessages();
    this.listeners.forEach((listener) => listener(messages));
  }

  buildContext(currentFile: string | null): ChatContext {
    const project = projectManager.getProject();
    const projectFiles = project?.files || {};

    return {
      currentFile,
      projectFiles,
    };
  }

  async sendMessage(
    userMessage: string,
    context: ChatContext
  ): Promise<ChatMessage> {
    // Add user message
    const fileContext = context.currentFile ? [context.currentFile] : [];
    this.addMessage({
      role: "user",
      content: userMessage,
      fileContext,
    });

    // Build context for AI
    const systemPrompt = this.buildSystemPrompt(context);
    const conversationHistory = this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await openRouterClient.complete({
        model: "anthropic/claude-sonnet-4.5",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const assistantContent = response.choices[0].message.content;

      // Parse for code changes
      const codeChanges = this.extractCodeChanges(assistantContent, context);

      const assistantMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        role: "assistant",
        content: assistantContent,
        codeChanges,
      };

      this.addMessage(assistantMessage);

      return this.messages[this.messages.length - 1];
    } catch (error) {
      const errorMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
      };
      this.addMessage(errorMessage);
      return this.messages[this.messages.length - 1];
    }
  }

  private buildSystemPrompt(context: ChatContext): string {
    let prompt = `You are an AI coding assistant integrated into Phronos IDE. You help developers write code, fix bugs, and understand their codebase.

IMPORTANT: When a user asks you to modify, update, change, improve, fix, or edit ANY file - you should ALWAYS provide the actual file changes using the filepath format below. Don't just explain - actually make the edits!

Current context:`;

    if (context.currentFile) {
      const fileContent = context.projectFiles[context.currentFile];
      prompt += `\n\nCurrently open file: ${context.currentFile}\n\`\`\`\n${fileContent}\n\`\`\``;
    }

    const projectFilesList = Object.keys(context.projectFiles).join(", ");
    if (projectFilesList) {
      prompt += `\n\nProject files: ${projectFilesList}`;
    }

    prompt += `\n\nWhen making file changes:
1. ALWAYS use the filepath format when the user wants to modify ANY file
2. Provide the COMPLETE file content (not just snippets)
3. Add a brief explanation before the code
4. Be proactive - if the user's request implies a file change, make it!

REQUIRED FORMAT for file modifications:
\`\`\`filepath:path/to/file.md
# Complete file content here
All lines of the file...
\`\`\`

Examples of requests that need file changes:
- "make the description more detailed" → provide full updated descriptions.md
- "add error handling" → provide full updated code file
- "fix the typo" → provide full corrected file
- "improve the requirements section" → provide full updated file
- "change the function to use async" → provide full updated file

Remember: The user will see an "Accept/Reject" button for your changes. Make it easy for them to apply your edits!`;

    return prompt;
  }

  private extractCodeChanges(
    content: string,
    context: ChatContext
  ): CodeChange[] {
    const changes: CodeChange[] = [];
    
    // Match code blocks with filepath: prefix (more flexible regex)
    // Handles: ```filepath:path, ```filepath: path, or just filepath:path on its own
    const codeBlockRegex = /```(?:[\w]*\s*)?filepath:\s*([^\n]+)\n([\s\S]*?)```/gi;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const filePath = match[1].trim();
      const newContent = match[2].trim();
      const oldContent = context.projectFiles[filePath] || "";

      changes.push({
        id: `change-${Date.now()}-${Math.random()}`,
        filePath,
        oldContent,
        newContent,
        applied: false,
      });
    }

    return changes;
  }

  applyCodeChange(messageId: string, changeId: string): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message || !message.codeChanges) return;

    const change = message.codeChanges.find((c) => c.id === changeId);
    if (!change) return;

    // Save the file with new content
    projectManager.saveFile(change.filePath, change.newContent);
    
    // Mark as applied
    change.applied = true;
    this.notifyListeners();
  }

  rejectCodeChange(messageId: string, changeId: string): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message || !message.codeChanges) return;

    const changeIndex = message.codeChanges.findIndex((c) => c.id === changeId);
    if (changeIndex === -1) return;

    // Remove the change
    message.codeChanges.splice(changeIndex, 1);
    this.notifyListeners();
  }

  clearHistory(): void {
    this.messages = [];
    this.notifyListeners();
  }
}

export const chatManager = new ChatManager();

