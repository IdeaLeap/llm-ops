import {
  EventEmitter,
  Pipe,
  // ChainPipeContext,
  ChainPipeOptions,
  chainPipes,
  PipeOptions,
} from "@idealeap/gwt"; // 请替换成你的模块导入方式

test("Pipe", async () => {
  // 创建一个事件广播器实例用于测试
  const globalEmitter = new EventEmitter();

  // // 创建一个全局的上下文，用于保存各个pipe的输出
  // const globalContext: ChainPipeContext = {
  //   stepResults: new Map(),
  //   emitter: globalEmitter,
  // };

  // 定义一个进度跟踪函数
  const progressTracker: ChainPipeOptions = {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
  };

  // 第一个 Pipe: 前处理输入，使其加 1
  const pipe1Options: PipeOptions<number, number> = {
    id: "pipe1",
    description: "Increment by 1",
    preProcess: (input) => {
      return input + 1;
    },
  };
  const pipe1 = new Pipe<number, number>((input) => input * 2, pipe1Options);

  // 第二个 Pipe: 依赖于第一个 Pipe 的结果
  const pipe2Options: PipeOptions<number, number> = {
    id: "pipe2",
    description: "Square the input",
    dependencies: ["pipe1"],
    postProcess: (result) => {
      return result * result;
    },
  };
  const pipe2 = new Pipe<number, number>((input) => input * 3, pipe2Options);

  // 为 stepComplete 事件添加监听器
  globalEmitter.on(
    "stepComplete",
    (result: any, step: any, totalSteps: any, stepResults: any) => {
      console.log(
        `Step ${step} of ${totalSteps} completed with result: ${result}`,
      );
      console.log("All results so far: ", stepResults);
    },
  );

  // 为 error 事件添加监听器
  globalEmitter.on("error", (error: any) => {
    console.log(`Error: ${error}`);
  });

  // 开始执行管道
  await (async () => {
    try {
      await chainPipes([pipe1, pipe2], 1, progressTracker);
    } catch (error) {
      console.error(`Failed to chain pipes: ${String(error)}`);
    }
  })().catch((error) => {
    console.error(`Failed to chain pipes: ${error}`);
  });
});

test("Pipe with batchDecorator", async () => {
  // 创建 Pipes
  const pipe1Options: PipeOptions<number, number> = {
    id: "pipe1",
    description: "Multiply by 2",
    preProcess: (input) => {
      console.log(`Preprocessing in pipe1: ${input}`);
      return input + 1;
    },
    postProcess: (result) => {
      console.log(`Postprocessing in pipe1: ${result}`);
      return result - 1;
    },
    onError: (error) => {
      console.log(`Error in pipe1: ${error}`);
    },
  };

  const pipe1 = new Pipe<number, number>((input) => {
    return input * 2;
  }, pipe1Options);

  const pipe2Options: PipeOptions<number, number> = {
    id: "pipe2",
    description: "Multiply by 3 and add dependency result",
    dependencies: ["pipe1"],
  };

  const pipe2 = new Pipe<number, number>((input, context) => {
    const dependencyResult = context.stepResults.get("pipe1") || 0;
    return (input + dependencyResult) * 3;
  }, pipe2Options);

  // 创建 EventEmitter
  const globalEmitter = new EventEmitter();

  // 添加事件监听器
  globalEmitter.on(
    "stepComplete",
    (result: any, step: any, totalSteps: any) => {
      console.log(`Step ${step} of ${totalSteps} completed. Result: ${result}`);
    },
  );

  globalEmitter.on("error", (error: any) => {
    console.log(`An error occurred: ${error}`);
  });

  // ChainPipeOptions
  const chainOptions: ChainPipeOptions = {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed} of ${total} steps completed.`);
    },
  };

  async function runPipes() {
    // const context: ChainPipeContext = {
    //   stepResults: new Map(),
    //   emitter: globalEmitter,
    // };

    try {
      const results = await chainPipes([pipe1, pipe2], 1, chainOptions);
      console.log(`Final step results: `, results);
    } catch (error) {
      console.log(`Failed to run pipes: ${error as string}`);
    }
  }

  // 执行测试
  await runPipes();
});
