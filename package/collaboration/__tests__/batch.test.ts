import { batchDecorator, BaseAgent } from "@idealeap/gwt";
test("batchDecorator", async () => {
  // 使用示例

  const asyncMultiplyByTwo = async (x: number): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x * 2);
      }, 100);
    });
  };

  const asyncAddThree = async (x: number): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x + 3);
      }, 100);
    });
  };

  const batchedFunctions = batchDecorator([asyncMultiplyByTwo, asyncAddThree], {
    onData: (x: number) => x + 1,
    onResult: (x: number) => x * 10,
    onProgress: (completed, total) => {
      console.log(`Completed: ${completed}, Total: ${total}`);
    },
  });

  await (async () => {
    const results = await batchedFunctions([1, 2, 3]);
    console.log("Final Results:", results);
    //jest test equal
    expect(results).toEqual([40, 60, 80, 50, 60, 70]);
  })();
});

test("更简单的batchDecorator使用", async () => {
  const fn = (x: string) => {
    return `_-${x}-_`;
  };
  const res = await batchDecorator(fn, {
    onResult: (x: string) => {
      return `*${x}*`;
    },
  })(["a", "b", "c"]);
  console.log(res);
});

test("onBatchResult", async () => {
  const fn = (x: string) => {
    return `_-${x}-_`;
  };
  const res = await batchDecorator(fn, {
    onBatchResult: (x: string[]) => {
      return `*${JSON.stringify(x)}*`;
    },
  })(["a", "b", "c"]);
  console.log(res);
  expect(res).toEqual(`*["_-a-_","_-b-_","_-c-_"]*`);
});

test("onBatchResult with Prompt", async () => {
  const data = (await (
    await fetch("https://cos.idealeap.cn/Other/agent.json")
  ).json()) as { agents: any[] };
  const fn = async (data: Record<string, any>) => {
    const agent = new BaseAgent(data.agents[0].params);
    const res = await agent.call({
      request: `你好，非常欢迎你来到我身边~我是xxx，我会把最美好的一面呈现给你！`,
      prompts: data.agents[0].params.prompts,
      struct: data.agents[0].params.struct,
    });
    if (!res.success) {
      return res.message;
    } else {
      return res.data;
    }
  };
  const res = await batchDecorator(fn, {})(Array(3).fill(data));
  console.log(res);
});
