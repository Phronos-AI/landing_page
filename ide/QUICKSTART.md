# Phronos IDE - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# Get a key from: https://openrouter.ai/keys
```

Your `.env` file should look like:
```
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 3. Start Development Server

```bash
npm run dev
```

The IDE will open at `http://localhost:5173`

## First Steps

### Try an Example Project

1. Open the terminal (bottom panel)
2. Type: `phronos examples` to see all available examples
3. Load one: `phronos load fibonacci`
4. View the files in the file tree (left sidebar)
5. Click on `descriptions.md` to see the task
6. Click on `tests/test_solution.py` to see the tests

### Run Your First Competition

```bash
# In the terminal:
phronos run
```

This will:
- Send the task to all 4 AI models simultaneously
- Show real-time progress
- Display results in a clean table
- Automatically save the winning solution

### Use the AI Chat

1. Click on any file to open it
2. Use the chat panel on the right
3. Try asking:
   - "Explain this code"
   - "Add comments to this function"
   - "Fix this bug: [describe the issue]"
   - "Refactor this to be more efficient"

When the AI suggests code changes:
- You'll see an inline diff (red = removed, green = added)
- Click **Accept** to apply the change
- Click **Reject** to dismiss it

## Available Examples

| ID | Name | Difficulty | Description |
|----|------|-----------|-------------|
| `fibonacci` | Fibonacci Sequence | Easy | Calculate nth Fibonacci number |
| `string-reverse` | String Reversal | Easy | Reverse strings with edge cases |
| `binary-search` | Binary Search | Medium | Implement binary search algorithm |
| `lru-cache` | LRU Cache | Medium-Hard | Least Recently Used cache |
| `merge-intervals` | Merge Intervals | Hard | Merge overlapping intervals |

## Terminal Commands Reference

```bash
help                        # Show all commands
phronos examples            # List examples
phronos load <id>          # Load an example
phronos init               # Create blank project
phronos compile            # Generate tests from description
phronos run                # Run AI competition
phronos run openai/gpt-4o  # Run specific model only
phronos clean              # Clear project
clear                      # Clear terminal
```

## Tips

1. **Start with Easy Examples**: Try `fibonacci` or `string-reverse` first
2. **Check the Tests**: Always review generated tests before running competition
3. **Experiment with Chat**: The AI has full project context - ask anything!
4. **Multiple Models**: By default, all 4 models compete. Specify one for faster testing
5. **Auto-Save**: Files save with Cmd/Ctrl + S

## Workflow Example

```bash
# 1. Load example
phronos load binary-search

# 2. Review files
# - Click descriptions.md to see the task
# - Click tests/test_solution.py to see tests

# 3. (Optional) Modify description or tests
# - Edit in the code editor
# - Save with Cmd/Ctrl + S

# 4. Run competition
phronos run

# 5. Check the winner
# - See results table in terminal
# - Winning code saved to src/solution.py

# 6. View winning solution
# - Click src/solution.py in file tree
```

## Troubleshooting

### "OpenRouter API key not configured"
- Make sure you created `.env` file
- Verify the key starts with `sk-or-v1-`
- Restart the dev server after adding the key

### "No tests found"
- Run `phronos compile` first to generate tests
- Or load an example which includes pre-written tests

### "No model passed all tests"
- This is expected sometimes (tests are challenging!)
- Try running again (different random seed)
- Or modify the description to be clearer

### Chat not responding
- Check your API key is valid
- Check browser console for errors
- Make sure you have an active internet connection

## What's Next?

- Create your own project: `phronos init`
- Edit `descriptions.md` to describe your task
- Use chat to help write the description
- Run `phronos compile` to generate tests
- Run `phronos run` to solve it!

## Getting Help

- Type `help` in the terminal for command reference
- Ask the AI chat: "How do I [task]?"
- Check the main README.md for full documentation
- Review IMPLEMENTATION_SUMMARY.md for technical details

Enjoy using Phronos IDE!

