# Phronos IDE - Multi-Language Support Guide

## Overview

Phronos IDE now supports multiple programming languages! The system automatically detects the language from your `descriptions.md` file and configures everything accordingly.

## Supported Languages

- **Python** (default)
- **Rust**
- **Go**
- **JavaScript**
- **TypeScript**
- **Java**
- **C++**
- **Ruby**

## How It Works

### 1. Initialize Project
```bash
phronos init
```
Creates only `descriptions.md` - no language-specific files yet.

### 2. Specify Language

Edit `descriptions.md` and specify your language in one of these ways:

**Option A: Explicit with Colon**
```markdown
## Language
Language: Rust
```

**Option B: Natural Language**
```markdown
The language should be Rust.
Language is Go.
Use TypeScript for this task.
Written in JavaScript.
```

**Option C: Code Block**
```markdown
## Example
```rust
fn fibonacci(n: u32) -> u32 {
    // ...
}
```
```

**Option D: Inline Mention**
```markdown
Write a Rust function that...
Implement this Go solution...
```

**Default**: If no language is specified, Python is used.

### 3. Compile
```bash
phronos compile
```

This command now:
1. **Detects** the language from your description
2. **Generates** `flake.nix` with the correct packages
3. **Creates** language-specific tests
4. **Sets up** the correct file structure

Example output:
```
✓ Compiled for Rust. Generated cargo test tests and flake.nix.
```

### 4. Run Competition
```bash
phronos run
```

AI models compete to write the best solution in your specified language!

## File Structure by Language

### Python
```
descriptions.md
flake.nix (python3, pytest)
tests/test_solution.py
src/solution.py ← Winner saved here
```

### Rust
```
descriptions.md
flake.nix (cargo, rustc, clippy)
src/lib.rs ← Tests and solution
```

### Go
```
descriptions.md
flake.nix (go)
solution.go ← Solution
solution_test.go ← Tests
```

### JavaScript
```
descriptions.md
flake.nix (nodejs, jest)
tests/solution.test.js
src/solution.js ← Winner saved here
```

### TypeScript
```
descriptions.md
flake.nix (nodejs, typescript, jest)
tests/solution.test.ts
src/solution.ts ← Winner saved here
```

## Language Detection Logic

**AI-Powered Detection**: The system uses GPT-4o-mini to intelligently detect the programming language from your description. This means:

✨ **Natural Language**: Write however you like!
- "The language should be Rust"
- "Please use Go"
- "I want this in TypeScript"
- "Implement using JavaScript"
- Any natural phrasing works!

🎯 **Smart Understanding**: The AI understands:
- Context and intent
- Code examples with language tags (` ```rust `)
- Implicit language mentions
- Technical requirements specific to a language

🔄 **Fallback**: If no language is detected or AI fails, defaults to Python

**Benefits over pattern matching:**
- No need to memorize specific formats
- Works with typos and variations
- Understands context better
- More flexible and natural

## Configuration Details

Each language has specific configurations:

| Language   | Test Framework | Nix Packages              |
|------------|----------------|---------------------------|
| Python     | pytest         | python3, pytest           |
| Rust       | cargo test     | cargo, rustc, clippy      |
| Go         | go test        | go                        |
| JavaScript | jest           | nodejs, jest              |
| TypeScript | jest           | nodejs, typescript, jest  |
| Java       | junit          | jdk, maven                |
| C++        | gtest          | gcc, cmake, gtest         |
| Ruby       | rspec          | ruby, rspec               |

## Example Workflow

### Example 1: Rust Project

1. `phronos init`
2. Edit `descriptions.md`:
```markdown
# Task Description

Write a Rust function that calculates Fibonacci numbers.

## Language
Rust

## Requirements
- Function should be named `fibonacci`
- Takes a u32 parameter
- Returns u32
```

3. `phronos compile`
   - ✓ Detects Rust
   - ✓ Creates flake.nix with cargo/rustc
   - ✓ Generates Rust tests

4. `phronos run`
   - AI models compete in Rust
   - Winner saved to `src/lib.rs`

### Example 2: TypeScript Project

1. `phronos init`
2. Edit `descriptions.md`:
```markdown
# Task Description

Implement a binary search algorithm in TypeScript.

## Example
```typescript
function binarySearch(arr: number[], target: number): number {
  // ...
}
```
```

3. `phronos compile`
   - ✓ Detects TypeScript from code block
   - ✓ Creates flake.nix with Node.js, TypeScript, Jest
   - ✓ Generates TypeScript + Jest tests

4. `phronos run`
   - AI models compete in TypeScript
   - Winner saved to `src/solution.ts`

## AI Prompts

The AI models receive language-aware instructions:

**For Python:**
```
You are a Python coding expert. 
Generate comprehensive unit tests using pytest...
```

**For Rust:**
```
You are a Rust coding expert.
Generate comprehensive unit tests using cargo test...
```

## Benefits

✅ **Flexible**: Choose any supported language  
✅ **Smart**: Automatic language detection  
✅ **Complete**: Nix environment, tests, and solution all configured  
✅ **Consistent**: Same workflow for all languages  
✅ **Extensible**: Easy to add new languages  

## Notes

- Language is detected during `phronos compile`
- Once compiled, stick with that language (or `phronos clean` to start over)
- All AI models will generate code in the detected language
- Flake.nix includes all necessary development tools
- Test frameworks are language-appropriate

## Adding New Languages

To add a new language, update `src/lib/languageConfig.ts`:

```typescript
newlang: {
  name: "NewLang",
  fileExtension: "nl",
  testFramework: "newlang-test",
  testFilePattern: "tests/test.nl",
  solutionFilePattern: "src/solution.nl",
  nixPackages: ["newlang", "newlang-test-framework"],
  testFileImports: "// imports here",
  solutionFileTemplate: "// template here",
}
```

Then add detection logic in `detectLanguage()` function.

