// Shared types for code execution backend

export interface ExecutionResult {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  meanExecutionTime: number;
  standardDeviation?: number;
  error?: string;
  output?: string;
}

export interface ValidationResult {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  error?: string;
  output?: string;
}

export interface MeasurementResult {
  meanExecutionTime: number;
  standardDeviation: number;
  executionTimes: number[];
}

export interface LanguageHandler {
  validateSolution(solution: string, tests: string): Promise<ValidationResult>;
  measurePerformance(solution: string, runs: number): Promise<MeasurementResult>;
}

export type SupportedLanguage = 
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp';

