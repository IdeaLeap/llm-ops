type AsyncOrSync<T> = Promise<T> | T;

// 使用一个简单的事件广播器
class EventEmitter {
  private events: Record<string, any[]> = {};

  on(event: string, listener: any) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    this.events[event]?.forEach((listener) => listener(...args));
  }
}

interface PipeOptions<T, R> {
  id: string;
  description: string;
  dependencies?: string[];
  onData?: (input: T, context: ChainPipeContext) => AsyncOrSync<T>;
  onError?: (error: any) => void;
}

interface ChainPipeContext {
  stepResults: Map<string, any>;
  emitter: EventEmitter;
}

interface ChainPipeOptions {
  onProgress?: (completed: number, total: number) => void;
}

class Pipe<T, R> extends EventEmitter {
  constructor(
    private callback: (input: T, context: ChainPipeContext) => AsyncOrSync<R>,
    public options: PipeOptions<T, R>,
  ) {
    super();
  }

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

      context.stepResults.set(this.options.id, result);
      context.emitter.emit(
        "stepComplete",
        result,
        step,
        totalSteps,
        context.stepResults,
      );

      return result;
    } catch (error) {
      this.options.onError?.(error);
      context.emitter.emit("error", error);
      throw new Error(`Pipe ${this.options.id} failed: ${String(error)}`);
    }
  }
}

async function chainPipes(
  pipes: Pipe<any, any>[],
  input: any,
  options?: ChainPipeOptions,
): Promise<any> {
  const context: ChainPipeContext = {
    stepResults: new Map(),
    emitter: new EventEmitter(),
  };
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

const pipe1 = new Pipe<number, number>(
  (input) => {
    return input + 1;
  },
  { id: "pipe1", description: "Increment" },
);

const pipe2 = new Pipe<number, number>(
  (input) => {
    return input * 2;
  },
  { id: "pipe2", description: "Multiply by 2" },
);

// 订阅事件
pipe1.on("stepComplete", (result: any, step: any, totalSteps: any) => {
  console.log(`Step ${step}/${totalSteps} completed with result ${result}`);
});

pipe2.on("stepComplete", (result: any, step: any, totalSteps: any) => {
  console.log(`Step ${step}/${totalSteps} completed with result ${result}`);
});

const run = async () => {
  const results = await chainPipes([pipe1, pipe2], 1, {
    onProgress: (completed, total) => {
      console.log(`${completed}/${total} steps completed.`);
    },
  });

  console.log("All pipes completed:", results);
};

run().catch((error) => console.error(error));
