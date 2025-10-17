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
  private apiKey: string | null = null;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem("openrouter_api_key", key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("openrouter_api_key");
    }
    return this.apiKey;
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

  async generateTests(description: string): Promise<string> {
    const response = await this.complete({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a test generation expert. Given a task description, generate comprehensive unit tests in Python using pytest. Return ONLY the test code, no explanations.",
        },
        {
          role: "user",
          content: `Generate unit tests for this task:\n\n${description}`,
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
