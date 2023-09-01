// 本代码由GPT4生成，具体可见https://pandora.idealeap.cn/share/33072598-a95f-4188-9003-76ccc5d964cb

// 基础类型定义和接口
export type AsyncOrSync<T> = Promise<T> | T;

export class EventEmitter {
  private events: Record<string, ((args?: any) => void)[]> = {};

  on(event: string, listener: (...args: any) => void) {
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
  description?: string;
  dependencies?: string[];
  preProcess?: (input: T, context: PipelineContext) => AsyncOrSync<T>;
  postProcess?: (result: R, context: PipelineContext) => AsyncOrSync<R>;
  onError?: (error: any, context: PipelineContext) => void;
}

export interface PipelineContext {
  stepResults: Map<string, any>;
  emitter: EventEmitter;
}

export interface PipelineOptions {
  onProgress?: (completed: number, total: number) => void;
  emitter?: EventEmitter;
}

// 主逻辑
export class Pipe<T, R> {
  constructor(
    private callback: (input: T, context: PipelineContext) => AsyncOrSync<R>,
    public options: PipeOptions<T, R>,
  ) {}

  async execute(
    input: T,
    context: PipelineContext,
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
        step,
        totalSteps,
        postProcessedResult,
      );

      return postProcessedResult;
    } catch (error) {
      this.options.onError?.(error, context);
      context.emitter.emit("error", error);
      throw error;
    }
  }
}

export async function Pipeline(
  pipes: Pipe<any, any>[],
  input: any,
  options: PipelineOptions = {},
): Promise<Map<string, any>> {
  const emitter = options.emitter || new EventEmitter();
  const context: PipelineContext = {
    stepResults: new Map(),
    emitter,
  };

  for (let i = 0; i < pipes.length; i++) {
    try {
      const pipe = pipes[i];
      input = await pipe.execute(input, context, i + 1, pipes.length);
      options.onProgress?.(i + 1, pipes.length);
    } catch (error) {
      throw new Error(
        `Chaining failed at pipe ${pipes[i].options.id}: ${String(error)}`,
      );
    }
  }

  return context.stepResults;
}

//https://pandora.idealeap.cn/share/e8d8f417-d6b2-4096-84db-e72309ee21b3
