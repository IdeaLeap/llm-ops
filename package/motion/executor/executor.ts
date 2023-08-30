// 本代码由GPT4生成，具体可见https://pandora.idealeap.cn/share/07ee53fc-e074-46f6-b808-b4f159bb3468

export interface ExecutorConfig {
  timeout?: number;
  logging?: boolean;
  environment?: Record<string, any>;
  allowedBuiltins?: string[];
  beforeExecute?: (code: string) => void;
  afterExecute?: (result: any, code: string, error?: Error) => void;
  validateCode?: (code: string) => boolean;
}

export class DynamicExecutor {
  private config: ExecutorConfig;

  constructor(config?: ExecutorConfig) {
    this.config = config || {};
  }

  private log(message: string) {
    if (this.config.logging) {
      console.log(`[DynamicExecutor]: ${message}`);
    }
  }

  public async execute<T = any>(
    code: string,
    ...args: any[]
  ): Promise<T | null> {
    let result: T | null = null;
    let executionError: Error | undefined = undefined;

    if (
      typeof code !== "string" ||
      (this.config.validateCode && !this.config.validateCode(code))
    ) {
      throw new Error("Invalid or unsafe code");
    }

    // Call the beforeExecute hook if provided
    this.config.beforeExecute?.(code);

    this.log(`Executing code: ${code}`);

    try {
      const sandbox: Record<string, any> = {
        fetch: this.config.allowedBuiltins?.includes("fetch")
          ? fetch
          : undefined,
        ...this.config.environment,
      };
      sandbox.args = args;

      const envKeys = Object.keys(sandbox).join(",");
      const envValues = Object.values(sandbox);

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const func = new Function(
        envKeys,
        `
        "use strict";
        return (async () => {
          ${code};
        })();
      `,
      ).bind(null, ...envValues);

      if (this.config.timeout) {
        const promise = func();
        result = (await Promise.race([
          promise,
          new Promise<T | null>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), this.config.timeout),
          ),
        ])) as T;
      } else {
        result = (await func()) as T;
      }
    } catch (error: unknown) {
      executionError = error as Error;
      this.log(`Error occurred: ${String(executionError)}`);
      result = null;
    }

    // Call the afterExecute hook if provided
    this.config.afterExecute?.(result, code, executionError);

    this.log(`Execution result: ${String(result)}`);
    return result;
  }
}
