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
        // NetworkMode: 'none', // Temporarily enabled for pip install - TODO: use custom image with pytest pre-installed
      },
      AttachStdout: true, // Required for logs to be captured
      AttachStderr: true, // Required for logs to be captured
      Tty: false, // Ensure output is properly captured (no TTY)
      OpenStdin: false,
    });
    console.log('  → [BASE] Container created:', container.id);

    try {
      // Attach to container output BEFORE starting
      let output = '';
      let capturePromise: Promise<Buffer[]> | undefined;
      
      if (captureOutput) {
        console.log('  → [BASE] Attaching to container streams...');
        const stream = await container.attach({
          stream: true,
          stdout: true,
          stderr: true,
        });
        
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        // Store chunks promise for later
        capturePromise = new Promise<Buffer[]>((resolve) => {
          stream.on('end', () => {
            console.log('  → [BASE] Stream ended, collected', chunks.length, 'chunks');
            resolve(chunks);
          });
        });
        
        console.log('  → [BASE] Attached to streams');
      }

      // Start the container
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

      // Process captured output
      if (captureOutput && capturePromise) {
        console.log('  → [BASE] Processing captured output...');
        try {
          const chunks = await capturePromise;
          
          if (chunks.length > 0) {
            const fullBuffer = Buffer.concat(chunks);
            console.log('  → [BASE] Full buffer length:', fullBuffer.length);
            
            // Docker multiplexes stdout/stderr with 8-byte headers
            // Format: [type:1 byte][padding:3 bytes][size:4 bytes][payload:size bytes]
            let offset = 0;
            const outputChunks: string[] = [];
            
            while (offset < fullBuffer.length) {
              // Need at least 8 bytes for header
              if (offset + 8 > fullBuffer.length) break;
              
              // Read payload size (4 bytes, big-endian, starting at offset+4)
              const payloadSize = fullBuffer.readUInt32BE(offset + 4);
              
              // Extract payload (skip 8-byte header)
              if (offset + 8 + payloadSize <= fullBuffer.length) {
                const payload = fullBuffer.slice(offset + 8, offset + 8 + payloadSize);
                outputChunks.push(payload.toString('utf8'));
              }
              
              // Move to next frame
              offset += 8 + payloadSize;
            }
            
            output = outputChunks.join('').trim();
            
            console.log('  → [BASE] Captured output length:', output.length);
            if (output) {
              console.log('  → [BASE] Output preview:', output.substring(0, 200));
            }
          } else {
            console.log('  → [BASE] No chunks collected - output is empty');
          }
        } catch (error) {
          console.log('  → [BASE] Error processing output:', error);
        }
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
    let cleaned = code.trim();
    
    // Remove opening fence at start: ```python, ```rust, etc.
    // Match: optional whitespace, ```, optional language, optional whitespace/newlines
    cleaned = cleaned.replace(/^\s*```[\w]*\s*/m, '');
    
    // Remove closing fence at end: ```
    cleaned = cleaned.replace(/\s*```\s*$/m, '');
    
    // Handle any remaining fences in the middle (shouldn't happen but be safe)
    cleaned = cleaned.replace(/```[\w]*\n/g, '');
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
    
    return { mean, stdDev };
  }
}

