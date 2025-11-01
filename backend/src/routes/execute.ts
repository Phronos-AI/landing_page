import express from 'express';
import { CodeExecutor } from '../services/codeExecutor.js';
import type { SupportedLanguage } from '../types.js';

export const executeRouter = express.Router();
const executor = new CodeExecutor();

// Execute solution with tests and measure performance
executeRouter.post('/run', async (req, res) => {
  try {
    const { solution, tests, language, runs = 100 } = req.body;

    if (!solution || !tests || !language) {
      return res.status(400).json({
        error: 'Missing required fields: solution, tests, language',
      });
    }

    // Validate language
    const supportedLanguages: SupportedLanguage[] = [
      'python', 'javascript', 'typescript', 'go', 'rust', 'java', 'cpp'
    ];
    
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`,
      });
    }

    console.log(`Executing ${language} solution (${runs} runs)...`);
    
    const result = await executor.executeAndMeasure(
      solution,
      tests,
      language.toLowerCase() as SupportedLanguage,
      runs
    );

    res.json(result);
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Validate syntax only (faster check)
executeRouter.post('/validate', async (req, res) => {
  try {
    const { solution, tests, language } = req.body;

    if (!solution || !tests || !language) {
      return res.status(400).json({
        error: 'Missing required fields: solution, tests, language',
      });
    }

    console.log(`Validating ${language} solution...`);
    
    const result = await executor.validateOnly(
      solution,
      tests,
      language.toLowerCase() as SupportedLanguage
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

