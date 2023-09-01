// 本代码由GPT4生成，具体可见https://pandora.idealeap.cn/share/33072598-a95f-4188-9003-76ccc5d964cb

// 类型和接口定义
export type MaybePromise<T> = T | Promise<T>;

export class EventEmitter {
  private events: Record<string, ((...args: any[]) => void)[]> = {};

  on(event: string, listener: (...args: any[]) => void) {
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
  preProcess?: (input: T, context: PipelineContext) => MaybePromise<T>;
  postProcess?: (result: R, context: PipelineContext) => MaybePromise<R>;
  onError?: (error: any, context: PipelineContext) => void;
  onDestroy?: () => void;
}

export interface PipelineContext {
  stepResults: Map<string, any>;
  emitter: EventEmitter;
}

export interface PipelineOptions {
  onProgress?: (completed: number, total: number) => void;
  emitter?: EventEmitter;
  onDestroy?: () => void;
}

const maybeAwait = async <T>(input: MaybePromise<T>) =>
  await Promise.resolve(input);

// Pipe类定义
export class Pipe<T, R> {
  constructor(
    private callback: (input: T, context: PipelineContext) => MaybePromise<R>,
    public options: PipeOptions<T, R>,
  ) {}

  private async handlePreProcess(
    input: T,
    context: PipelineContext,
  ): Promise<T> {
    return this.options.preProcess
      ? await maybeAwait(this.options.preProcess(input, context))
      : input;
  }

  private async handlePostProcess(
    result: R,
    context: PipelineContext,
  ): Promise<R> {
    return this.options.postProcess
      ? await maybeAwait(this.options.postProcess(result, context))
      : result;
  }

  async execute(input: T, context: PipelineContext): Promise<R> {
    if (this.options.dependencies) {
      for (const dep of this.options.dependencies) {
        if (!context.stepResults.has(dep)) {
          throw new Error(`Dependency ${dep} not found`);
        }
      }
    }
    const preProcessedInput = await this.handlePreProcess(input, context);
    const result = await maybeAwait(this.callback(preProcessedInput, context));
    const postProcessedResult = await this.handlePostProcess(result, context);

    context.stepResults.set(this.options.id, postProcessedResult);

    return postProcessedResult;
  }
}

// 主函数
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

  try {
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      input = await pipe.execute(input, context);
      emitter.emit("stepComplete", i + 1, pipes.length, input);
      options.onProgress?.(i + 1, pipes.length);
    }
    emitter.emit("pipelineComplete", context.stepResults);
  } catch (error) {
    emitter.emit("error", error);
    throw error;
  } finally {
    pipes.forEach((pipe) => pipe.options.onDestroy?.());
    options.onDestroy?.();
  }

  return context.stepResults;
}

// 请进一步完善该功能，例如。请给出完整的Ts代码和示例，任何代码都不要省略！！！
