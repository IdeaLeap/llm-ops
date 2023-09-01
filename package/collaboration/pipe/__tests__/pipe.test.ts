import { Pipe, Pipeline } from "@idealeap/gwt"; // 请替换成你的模块导入方式

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
