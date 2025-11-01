import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import type { ExecutionResult, ValidationResult, SupportedLanguage } from '../types.js';
import { PythonHandler } from './languageHandlers/python.js';
import { JavaScriptHandler } from './languageHandlers/javascript.js';
import { GoHandler } from './languageHandlers/go.js';
import { RustHandler } from './languageHandlers/rust.js';
import { JavaHandler } from './languageHandlers/java.js';
import { CppHandler } from './languageHandlers/cpp.js';

const docker = new Docker();

export class CodeExecutor {
  private readonly tempDir = '/tmp/phronos-exec';
  private readonly handlers: Record<SupportedLanguage, any>;

  constructor() {
    this.ensureTempDir();
    
    // Initialize language handlers
    this.handlers = {
      python: new PythonHandler(docker, this.tempDir),
      javascript: new JavaScriptHandler(docker, this.tempDir),
      typescript: new JavaScriptHandler(docker, this.tempDir), // Uses same handler
      go: new GoHandler(docker, this.tempDir),
      rust: new RustHandler(docker, this.tempDir),
      java: new JavaHandler(docker, this.tempDir),
      cpp: new CppHandler(docker, this.tempDir),
    };
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log(`✓ Temp directory ready: ${this.tempDir}`);
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Execute solution with tests and measure performance
   */
  async executeAndMeasure(
    solution: string,
    tests: string,
    language: SupportedLanguage,
    runs: number = 100
  ): Promise<ExecutionResult> {
    const handler = this.handlers[language];
    if (!handler) {
      throw new Error(`No handler for language: ${language}`);
    }

    const workDir = path.join(this.tempDir, uuidv4());
    
    try {
      await fs.mkdir(workDir, { recursive: true });
      
      // Step 1: Validate solution with tests
      console.log(`  → Validating ${language} solution...`);
      const validationResult = await handler.validateSolution(solution, tests, workDir);
      
      console.log(`  → Test result: ${validationResult.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`  → Tests: ${validationResult.testsPassed}/${validationResult.totalTests}`);
      if (validationResult.error) {
        console.log(`  → Error output (first 1000 chars):`);
        console.log(validationResult.error.substring(0, 1000));
      }
      if (validationResult.output) {
        console.log(`  → Full output (first 1000 chars):`);
        console.log(validationResult.output.substring(0, 1000));
      }
      
      if (!validationResult.passed) {
        return {
          passed: false,
          testsPassed: validationResult.testsPassed,
          totalTests: validationResult.totalTests,
          meanExecutionTime: 0,
          error: validationResult.error || 'Tests failed',
          output: validationResult.output,
        };
      }

      console.log(`  ✓ Tests passed (${validationResult.testsPassed}/${validationResult.totalTests})`);
      
      // Step 2: Measure performance over multiple runs
      console.log(`  → Measuring performance (${runs} runs)...`);
      const measurementResult = await handler.measurePerformance(solution, workDir, runs);
      
      console.log(`  ✓ Mean execution time: ${measurementResult.meanExecutionTime.toFixed(2)}ms`);
      
      return {
        passed: true,
        testsPassed: validationResult.testsPassed,
        totalTests: validationResult.totalTests,
        meanExecutionTime: measurementResult.meanExecutionTime,
        standardDeviation: measurementResult.standardDeviation,
      };
    } catch (error) {
      return {
        passed: false,
        testsPassed: 0,
        totalTests: 0,
        meanExecutionTime: 0,
        error: error instanceof Error ? error.message : 'Unknown execution error',
      };
    } finally {
      // Cleanup
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }

  /**
   * Validate solution only (no performance measurement)
   */
  async validateOnly(
    solution: string,
    tests: string,
    language: SupportedLanguage
  ): Promise<ValidationResult> {
    const handler = this.handlers[language];
    if (!handler) {
      throw new Error(`No handler for language: ${language}`);
    }

    const workDir = path.join(this.tempDir, uuidv4());
    
    try {
      await fs.mkdir(workDir, { recursive: true });
      return await handler.validateSolution(solution, tests, workDir);
    } finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }
}

