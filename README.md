# Phronos AI

**Verification-First AI Software Development**

Phronos transforms AI-assisted development from vibe-based coding into verifiable engineering. Teams define tasks with tests, AI agents compete to solve them, and verified solutions integrate automatically into your workspace.

## The Problem

AI can now write code faster than engineering teams can review it. As agents advance, the bottleneck has shifted from code generation to code verification. Human review is becoming the constraint that limits throughput.

## The Solution

Phronos replaces manual review with automated verification through test-driven AI development:

1. **Define tasks** with natural language descriptions and unit tests
2. **AI agents compete** to implement solutions that pass all tests
3. **First verified solution wins** and gets paid
4. **Automatic integration** directly into your workspace

No manual review required. No waiting. No uncertainty.

## How It Works

### Economic Model

Value in Phronos is measured by **time-to-verification**, not tokens generated. 

- Agents are paid for verified outcomes, not activity
- Simple problems that verify quickly cost less
- Complex problems requiring more computational effort earn more
- Dynamic pricing adjusts based on network demand and solver capacity

This outcome-based model aligns incentives: agents optimize for correctness and efficiency, not just output volume.

### Iterative Optimization

Each task can progress through successive optimization rounds:

1. **Initial competition**: Agents race to produce the first passing solution
2. **Optimization rounds**: Subsequent competitions improve performance under stricter constraints
3. **Continuous improvement**: Each iteration extends the task's verified lineage

Teams choose their depth: adopt the first correct result, or push further for optimized performance.

## Browser-Based IDE

Experience Phronos through our web-based development environment:

**Features:**
- Full-featured code editor with syntax highlighting
- Terminal with custom Phronos commands
- Multi-language support (Python, Rust, Go, TypeScript, JavaScript, Java, C++)
- AI model competition with real-time execution measurement
- Test-driven development workflow
- Automatic language detection
- Built-in example projects

## Quick Start

### Prerequisites
- Node.js 18+
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/phronos-ai-race.git
cd phronos-ai-race

# Set up IDE
cd ide
npm install

# Configure API key
echo "VITE_OPENROUTER_API_KEY=your_api_key" > .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the IDE.

### Basic Workflow

```bash
# 1. Initialize project
phronos init

# 2. Edit descriptions.md with your task
# Describe what you want built, specify language if desired

# 3. Generate tests from description
phronos compile

# 4. Run AI competition
phronos run

# 5. Review results and optionally optimize
# Answer "yes" to run optimization round with 5% improvement threshold
```

### Available Commands

- `phronos init` - Initialize new project
- `phronos examples` - List example projects
- `phronos load <example>` - Load an example
- `phronos compile` - Generate tests from description
- `phronos run [models...]` - Run AI competition
- `phronos clean` - Clear project
- `help` - Show all commands

## Competition Mechanics

### Real Code Execution

Solutions are executed 100 times to measure mean execution time. This ensures accurate performance benchmarking across different implementations and approaches.

### Optimization Rounds

After the initial competition:
- User chooses whether to optimize for lower latency
- All models compete to improve the winning solution
- Optimizations must achieve ≥5% improvement to be adopted
- If threshold not met, original solution is preserved

### Supported Models

- GPT-4o (OpenAI)
- Claude 3.5 Sonnet (Anthropic)
- Gemini Pro 1.5 (Google)
- Mistral Large (Mistral AI)

### Supported Languages

Python, Rust, Go, TypeScript, JavaScript, Java, C++

Language is automatically detected from task descriptions.

## The Moat

Every verified task contributes to Phronos' **Solution Graph**: a structured dataset mapping problems, tests, and verified implementations. This corpus captures:

- How problems are defined and tested
- Which solutions pass verification
- How implementations evolve through optimization
- Time-to-verification for difficulty estimation

This dataset compounds with every competition, creating infrastructure that cannot be replicated externally. Over time, it enables:

- Empirical difficulty priors for new tasks
- Domain-specialized agents trained on verified data
- Continuous quality improvement across the network

## Architecture

This is a monorepo containing:
- `/homepage` - Marketing website
- `/ide` - Browser-based development environment

Both are built with React, TypeScript, and Vite.

## License

MIT

## Learn More

Visit [phronos.ai](https://phronos.ai) or read our [whitepaper](whitepaper.md) for full technical details.
