import { storage, ProjectState } from "./storage";

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
`;

const DEFAULT_FLAKE_NIX = `{
  description = "Phronos development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = with nixpkgs.legacyPackages.x86_64-linux; [
        python3
        python3Packages.pytest
      ];
    };
  };
}
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
        "flake.nix": DEFAULT_FLAKE_NIX,
      },
    };

    storage.saveProject(project);

    return {
      success: true,
      message: `Phronos initialized project '${projectName}' with descriptions.md and flake.nix`,
      filesCreated: ["descriptions.md", "flake.nix"],
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
};
