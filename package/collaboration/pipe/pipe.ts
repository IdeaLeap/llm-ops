// 本代码由GPT4生成，具体可见https://pandora.idealeap.cn/share/33072598-a95f-4188-9003-76ccc5d964cb
import { batchDecorator, BatchOptions, PipeRegistryType } from "@idealeap/gwt";
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
  batch?: boolean;
  type?: string;
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

export type SerializablePipeOptions = Omit<
  PipeOptions<any, any>,
  "preProcess" | "postProcess" | "errProcess"
>;

export interface SerializablePipelineOptions
  extends Omit<PipelineOptions, "emitter" | "errProcess" | "onProgress"> {
  pipes: SerializablePipeOptions[];
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

  // 从一个 SerializablePipeOptions 对象创建一个 Pipe 实例
  static fromJSON<T, R>(
    json: SerializablePipeOptions,
    callback: (input: T, context: PipelineContext) => MaybePromise<R>,
    predefinedTypes?: PipeRegistryType,
  ): Pipe<T, R> {
    if (json.type && predefinedTypes) {
      const predefinedCallback = predefinedTypes.get(json.type);
      if (predefinedCallback) {
        return new Pipe(predefinedCallback, json as PipeOptions<T, R>);
      }
    }

    if (!json.id) {
      throw new Error("JSON configuration for Pipe must contain an 'id' field");
    }

    return new Pipe(callback, json as PipeOptions<T, R>);
  }

  // 新增一个 static 方法用于创建新实例，并支持链式调用
  static create<T, R>(
    callback: (input: T, context: PipelineContext) => MaybePromise<R>,
    options?: Partial<PipeOptions<T, R>>,
  ): Pipe<T, R> {
    return new Pipe(callback, options as PipeOptions<T, R>);
  }

  setId(id: string): this {
    this.options.id = id;
    return this;
  }

  setDescription(description: string): this {
    this.options.description = description;
    return this;
  }

  setDependencies(deps: string[]): this {
    this.options.dependencies = deps;
    return this;
  }

  enableBatching(): this {
    this.options.batch = true;
    return this;
  }

  setRetries(retries: number): this {
    this.options.retries = retries;
    return this;
  }

  // 添加一个动态依赖检查函数，返回一个布尔值以确定是否应执行该 Pipe
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldExecute(context: PipelineContext): boolean {
    // 自定义逻辑，例如：
    // return context.stepResults.get('someDependency') !== 'someValue';
    return true;
  }
}

// 主函数
export class Pipeline {
  private pipes: Pipe<any, any>[] = [];
  private options: PipelineOptions;

  constructor(pipes: Pipe<any, any>[], options: PipelineOptions = {}) {
    this.pipes = pipes;
    this.options = options;
  }

  // 预处理步骤，用于在实际执行前验证所有依赖关系
  verifyDependencies(): boolean {
    const existingPipeIds = new Set(this.pipes.map((pipe) => pipe.options.id));
    for (const pipe of this.pipes) {
      if (pipe.options.dependencies) {
        for (const dep of pipe.options.dependencies) {
          if (!existingPipeIds.has(dep)) {
            throw new Error(
              `Dependency ${dep} for pipe ${pipe.options.id} not found.`,
            );
          }
        }
      }
    }
    return true;
  }

  // 删除 Pipe
  removePipe(id: string): this {
    this.pipes = this.pipes.filter((pipe) => pipe.options.id !== id);
    return this;
  }

  async execute(input: any): Promise<Map<string, any> | Map<string, any>[]> {
    this.verifyDependencies(); // 在执行前验证依赖关系
    const emitter = this.options.emitter || new EventEmitter();
    const abortController = new AbortController();
    const context: PipelineContext = {
      stepResults: new Map(),
      emitter,
      abortController,
    };

    let lastOutput: any = input;

    try {
      for (let i = 0; i < this.pipes.length; i++) {
        const pipe = this.pipes[i];

        if (!pipe.shouldExecute(context)) {
          continue;
        }

        lastOutput = await pipe.execute(lastOutput, context);
        emitter.emit("stepComplete", i + 1, this.pipes.length, lastOutput);
        this.options.onProgress?.(i + 1, this.pipes.length);
      }
    } finally {
      this.pipes.forEach((pipe) => pipe.options.destroyProcess?.());
      this.options.destroyProcess?.();
    }

    return context.stepResults;
  }
  // 从一个 SerializablePipelineOptions 和函数映射创建一个 Pipeline
  static fromJSON(
    json: SerializablePipelineOptions,
    fnMap: Record<
      string,
      (input: any, context: PipelineContext) => MaybePromise<any>
    >,
    predefinedTypes?: PipeRegistryType,
  ): Pipeline {
    if (!Array.isArray(json.pipes)) {
      throw new Error("Invalid JSON configuration: 'pipes' must be an array");
    }

    const pipes = json.pipes.map((pipeJson: SerializablePipeOptions) => {
      const fn =
        fnMap[pipeJson.id] ||
        (predefinedTypes && pipeJson.type
          ? predefinedTypes.get(pipeJson.type)
          : undefined);
      if (!fn) {
        throw new Error(`Function not found for id: ${pipeJson.id}`);
      }
      return Pipe.fromJSON(pipeJson, fn, predefinedTypes);
    });

    return new Pipeline(pipes, json);
  }

  // 新增一个 static 方法用于创建新实例，并支持链式调用
  static create(options?: PipelineOptions): Pipeline {
    return new Pipeline([], options);
  }

  // 添加 Pipe 并返回 this，以支持链式调用
  addPipe<T, R>(pipe: Pipe<T, R>): this {
    this.pipes.push(pipe);
    return this;
  }

  // 设置进度回调并返回 this，以支持链式调用
  setOnProgress(callback: (completed: number, total: number) => void): this {
    this.options.onProgress = callback;
    return this;
  }

  // 序列化为 JSON 的方法
  toJSON(): SerializablePipelineOptions {
    return {
      pipes: this.pipes.map((pipe) => ({
        id: pipe.options.id,
        description: pipe.options.description,
        dependencies: pipe.options.dependencies,
        retries: pipe.options.retries,
        timeout: pipe.options.timeout,
        batch: pipe.options.batch,
      })),
    };
  }
}

// 请进一步完善上述代码的功能，例如

// 请给出完整的Ts代码和示例，没有变化的代码可以省略，但是不要函数中间省略。
