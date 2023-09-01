// 本代码由GPT4生成，具体可见https://pandora.idealeap.cn/share/33072598-a95f-4188-9003-76ccc5d964cb
import { batchDecorator, BatchOptions } from "@idealeap/gwt";
// 类型和接口定义
export type MaybePromise<T> = T | Promise<T>;

// 简单的 EventEmitter 实现
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

export interface PipeOptions<T, R> extends BatchOptions<T, R> {
  id: string;
  description?: string;
  dependencies?: string[];
  retries?: number;
  timeout?: number;
  preProcess?: (input: T, context: PipelineContext) => MaybePromise<T>;
  postProcess?: (result: R, context: PipelineContext) => MaybePromise<R>;
  errProcess?: (error: any, context: PipelineContext) => MaybePromise<boolean>;
  destroyProcess?: () => void;
  batch?: boolean; // 添加 batch 选项
}

export interface PipelineContext {
  stepResults: Map<string, any>;
  emitter: EventEmitter;
  abortController: AbortController;
}

export interface PipelineOptions {
  onProgress?: (completed: number, total: number) => void;
  emitter?: EventEmitter;
  destroyProcess?: () => void;
  errProcess?: (error: any, context: PipelineContext) => MaybePromise<boolean>;
}

const maybeAwait = async <T>(input: MaybePromise<T>) =>
  await Promise.resolve(input);

// 用于处理超时的函数
const withTimeout = <T>(
  promise: MaybePromise<T>,
  timeout: number,
): Promise<T> => {
  const timer = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeout);
  });
  return Promise.race([promise, timer]);
};

// Pipe 类定义
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

  async execute(input: T | T[], context: PipelineContext): Promise<R | R[]> {
    if (this.options.batch) {
      const batchedFunction = batchDecorator(
        (input: T) => this.handleExecution(input, context),
        this.options,
      ) as (input: T | T[]) => Promise<R | R[]>;
      return await batchedFunction(input);
    } else {
      if (Array.isArray(input)) {
        throw new Error("Batch mode is not enabled for this pipe.");
      }
      return await this.handleExecution(input, context);
    }
  }

  private async handleExecution(
    input: T,
    context: PipelineContext,
  ): Promise<R> {
    let retries = this.options.retries || 0;
    while (true) {
      try {
        if (context.abortController.signal.aborted) {
          throw new Error("Operation cancelled");
        }

        // 处理依赖项
        if (this.options.dependencies) {
          for (const dep of this.options.dependencies) {
            if (!context.stepResults.has(dep)) {
              throw new Error(`Dependency ${dep} not found`);
            }
          }
        }

        let promise = this.callback(
          await this.handlePreProcess(input, context),
          context,
        );
        if (this.options.timeout) {
          promise = withTimeout(promise, this.options.timeout);
        }

        const result = await maybeAwait(promise);
        const postProcessedResult = await this.handlePostProcess(
          result,
          context,
        );

        context.stepResults.set(this.options.id, postProcessedResult);

        return postProcessedResult;
      } catch (error) {
        retries--;
        if (this.options.errProcess) {
          const skip = await maybeAwait(
            this.options.errProcess(error, context),
          );
          if (skip) return input as unknown as R;
        }
        if (retries < 0) {
          throw error;
        }
      }
    }
  }
}

// 主函数变成了一个类
export class Pipeline {
  private pipes: Pipe<any, any>[] = [];
  private options: PipelineOptions;

  constructor(pipes: Pipe<any, any>[], options: PipelineOptions = {}) {
    this.pipes = pipes;
    this.options = options;
  }

  // 添加 Pipe
  addPipe(pipe: Pipe<any, any>) {
    this.pipes.push(pipe);
  }

  // 删除 Pipe
  removePipe(id: string) {
    this.pipes = this.pipes.filter((pipe) => pipe.options.id !== id);
  }

  async execute(input: any): Promise<Map<string, any> | Map<string, any>[]> {
    const emitter = this.options.emitter || new EventEmitter();
    const abortController = new AbortController();
    const context: PipelineContext = {
      stepResults: new Map(),
      emitter,
      abortController,
    };

    try {
      for (let i = 0; i < this.pipes.length; i++) {
        try {
          const pipe = this.pipes[i];
          input = await pipe.execute(input, context);
          emitter.emit("stepComplete", i + 1, this.pipes.length, input);
          this.options.onProgress?.(i + 1, this.pipes.length);
        } catch (error) {
          if (this.options.errProcess) {
            const skip = await maybeAwait(
              this.options.errProcess(error, context),
            );
            if (skip) continue;
          }
          throw error;
        }
      }
    } finally {
      this.pipes.forEach((pipe) => pipe.options.destroyProcess?.());
      this.options.destroyProcess?.();
    }

    return context.stepResults;
  }
}

// 请进一步完善该功能，例如。请给出完整的Ts代码和示例，任何代码都不要省略！！！
