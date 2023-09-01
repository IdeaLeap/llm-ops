import { Pipe, Pipeline, SerializablePipelineOptions } from "@idealeap/gwt"; // 请替换成你的模块导入方式

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
