import type Docker from 'dockerode';
import type { ValidationResult, MeasurementResult } from '../../types.js';

export abstract class BaseHandler {
  protected docker: Docker;
  protected tempDir: string;
  protected abstract image: string;
  protected readonly timeout = 30000; // 30 seconds
  protected readonly memoryLimit = 512 * 1024 * 1024; // 512MB
  protected readonly cpuLimit = 1000000000; // 1 CPU

  constructor(docker: Docker, tempDir: string) {
    this.docker = docker;
    this.tempDir = tempDir;
  }

  abstract validateSolution(solution: string, tests: string, workDir: string): Promise<ValidationResult>;
  abstract measurePerformance(solution: string, workDir: string, runs: number): Promise<MeasurementResult>;

  /**
   * Run command in Docker container
   */
  protected async runInContainer(
    workDir: string,
    command: string[],
    options: { timeout?: number; captureOutput?: boolean } = {}
  ): Promise<{ exitCode: number; output: string }> {
    const timeout = options.timeout || this.timeout;
    const captureOutput = options.captureOutput !== false;

    // Ensure image is pulled
    await this.ensureImage();

    const container = await this.docker.createContainer({
      Image: this.image,
      Cmd: command,
      WorkingDir: '/code',
      HostConfig: {
        Binds: [`${workDir}:/code`],
        Memory: this.memoryLimit,
        NanoCpus: this.cpuLimit,
        NetworkMode: 'none', // No network access for security
      },
      AttachStdout: captureOutput,
      AttachStderr: captureOutput,
    });

    try {
      await container.start();

      // Wait for container with timeout
      const result = await Promise.race([
        this.waitForContainer(container),
        this.timeoutPromise(timeout),
      ]);

      if (result === 'timeout') {
        await container.kill();
        throw new Error(`Execution timeout after ${timeout}ms`);
      }

      const output = captureOutput ? await this.getContainerOutput(container) : '';
      
      return {
        exitCode: result as number,
        output,
      };
    } finally {
      try {
        await container.remove({ force: true });
      } catch (removeError) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Ensure Docker image is available
   */
  private async ensureImage(): Promise<void> {
    try {
      await this.docker.getImage(this.image).inspect();
    } catch (error) {
      console.log(`Pulling image: ${this.image}...`);
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(this.image, (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, (err: Error | null) => {
            if (err) return reject(err);
            console.log(`✓ Image pulled: ${this.image}`);
            resolve();
          });
        });
      });
    }
  }

  /**
   * Get container output (stdout + stderr)
   */
  private async getContainerOutput(container: Docker.Container): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      
      container.logs({
        stdout: true,
        stderr: true,
        follow: false
      }, (err: any, stream: any) => {
        if (err) {
          console.error('Failed to get container logs:', err);
          return reject(err);
        }
        
        if (!stream) {
          return resolve('');
        }
        
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString('utf8');
        });
        
        stream.on('end', () => {
          // Clean Docker log headers (8-byte prefix on each line)
          const cleaned = output.split('\n')
            .map(line => line.length > 8 ? line.substring(8) : line)
            .join('\n');
          resolve(cleaned.trim());
        });
        
        stream.on('error', (err: Error) => {
          console.error('Stream error:', err);
          reject(err);
        });
      });
    });
  }

  /**
   * Wait for container to finish
   */
  private async waitForContainer(container: Docker.Container): Promise<number> {
    const data = await container.wait();
    return data.StatusCode;
  }

  /**
   * Create timeout promise
   */
  private timeoutPromise(ms: number): Promise<'timeout'> {
    return new Promise((resolve) => setTimeout(() => resolve('timeout'), ms));
  }

  /**
   * Calculate statistics from timing measurements
   */
  protected calculateStatistics(times: number[]): { mean: number; stdDev: number } {
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
    };
  }
}

