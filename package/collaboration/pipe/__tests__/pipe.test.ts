import {
  Pipe,
  PipeOptions,
  EventEmitter,
  Pipeline,
  PipelineOptions,
} from "@idealeap/gwt"; // 请替换成你的模块导入方式

test("Pipe", async () => {
  // 创建Pipe实例
  const pipe1Options: PipeOptions<number, number> = { id: "pipe1" };
  const pipe1 = new Pipe<number, number>((input) => {
    return input * 2;
  }, pipe1Options);

  const pipe2Options: PipeOptions<number, string> = {
    id: "pipe2",
    dependencies: ["pipe1"],
  };
  const pipe2 = new Pipe<number, string>((input, context) => {
    const depResult = context.stepResults.get("pipe1");
    return `${input + depResult}`;
  }, pipe2Options);

  // 创建全局EventEmitter实例
  const globalEmitter = new EventEmitter();

  globalEmitter.on(
    "stepComplete",
    (step: any, totalSteps: any, result: any) => {
      console.log(
        `Step ${step}/${totalSteps} completed with result: ${result}`,
      );
    },
  );

  globalEmitter.on("error", (error) => {
    console.log(`An error occurred: ${error}`);
  });

  // 创建ChainPipeOptions
  const PipelineOptions: PipelineOptions = {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
    emitter: globalEmitter,
  };

  // 执行管道
  async function run() {
    try {
      const result = await Pipeline([pipe1, pipe2], 5, PipelineOptions);
      console.log("Final result:", result);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  await run();
});

test("PipeLine", async () => {
  // 创建一个Pipe实例
  const pipe1 = new Pipe<number, number>(
    (input) => {
      return input * 2;
    },
    {
      id: "double",
    },
  );

  // 创建另一个Pipe实例
  const pipe2 = new Pipe<number, number>(
    (input) => {
      return input + 1;
    },
    {
      id: "increment",
    },
  );

  // 使用Pipeline函数来连接这些pipes
  await Pipeline([pipe1, pipe2], 1).then((results) => {
    console.log(results.get("double")); // 输出应该是2
    console.log(results.get("increment")); // 输出应该是3
  });
});
