type AsyncOrSync<T> = Promise<T> | T;

interface PipeOptions<T, R> {
  id: string;
  description: string;
  dependencies?: string[];
  onData?: (input: T, context: ChainPipeContext) => AsyncOrSync<T>;
  onResult?: (result: R) => AsyncOrSync<R>;
  onError?: (error: any) => void;
  onStepComplete?: (
    result: R,
    step: number,
    totalSteps: number,
    allResults: Map<string, any>,
  ) => void;
}

interface ChainPipeContext {
  stepResults: Map<string, any>;
}

interface ChainPipeOptions {
  onProgress?: (completed: number, total: number) => void;
}

class Pipe<T, R> {
  constructor(
    private callback: (input: T, context: ChainPipeContext) => AsyncOrSync<R>,
    public options: PipeOptions<T, R>,
  ) {}

  async execute(
    input: T,
    context: ChainPipeContext,
    step: number,
    totalSteps: number,
  ): Promise<R> {
    try {
      if (this.options.dependencies) {
        for (const dep of this.options.dependencies) {
          if (!context.stepResults.has(dep)) {
            throw new Error(`Dependency ${dep} not found`);
          }
        }
      }

      const processedInput = this.options.onData
        ? await Promise.resolve(this.options.onData(input, context))
        : input;
      const result = await Promise.resolve(
        this.callback(processedInput, context),
      );
      const finalResult = this.options.onResult
        ? await Promise.resolve(this.options.onResult(result))
        : result;

      context.stepResults.set(this.options.id, finalResult);
      this.options.onStepComplete?.(
        finalResult,
        step,
        totalSteps,
        context.stepResults,
      );

      return finalResult;
    } catch (error) {
      this.options.onError?.(error);
      throw new Error(`Pipe ${this.options.id} failed: ${String(error)}`);
    }
  }

  static fromConfig<T, R>(
    config: PipeOptions<T, R>,
    callback: (input: T, context: ChainPipeContext) => AsyncOrSync<R>,
  ): Pipe<T, R> {
    return new Pipe(callback, config);
  }

  toConfig(): PipeOptions<T, R> {
    return this.options;
  }
}

async function chainPipes(
  pipes: Pipe<any, any>[],
  input: any,
  options?: ChainPipeOptions,
): Promise<any> {
  const context: ChainPipeContext = { stepResults: new Map() };
  const total = pipes.length;

  for (let i = 0; i < total; i++) {
    const pipe = pipes[i];
    try {
      input = await pipe.execute(input, context, i + 1, total);
      options?.onProgress?.(i + 1, total);
    } catch (error) {
      throw new Error(
        `Chaining failed at Pipe ${pipe.options.id}: ${String(error)}`,
      );
    }
  }

  return context.stepResults;
}

// Example usage
const pipe1 = Pipe.fromConfig(
  { id: "double", description: "Doubles the input" },
  (input: number) => input * 2,
);

const pipe2 = Pipe.fromConfig(
  {
    id: "toString",
    description: "Converts to string",
    dependencies: ["double"],
  },
  (input: number, context) =>
    `Number: ${context.stepResults.get("double") || input}`,
);

const pipe3 = Pipe.fromConfig(
  { id: "toUpperCase", description: "To uppercase" },
  (input: string) => input.toUpperCase(),
);

chainPipes([pipe1, pipe2, pipe3], 1, {
  onProgress: (completed, total) =>
    console.log(`Progress: ${completed}/${total}`),
})
  .then((results) => {
    console.log("All pipes executed successfully", results);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
