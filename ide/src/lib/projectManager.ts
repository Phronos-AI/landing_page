import { storage, ProjectState } from "./storage";
import { getExampleById, listExamples, ExampleProject } from "./exampleProjects";

const DEFAULT_DESCRIPTION = `# Task Description

Write a function that calculates the nth Fibonacci number.

## Requirements
- Function should be named \`fibonacci\`
- Takes a single integer parameter \`n\`
- Returns the nth Fibonacci number
- Handle edge cases (n = 0, n = 1)
- Should be efficient for reasonable inputs (n < 100)

## Example
\`\`\`
fibonacci(0) → 0
fibonacci(1) → 1
fibonacci(5) → 5
fibonacci(10) → 55
\`\`\`

## Language

The language should be Python.

_You can change this to: Rust, Go, TypeScript, JavaScript, Java, C++, or Ruby_
_Write it however you like - AI will detect it! Examples:_
_"The language should be Rust", "Please use Go", "I want TypeScript", etc._
`;

export interface InitResult {
  success: boolean;
  message: string;
  filesCreated: string[];
}

export const projectManager = {
  init(projectName: string = "demo_project"): InitResult {
    const existingProject = storage.loadProject();
    
    if (existingProject) {
      return {
        success: false,
        message: "Project already exists. Use 'phronos clean' to start fresh.",
        filesCreated: [],
      };
    }

    const project: ProjectState = {
      projectName,
      files: {
        "descriptions.md": DEFAULT_DESCRIPTION,
      },
    };

    storage.saveProject(project);

    return {
      success: true,
      message: `Phronos initialized project '${projectName}'. Edit descriptions.md, then run 'phronos compile'.`,
      filesCreated: ["descriptions.md"],
    };
  },

  clean(): InitResult {
    storage.clearProject();
    return {
      success: true,
      message: "Project cleared. Run 'phronos init' to start fresh.",
      filesCreated: [],
    };
  },

  getProject(): ProjectState | null {
    return storage.loadProject();
  },

  saveFile(path: string, content: string): void {
    storage.saveFile(path, content);
  },

  getFile(path: string): string | null {
    return storage.getFile(path);
  },

  listFiles(): string[] {
    return storage.listFiles();
  },

  listExamples(): ExampleProject[] {
    return listExamples();
  },

  loadExample(exampleId: string): InitResult {
    const example = getExampleById(exampleId);
    
    if (!example) {
      return {
        success: false,
        message: `Example '${exampleId}' not found. Run 'phronos examples' to see available examples.`,
        filesCreated: [],
      };
    }

    // Clear existing project
    storage.clearProject();

    // Create new project with example
    const project: ProjectState = {
      projectName: example.name,
      files: {
        "descriptions.md": example.description,
        "tests/test_solution.py": example.tests,
        "flake.nix": DEFAULT_FLAKE_NIX,
      },
    };

    storage.saveProject(project);

    return {
      success: true,
      message: `Loaded example: ${example.name} (${example.difficulty})`,
      filesCreated: ["descriptions.md", "tests/test_solution.py", "flake.nix"],
    };
  },

  createFile(path: string, content: string = ""): boolean {
    try {
      this.saveFile(path, content);
      return true;
    } catch {
      return false;
    }
  },

  deleteFile(path: string): boolean {
    try {
      storage.deleteFile(path);
      return true;
    } catch {
      return false;
    }
  },

  renameFile(oldPath: string, newPath: string): boolean {
    try {
      const content = this.getFile(oldPath);
      if (content === null) return false;
      this.saveFile(newPath, content);
      storage.deleteFile(oldPath);
      return true;
    } catch {
      return false;
    }
  },
};
