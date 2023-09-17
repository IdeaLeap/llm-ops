import { Pipe, Pipeline } from "@idealeap/pipeline";

test("Pipeline", async () => {
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

  const pipeline = new Pipeline([pipe1, pipe2], {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
  });

  // 执行管道
  await pipeline.execute(1).then((results) => {
    console.log("Final results:", results);
  });
});
