export type AsyncOrSync<T> = Promise<T> | T;

export class EventEmitter {
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

export interface PipeOptions<T, R> {
  id: string;
  description: string;
  dependencies?: string[];
  preProcess?: (input: T, context: ChainPipeContext) => AsyncOrSync<T>;
  postProcess?: (result: R, context: ChainPipeContext) => AsyncOrSync<R>;
  onError?: (error: any) => void;
}

export interface ChainPipeContext {
  stepResults: Map<string, any>;
  emitter: EventEmitter;
}

export interface ChainPipeOptions {
  onProgress?: (completed: number, total: number) => void;
}

export class Pipe<T, R> extends EventEmitter {
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

      const preProcessedInput = this.options.preProcess
        ? await Promise.resolve(this.options.preProcess(input, context))
        : input;

      const result = await Promise.resolve(
        this.callback(preProcessedInput, context),
      );

      const postProcessedResult = this.options.postProcess
        ? await Promise.resolve(this.options.postProcess(result, context))
        : result;

      context.stepResults.set(this.options.id, postProcessedResult);
      context.emitter.emit(
        "stepComplete",
        postProcessedResult,
        step,
        totalSteps,
        context.stepResults,
      );

      return postProcessedResult;
    } catch (error) {
      this.options.onError?.(error);
      context.emitter.emit("error", error);
      throw new Error(`Pipe ${this.options.id} failed: ${String(error)}`);
    }
  }
}

export async function chainPipes(
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
