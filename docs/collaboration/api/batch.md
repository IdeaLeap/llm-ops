# BatchDecorator

> 该功能由GPT4生成，具体见[share link](https://pandora.idealeap.cn/share/26cf4f3d-9089-4dbc-87ef-63bc01ed5bb2).

## 概述

`BatchDecorator` 是一个 TypeScript 函数装饰器，用于对异步或同步函数进行批处理操作。它支持多种可选的回调，如数据预处理、结果后处理、进度跟踪以及错误处理。

## 类型定义

### BatchOptions<T, R>

批处理选项的接口定义。

```typescript
export interface BatchOptions<T, R> {
  onData?: (input: T) => T;
  onBatchData?: (inputs: T[]) => T[] | T;
  onResult?: (result: Awaited<R>) => Awaited<R>;
  onBatchResult?: (results: Awaited<R>[]) => Awaited<R>[] | Awaited<R>;
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: any) => void;
}
```

#### 参数

- `onData`: 数据预处理回调，用于单个输入数据的预处理。
- `onBatchData`: 批量数据预处理回调，用于整批输入数据的预处理。
- `onResult`: 结果后处理回调，用于单个输出结果的后处理。
- `onBatchResult`: 批量结果后处理回调，用于整批输出结果的后处理。
- `onProgress`: 进度跟踪回调，提供已完成的数量和总数。
- `onError`: 错误处理回调，捕获并处理运行过程中出现的错误。

## 主函数

### batchDecorator

```typescript
export function batchDecorator<T, R>(
  fn: ((input: T) => Promise<R> | R) | ((input: T) => Promise<R> | R)[],
  options?: BatchOptions<T, R>,
): (input: T | T[]) => Promise<Awaited<R> | Awaited<R>[]>;
```

#### 参数

- `fn`: 需要进行批处理的函数，可以是异步或同步。也可以是一个函数数组。
- `options`: 批处理选项，详见 `BatchOptions<T, R>`。

#### 返回值

返回一个新的函数，该函数接受单个输入或输入数组，并返回一个包含所有结果的 Promise。

## 辅助函数

### runSingle

```typescript
async function runSingle<T, R>(
      data: T,
      f: (input: T) => Promise<R> | R,
      options: BatchOptions<T, R>,
    ): Promise<Awaited<R> | null>
```

#### 参数

- `data`: 单个输入数据。
- `f`: 单个需要进行批处理的函数。
- `options`: 批处理选项。
- `completedCount`: 已完成的数量。
- `total`: 总数量。

#### 返回值

返回单个处理结果或在出错时返回 `null`。

该函数主要用于内部，以简化 `batchDecorator` 的逻辑。
