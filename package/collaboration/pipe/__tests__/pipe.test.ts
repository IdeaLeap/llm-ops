import {
  Pipe,
  Pipeline,
  SerializablePipelineOptions,
  PipeRegistry,
} from "@idealeap/gwt"; // 请替换成你的模块导入方式

test("Pipe", async () => {
  const pipe1 = new Pipe<number, number>(
    (input) => {
      return input + 1;
    },
    {
      id: "pipe1",
    },
  );

  const pipe2 = new Pipe<number, number>(
    (input) => {
      return input * 2;
    },
    {
      id: "pipe2",
    },
  );

  const pipeline = new Pipeline([pipe1], {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
  });

  // 动态添加管道
  pipeline.addPipe(pipe2);

  // 执行管道
  await pipeline.execute(1).then((results) => {
    console.log("Final results:", results);
  });
});

test("Pipeline with JSON", async () => {
  // 示例
  const jsonConfig: SerializablePipelineOptions = {
    pipes: [{ id: "step1" }, { id: "step2", timeout: 1000 }],
  };

  const fnMap = {
    step1: (input: string) => `${input}-step1`,
    step2: (input: string) => `${input}-step2`,
  };

  const pipeline = Pipeline.fromJSON(jsonConfig, fnMap);

  // 执行 Pipeline
  await pipeline.execute("我饿").then(console.log);
});

test("Pipeline with 链式调用", async () => {
  // 示例代码
  // 示例
  const pipeline = Pipeline.create()
    .addPipe(
      Pipe.create((input: number) => input + 1, {
        id: "step1",
      }).setDescription("Increment by 1"),
    )
    .addPipe(
      Pipe.create((input: number) => input * 2, {
        id: "step2",
      }).setDescription("Multiply by 2"),
    )
    .setOnProgress((completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    });

  // 执行
  await pipeline.execute(1).then((result) => {
    console.log("Final result:", result);
  });

  // 序列化为 JSON
  const jsonConfig = JSON.stringify(pipeline.toJSON());
  console.log("Serialized config:", jsonConfig);
});

test("pipeRegistry", async () => {
  const pipeRegistry = PipeRegistry.init();
  // 注册预定义的 Pipe 类型
  pipeRegistry.register("FetchData", async () => {
    // 这里用一个简单的 setTimeout 来模拟异步数据获取
    return new Promise((resolve) =>
      setTimeout(() => resolve("fetched data"), 1000),
    );
  });

  pipeRegistry.register("TransformData", () => {
    // 这里只是简单地返回一个字符串，实际情况可能涉及到更复杂的数据转换
    // console.log(input, context);
    return "transformed data";
  });

  const pipelineJson = {
    pipes: [
      {
        id: "FetchData",
        type: "FetchData",
      },
      {
        id: "TransformData",
        type: "TransformData",
      },
    ],
  };

  const pipeline = Pipeline.fromJSON(pipelineJson, {}, pipeRegistry);
  await pipeline.execute(undefined).then((result) => {
    console.log("Final result:", result);
  });

  // 序列化为 JSON
  const jsonConfig = JSON.stringify(pipeline.toJSON());
  console.log("Serialized config:", jsonConfig);
});
