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
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral" },
];

class OpenRouterClient {
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  getApiKey(): string | null {
    return import.meta.env.VITE_OPENROUTER_API_KEY || null;
  }

  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("OpenRouter API key not set. Please configure it first.");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Phronos IDE",
      },
      body: JSON.stringify({
        ...request,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateTests(description: string, language: string = "python"): Promise<string> {
    // Import language config dynamically
    const { getLanguageConfig } = await import("./languageConfig");
    const config = getLanguageConfig(language);
    
    const response = await this.complete({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a test generation expert for ${config.name}. Given a task description, generate comprehensive unit tests using ${config.testFramework}. Return ONLY the test code with proper imports, no explanations or markdown.`,
        },
        {
          role: "user",
          content: `Generate ${config.name} unit tests for this task:\n\n${description}\n\nUse ${config.testFramework} and include all necessary imports.`,
        },
      ],
    });

    return response.choices[0].message.content;
  }

  async generateSolution(description: string, tests: string): Promise<string> {
    const response = await this.complete({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a coding expert. Given a task description and tests, write code that passes all tests. Return ONLY the code, no explanations.",
        },
        {
          role: "user",
          content: `Task:\n${description}\n\nTests:\n${tests}\n\nWrite the solution:`,
        },
      ],
    });

    return response.choices[0].message.content;
  }
}

export const openRouterClient = new OpenRouterClient();
