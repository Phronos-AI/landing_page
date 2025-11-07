// Secure server-side OpenRouter client
// API key is never exposed to frontend
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

class OpenRouterService {
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  private getApiKey(): string {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not set in environment variables");
    }
    
    return apiKey;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const apiKey = this.getApiKey();

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://phronos.ai",
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

    return response.json() as Promise<CompletionResponse>;
  }

  async generateTests(description: string, language: string, testFramework: string, languageName: string): Promise<string> {
    // Rust-specific instructions since tests go in same lib.rs file
    const rustSpecific = language === 'rust' ? `

RUST-SPECIFIC RULES:
- Use "use crate::{function_names};" to import functions (NOT "use solution::")
- Tests and solution are in the same lib.rs file, so use crate:: prefix
- DO NOT use external crates not in dependencies (no lazy_static, no once_cell)
- Only use: serde, serde_json, sha2, regex, rand, base64, hex, itertools` : '';

    const importInstruction = language === 'rust' 
      ? 'Use "use crate::{...};" to import functions from the solution'
      : 'Import the solution from an external module (e.g., "from solution import ..." for Python)';

    const response = await this.complete({
      model: "anthropic/claude-sonnet-4.5",
      messages: [
        {
          role: "system",
          content: `You are a test generation expert for ${languageName}. Given a task description, generate comprehensive unit tests using ${testFramework}.

CRITICAL RULES:
1. Return ONLY test code - do NOT include the actual solution implementation
2. ${importInstruction}
3. Do NOT wrap in markdown code blocks - no \`\`\`python or \`\`\`${language} tags
4. Start directly with test code (imports and test functions only)
5. Generate MAXIMUM 10 test cases - focus on quality over quantity
6. Distribution: 3-4 basic functionality tests, 3-4 edge case tests, 2-3 error handling tests
7. Each test should be meaningful and test different aspects of the solution
8. Use proper ${testFramework} syntax and assertions
9. Focus on common use cases and reasonable edge cases
10. Avoid overly complex test cases (like Unicode combining characters or escape sequences)${rustSpecific}`,
        },
        {
          role: "user",
          content: `Task description:
${description}

Generate ${testFramework} tests that:
- ${importInstruction}
- Test all requirements thoroughly
- Cover edge cases and error conditions
- Use clear, descriptive test names

Return ONLY the test code, starting with imports.`,
        },
      ],
    });

    return response.choices[0].message.content;
  }

  async generateSolution(description: string, tests: string, modelId: string): Promise<string> {
    // Add language-specific hints by checking tests
    let languageHints = '';
    if (tests.includes('#[test]') || tests.includes('use crate::')) {
      languageHints = `\n\nRUST AVAILABLE CRATES: serde, serde_json, sha2, regex, rand, base64, hex, itertools
DO NOT use: lazy_static, once_cell, chrono, tokio, reqwest, anyhow, thiserror, uuid`;
    }

    const response = await this.complete({
      model: modelId,
      messages: [
        {
          role: "system",
          content: `You are a coding expert. Given a task description and tests, write code that passes all tests.

CRITICAL INSTRUCTIONS:
1. Read the ENTIRE task description carefully before writing code
2. If the description says "do not use X" or "avoid Y" or "without Z", you MUST follow those constraints exactly
3. Pay special attention to any restrictions on libraries, approaches, or implementation methods
4. Return ONLY raw code - do NOT wrap in markdown code blocks
5. Do NOT use \`\`\`python or \`\`\`rust or any markdown formatting
6. Start directly with the code${languageHints}`,
        },
        {
          role: "user",
          content: `TASK DESCRIPTION (READ COMPLETELY):
${description}

CONSTRAINTS:
- Follow ALL instructions in the task description above
- Pay special attention to any "do not use" or "avoid" statements
- Respect any library/approach restrictions mentioned
- If the description specifies an implementation method, use it

TESTS TO PASS:
${tests}

Write the solution that follows the description and passes all tests:`,
        },
      ],
    });

    return response.choices[0].message.content;
  }
}

export const openRouterService = new OpenRouterService();

