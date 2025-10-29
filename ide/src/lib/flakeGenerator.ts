import { getLanguageConfig } from "./languageConfig";

export function generateFlakeNix(language: string): string {
  const config = getLanguageConfig(language);
  
  const packages = config.nixPackages.join("\n        ");
  
  return `{
  description = "Phronos development environment for ${config.name}";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = with nixpkgs.legacyPackages.x86_64-linux; [
        ${packages}
      ];
      
      shellHook = ''
        echo "Phronos ${config.name} development environment"
        echo "Test framework: ${config.testFramework}"
      '';
    };
    
    devShells.aarch64-darwin.default = nixpkgs.legacyPackages.aarch64-darwin.mkShell {
      buildInputs = with nixpkgs.legacyPackages.aarch64-darwin; [
        ${packages}
      ];
      
      shellHook = ''
        echo "Phronos ${config.name} development environment"
        echo "Test framework: ${config.testFramework}"
      '';
    };
  };
}
`;
}

