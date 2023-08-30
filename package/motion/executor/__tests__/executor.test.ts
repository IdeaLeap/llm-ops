import { DynamicExecutor, batchDecorator } from "@idealeap/gwt";

test("DynamicExecutor", async () => {
  // 使用示例
  const executor = new DynamicExecutor({
    logging: true,
    timeout: 5000,
    environment: { customVar: "Hello, world!" },
    // allowedBuiltins: ["fetch"],
  });

  await (async () => {
    const result = await executor.execute<number | string | null>(
      `
    if (fetch) {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        const data = await response.json();
        return data.id;
      } catch (e) {
        return 'Fetch failed';
      }
    } else {
      return customVar.length + args[0] + args[1];
    }
  `,
      1,
      2,
    );
    expect(result).toEqual(16);
    console.log(result);
  })();
});

test("DynamicExecutor with batchDecorator", async () => {
  const fn = async (x: number) => {
    const executor = new DynamicExecutor({
      logging: true,
      timeout: 5000,
      environment: { customVar: "Hello, world!" },
      allowedBuiltins: ["fetch"],
    });

    return await executor.execute<number | string | null>(
      `
      if (fetch) {
        try {
          const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
          const data = await response.json();
          return data.id;
        } catch (e) {
          return 'Fetch failed';
        }
      } else {
        return customVar.length + args[0];
      }
    `,
      x,
    );
  };
  const res = await batchDecorator(fn)([1, 2, 3]);
  console.log(res);
  expect(res).toEqual([1, 1, 1]);
});
