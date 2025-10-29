export interface LanguageConfig {
  name: string;
  fileExtension: string;
  testFramework: string;
  testFilePattern: string;
  solutionFilePattern: string;
  nixPackages: string[];
  testFileImports: string;
  solutionFileTemplate: string;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  python: {
    name: "Python",
    fileExtension: "py",
    testFramework: "pytest",
    testFilePattern: "tests/test_solution.py",
    solutionFilePattern: "src/solution.py",
    nixPackages: ["python3", "python3Packages.pytest"],
    testFileImports: "import pytest\nfrom src.solution import *",
    solutionFileTemplate: "# Python solution\n\n",
  },
  
  rust: {
    name: "Rust",
    fileExtension: "rs",
    testFramework: "cargo test",
    testFilePattern: "tests/solution_test.rs",
    solutionFilePattern: "src/lib.rs",
    nixPackages: ["cargo", "rustc", "rustfmt", "clippy"],
    testFileImports: "",
    solutionFileTemplate: "// Rust solution\n\n",
  },
  
  go: {
    name: "Go",
    fileExtension: "go",
    testFramework: "go test",
    testFilePattern: "solution_test.go",
    solutionFilePattern: "solution.go",
    nixPackages: ["go"],
    testFileImports: 'package main\n\nimport "testing"',
    solutionFileTemplate: "package main\n\n// Go solution\n",
  },
  
  javascript: {
    name: "JavaScript",
    fileExtension: "js",
    testFramework: "jest",
    testFilePattern: "tests/solution.test.js",
    solutionFilePattern: "src/solution.js",
    nixPackages: ["nodejs", "nodePackages.jest"],
    testFileImports: "const solution = require('../src/solution');",
    solutionFileTemplate: "// JavaScript solution\n\nmodule.exports = {};\n",
  },
  
  typescript: {
    name: "TypeScript",
    fileExtension: "ts",
    testFramework: "jest",
    testFilePattern: "tests/solution.test.ts",
    solutionFilePattern: "src/solution.ts",
    nixPackages: ["nodejs", "nodePackages.typescript", "nodePackages.jest", "nodePackages.ts-jest"],
    testFileImports: "import * as solution from '../src/solution';",
    solutionFileTemplate: "// TypeScript solution\n\nexport {};\n",
  },
  
  java: {
    name: "Java",
    fileExtension: "java",
    testFramework: "junit",
    testFilePattern: "src/test/java/SolutionTest.java",
    solutionFilePattern: "src/main/java/Solution.java",
    nixPackages: ["jdk", "maven"],
    testFileImports: "import org.junit.Test;\nimport static org.junit.Assert.*;",
    solutionFileTemplate: "public class Solution {\n    // Java solution\n}\n",
  },
  
  cpp: {
    name: "C++",
    fileExtension: "cpp",
    testFramework: "gtest",
    testFilePattern: "tests/test_solution.cpp",
    solutionFilePattern: "src/solution.cpp",
    nixPackages: ["gcc", "cmake", "gtest"],
    testFileImports: '#include <gtest/gtest.h>\n#include "../src/solution.h"',
    solutionFileTemplate: "// C++ solution\n\n#include \"solution.h\"\n",
  },
  
  ruby: {
    name: "Ruby",
    fileExtension: "rb",
    testFramework: "rspec",
    testFilePattern: "spec/solution_spec.rb",
    solutionFilePattern: "lib/solution.rb",
    nixPackages: ["ruby", "rubyPackages.rspec"],
    testFileImports: "require_relative '../lib/solution'",
    solutionFileTemplate: "# Ruby solution\n\n",
  },
};

export async function detectLanguageWithAI(description: string): Promise<string> {
  try {
    // Use dynamic import to avoid circular dependency
    const { openRouterClient } = await import("./openRouterClient");
    
    const supportedLanguages = Object.keys(LANGUAGE_CONFIGS).join(", ");
    
    const response = await openRouterClient.complete({
      model: "openai/gpt-4o-mini", // Use mini for faster/cheaper detection
      messages: [
        {
          role: "system",
          content: `You are a language detection assistant. Analyze the task description and determine which programming language is mentioned or implied. 

Supported languages: ${supportedLanguages}

Rules:
- If a specific language is explicitly mentioned, return it
- If no language is mentioned, return "python" (default)
- Return ONLY the language name in lowercase, nothing else
- Examples: "rust", "go", "python", "typescript", etc.`,
        },
        {
          role: "user",
          content: `What programming language is specified in this description?\n\n${description}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const detectedLang = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate that it's a supported language
    if (LANGUAGE_CONFIGS[detectedLang]) {
      return detectedLang;
    }
    
    // Fallback to Python if AI returns something unexpected
    return 'python';
  } catch (error) {
    console.error("Language detection failed, defaulting to Python:", error);
    return 'python';
  }
}

// Simple fast detection without AI (for backwards compatibility or offline use)
export function detectLanguageFast(description: string): string {
  // Quick code block check
  const codeBlockMatch = description.match(/```(\w+)/);
  if (codeBlockMatch) {
    const lang = codeBlockMatch[1].toLowerCase();
    if (LANGUAGE_CONFIGS[lang]) return lang;
    // Handle common aliases
    if (lang === 'js') return 'javascript';
    if (lang === 'ts') return 'typescript';
    if (lang === 'py') return 'python';
    if (lang === 'rs') return 'rust';
  }
  
  // Quick keyword check
  const lowerDesc = description.toLowerCase();
  const languageNames = Object.keys(LANGUAGE_CONFIGS);
  
  for (const lang of languageNames) {
    const regex = new RegExp(`\\b${lang}\\b`, 'i');
    if (regex.test(lowerDesc)) {
      return lang;
    }
  }
  
  // Default to Python
  return 'python';
}

export function getLanguageConfig(language: string): LanguageConfig {
  return LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.python;
}

