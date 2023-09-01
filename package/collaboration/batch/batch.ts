export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
// 批处理选项
export interface BatchOptions<T, R> {
  onData?: (input: T) => T;
  onBatchData?: (inputs: T[]) => T[] | T;
  onResult?: (result: Awaited<R>) => Awaited<R>;
  onBatchResult?: (results: Awaited<R>[]) => Awaited<R>[] | Awaited<R>;
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: any) => void;
}

export function batchDecorator<T, R>(
  fn: ((input: T) => Promise<R> | R) | ((input: T) => Promise<R> | R)[],
  options?: BatchOptions<T, R>,
): (input: T | T[]) => Promise<Awaited<R> | Awaited<R>[]> {
  return async (input: T | T[]): Promise<Awaited<R> | Awaited<R>[]> => {
    const { onBatchData, onBatchResult } = options || {};
    const total = Array.isArray(input) ? input.length : 1;
    const isMultipleFns = Array.isArray(fn);
    const functions = isMultipleFns
      ? (fn as ((input: T) => Promise<R> | R)[])
      : [fn as (input: T) => Promise<R> | R];

    let inputs = Array.isArray(input) ? input : [input];

    if (onBatchData) {
      const processedBatch = onBatchData(inputs);
      inputs = Array.isArray(processedBatch)
        ? processedBatch
        : Array(total).fill(processedBatch);
    }

    let allResults: Awaited<R>[] = [];
    let completedCount = 0;
    async function runSingle<T, R>(
      data: T,
      f: (input: T) => Promise<R> | R,
      options: BatchOptions<T, R>,
    ): Promise<Awaited<R> | null> {
      const { onData, onResult, onProgress, onError } = options;
      try {
        const processedData = onData ? onData(data) : data;
        const result = await Promise.resolve(f(processedData));
        const finalResult = onResult ? onResult(result as Awaited<R>) : result; // 类型断言
        onProgress?.(++completedCount, total * functions.length);
        return finalResult as Awaited<R>; // 类型断言
      } catch (error) {
        onError?.(error);
        return null;
      }
    }

    for (const singleFn of functions) {
      const results: Promise<Awaited<R> | null>[] = [];
      for (const data of inputs) {
        results.push(runSingle(data, singleFn, options || {}));
      }
      const resultBatch = await Promise.all(results);
      allResults = allResults.concat(
        resultBatch.filter(Boolean) as Awaited<R>[],
      );
    }

    if (onBatchResult) {
      const finalBatchResult = onBatchResult(allResults);
      return finalBatchResult;
    }

    return allResults;
  };
}
