import express from 'express';
import { openRouterService } from '../services/openRouterService.js';

export const aiRouter = express.Router();

// General purpose AI completion endpoint
aiRouter.post('/complete', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: 'Missing required fields: model, messages',
      });
    }

    console.log(`AI completion request for model: ${model}...`);
    
    const response = await openRouterService.complete({
      model,
      messages,
      temperature,
      max_tokens,
    });

    res.json(response);
  } catch (error) {
    console.error('AI completion error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'AI completion failed',
    });
  }
});

// Generate tests from description
aiRouter.post('/generate-tests', async (req, res) => {
  try {
    const { description, language, testFramework, languageName } = req.body;

    if (!description || !language) {
      return res.status(400).json({
        error: 'Missing required fields: description, language',
      });
    }

    console.log(`Generating tests for ${language}...`);
    
    const tests = await openRouterService.generateTests(
      description,
      language,
      testFramework || 'pytest',
      languageName || language
    );

    res.json({ tests });
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate tests',
    });
  }
});

// Generate solution from description and tests
aiRouter.post('/generate-solution', async (req, res) => {
  try {
    const { description, tests, modelId } = req.body;

    if (!description || !tests || !modelId) {
      return res.status(400).json({
        error: 'Missing required fields: description, tests, modelId',
      });
    }

    console.log(`Generating solution with model: ${modelId}...`);
    
    const solution = await openRouterService.generateSolution(
      description,
      tests,
      modelId
    );

    res.json({ solution });
  } catch (error) {
    console.error('Solution generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate solution',
    });
  }
});

