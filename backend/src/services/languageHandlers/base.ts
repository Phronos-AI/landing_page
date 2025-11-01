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

    console.log('  → [BASE] runInContainer called');
    console.log('  → [BASE] workDir:', workDir);
    console.log('  → [BASE] command:', command.join(' '));
    console.log('  → [BASE] captureOutput:', captureOutput);
    console.log('  → [BASE] timeout:', timeout);

    // Ensure image is pulled
    await this.ensureImage();
    console.log('  → [BASE] Image ready:', this.image);

    console.log('  → [BASE] Creating container...');
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
    console.log('  → [BASE] Container created:', container.id);

    try {
      // Attach to container FIRST, before starting
      // Capture chunks in arrays (will be populated by demuxStream)
      const stdoutChunks: any[] = [];
      const stderrChunks: any[] = [];
      
      if (captureOutput) {
        console.log('  → [DEBUG] Attaching to container streams...');
        const stream: any = await container.attach({
          stream: true,
          stdout: true,
          stderr: true,
          logs: true, // Include existing logs
        });

        console.log('  → [DEBUG] Stream attached, demuxing...');
        
        // Docker multiplexes stdout/stderr - demux and capture in real-time
        this.docker.modem.demuxStream(stream, 
          { write: (chunk: any) => {
            console.log(`  → [DEBUG] STDOUT chunk: ${chunk.length} bytes`);
            stdoutChunks.push(chunk);
          }} as any,
          { write: (chunk: any) => {
            console.log(`  → [DEBUG] STDERR chunk: ${chunk.length} bytes`);
            stderrChunks.push(chunk);
          }} as any
        );
        
        console.log('  → [DEBUG] DemuxStream configured, chunks will be captured');
      } else {
        console.log('  → [DEBUG] captureOutput is FALSE, skipping stream capture');
      }

      // NOW start the container
      console.log('  → [BASE] Starting container...');
      await container.start();
      console.log('  → [BASE] Container started');

      // Wait for container with timeout
      console.log('  → [BASE] Waiting for container to finish...');
      const result = await Promise.race([
        this.waitForContainer(container),
        this.timeoutPromise(timeout),
      ]);

      if (result === 'timeout') {
        console.log('  → [BASE] TIMEOUT!');
        await container.kill();
        throw new Error(`Execution timeout after ${timeout}ms`);
      }
      
      console.log('  → [BASE] Container finished with exit code:', result);

      // Give streams time to flush before reading chunks
      console.log('  → [BASE] Waiting for streams to flush...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Read captured chunks
      console.log('  → [BASE] Reading captured chunks...');
      console.log(`  → [DEBUG] stdoutChunks: ${stdoutChunks.length} chunks`);
      console.log(`  → [DEBUG] stderrChunks: ${stderrChunks.length} chunks`);
      
      const stdoutStr = stdoutChunks.length > 0 ? Buffer.concat(stdoutChunks).toString('utf8') : '';
      const stderrStr = stderrChunks.length > 0 ? Buffer.concat(stderrChunks).toString('utf8') : '';
      const output = (stdoutStr + stderrStr).trim();
      
      console.log('  → Captured output length:', output.length);
      if (output) {
        console.log('  → Captured output preview:', output.substring(0, 200));
      }
      
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
   * Strip markdown code fences from code
   */
  protected stripMarkdown(code: string): string {
    // Remove opening fence: ```python, ```javascript, etc.
    let cleaned = code.replace(/^```[\w]*\s*\n/m, '');
    // Remove closing fence: ```
    cleaned = cleaned.replace(/\n```\s*$/m, '');
    // Also handle if there are multiple fences (shouldn't happen but be safe)
    cleaned = cleaned.replace(/```[\w]*\s*\n/g, '');
    cleaned = cleaned.replace(/\n```/g, '');
    return cleaned.trim();
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

