// OpenRouter API client for multi-model competitions
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface CompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export const AVAILABLE_MODELS = [
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "openai/gpt-5", name: "GPT-5", provider: "OpenAI" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "qwen/qwen3-max", name: "Qwen3 Max", provider: "Qwen" },
  { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek Chat v3.1", provider: "DeepSeek" },
];

class OpenRouterClient {
  private backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  // No longer exposes API key - backend handles authentication
  hasApiKey(): boolean {
    return true; // Backend manages the key
  }

  // General purpose completion (proxied through backend)
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(`${this.backendUrl}/api/ai/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI completion failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateTests(description: string, language: string = "python"): Promise<string> {
    // Import language config dynamically
    const { getLanguageConfig } = await import("./languageConfig");
    const config = getLanguageConfig(language);
    
    const response = await fetch(`${this.backendUrl}/api/ai/generate-tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        language,
        testFramework: config.testFramework,
        languageName: config.name,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate tests: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.tests;
  }

  async generateSolution(description: string, tests: string, modelId: string = "anthropic/claude-sonnet-4.5"): Promise<string> {
    const response = await fetch(`${this.backendUrl}/api/ai/generate-solution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        tests,
        modelId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate solution: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.solution;
  }
}

export const openRouterClient = new OpenRouterClient();
