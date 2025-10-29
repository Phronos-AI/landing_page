# Phronos - AI-Powered Competitive Coding Platform

Welcome to the Phronos monorepo! This repository contains both the marketing homepage and the browser-based IDE for AI model competition.

## 📁 Repository Structure

This is a monorepo containing two independent projects:

```
phronos-ai-race/
├── homepage/          # Marketing website (React + Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── ide/              # Phronos IDE (Browser-based development environment)
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md         # This file
```

---

## 🏠 Homepage

The marketing website showcasing Phronos features, pricing, and documentation.

### Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase (optional)

### Getting Started

```bash
cd homepage
npm install
npm run dev
```

The homepage will be available at `http://localhost:5173`

### Deployment
Deploy the `/homepage` directory to your hosting provider (Vercel, Netlify, etc.)

---

## 💻 Phronos IDE

A next-generation, verification-first development environment built for AI-assisted coding. The IDE lets developers define problems, generate tests, and benchmark AI models—all directly inside a browser.

### Key Features

- **Browser-based IDE**: Full-featured code editor with file tree, terminal, and AI chat
- **AI Model Competition**: Run multiple AI models in parallel to solve coding tasks
- **Multi-Language Support**: Python, Rust, Go, TypeScript, JavaScript, and more
- **Test-Driven Development**: Automatically generate tests from descriptions
- **Cursor-Style AI Chat**: Interactive AI assistant with inline code diffs and accept/reject functionality
- **Code Optimization**: AI-powered optimization for latency and memory footprint
- **Example Projects**: Pre-built examples from easy to hard difficulty

### Prerequisites

- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- OpenRouter API key - [Get one here](https://openrouter.ai/keys)

### Getting Started

```bash
cd ide
npm install

# Create environment file
echo "VITE_OPENROUTER_API_KEY=your_api_key_here" > .env

# Start the development server
npm run dev
```

The IDE will be available at `http://localhost:5174`

### Terminal Commands

Phronos IDE includes a custom terminal with the following commands:

- `phronos init` - Initialize a new project with a custom name
- `phronos examples` - List available example projects
- `phronos load <example>` - Load an example project
- `phronos compile` - Generate tests from descriptions using AI (auto-detects language)
- `phronos run [models...]` - Run AI model competition to solve the task
- `phronos clean` - Clear the current project and reset state
- `clear` - Clear terminal output
- `help` - Show available commands

### Workflow Example

1. **Create a new project**:
   - Enter a project name on the landing page
   - The IDE opens with a fresh environment

2. **Initialize and describe your task**:
   ```
   phronos init
   ```
   Edit `descriptions.md` to describe your coding task (optionally specify language like "Rust" or "Go")

3. **Compile descriptions into tests**:
   ```
   phronos compile
   ```
   The IDE auto-detects the language and generates appropriate tests

4. **Run the competition**:
   ```
   phronos run
   ```
   Multiple AI models compete to solve your task in parallel

5. **View results**:
   - See which model solved it fastest
   - Review execution times and test results
   - Optionally run optimization for lower latency or memory footprint
   - The winning solution is automatically saved to the appropriate file

### AI Chat Assistant

- Click on a file to open it in the editor
- Use the AI chat panel to ask questions or request code changes
- The AI has context of your currently open file
- Code changes appear as inline diffs with Accept/Reject buttons
- Use "New Chat" to start a fresh conversation

### Available AI Models

The competition uses the following models via OpenRouter:

- **GPT-4o** (OpenAI)
- **Claude 3.5 Sonnet** (Anthropic)
- **Gemini Pro 1.5** (Google)
- **Mistral Large** (Mistral AI)

### Supported Languages

- Python (default)
- Rust
- Go
- TypeScript
- JavaScript
- Java
- C++
- And more...

Language is auto-detected from your task description or defaults to Python.

### Example Projects

1. **Fibonacci** (Easy) - Calculate nth Fibonacci number
2. **String Reverse** (Easy) - String reversal with edge cases
3. **Binary Search** (Medium) - Implement binary search algorithm
4. **LRU Cache** (Medium) - Least Recently Used cache implementation
5. **Merge Intervals** (Hard) - Merge overlapping intervals

### IDE Architecture

```
ide/src/
├── components/           # UI components
│   ├── FileTree.tsx     # File browser with create/delete
│   ├── CodeEditor.tsx   # Syntax-highlighted editor
│   ├── Terminal.tsx     # Custom terminal with phronos commands
│   ├── ChatPanel.tsx    # AI assistant with inline diffs
│   ├── LandingPage.tsx  # Project creation screen
│   └── ui/              # Reusable UI components (shadcn/ui)
├── lib/                 # Core logic
│   ├── projectManager.ts       # Project and file management
│   ├── testCompiler.ts         # Test generation
│   ├── competitionManager.ts   # AI model competition
│   ├── chatManager.ts          # AI chat assistant
│   ├── openRouterClient.ts     # API client
│   ├── languageConfig.ts       # Multi-language support
│   ├── flakeGenerator.ts       # Nix flake generation
│   └── exampleProjects.ts      # Pre-built examples
└── pages/
    └── Index.tsx        # Main IDE layout
```

### Deployment

Deploy the `/ide` directory to your hosting provider. Recommended setup:

- Homepage: `yourdomain.com` → `/homepage` build
- IDE: `yourdomain.com/ide` or `ide.yourdomain.com` → `/ide` build

---

## 🛠️ Technologies Used

### Homepage
- React + TypeScript
- Vite
- Tailwind CSS
- React Router DOM

### IDE
- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- OpenRouter API
- Prism.js (syntax highlighting)
- LocalStorage/SessionStorage (browser persistence)

---

## 🚀 Deployment Guide

### Option 1: Separate Deployments (Recommended)

**Homepage:**
```bash
cd homepage
npm run build
# Deploy the 'dist' folder to yourdomain.com
```

**IDE:**
```bash
cd ide
npm run build
# Deploy the 'dist' folder to ide.yourdomain.com or yourdomain.com/ide
```

### Option 2: Monorepo Deployment (Vercel/Netlify)

Both Vercel and Netlify support monorepos:

1. Create two projects pointing to the same GitHub repo
2. Set different **Root Directory** for each:
   - Homepage project: `homepage`
   - IDE project: `ide`
3. Set build commands: `npm run build`
4. Set output directory: `dist`

---

## 📝 Development

### Working on Homepage

```bash
cd homepage
npm install
npm run dev    # Starts dev server on port 5173
```

### Working on IDE

```bash
cd ide
npm install
npm run dev    # Starts dev server on port 5174
```

Both projects can run simultaneously on different ports.

---

## 🤝 Contributing

This is a demo project for AI model competition. Feel free to extend it with:

- More example projects
- Additional AI models
- Real sandboxed code execution
- Backend persistence
- User authentication
- More programming languages

---

## 📄 License

MIT

---

## 📚 Additional Documentation

- **IDE Documentation**: See `/ide/PHRONOS_IDE_README.md` for detailed IDE features
- **Multi-Language Guide**: See `/ide/MULTI_LANGUAGE_GUIDE.md` for language support details
- **Quickstart**: See `/ide/QUICKSTART.md` for a quick setup guide

---

**Built with ❤️ for the AI coding revolution**
