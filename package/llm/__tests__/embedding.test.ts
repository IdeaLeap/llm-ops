import { LLM } from "@idealeap/gwt";
test("测试Openai的embedding", async () => {
  const llm = new LLM({});
  const res = await llm.embedding("你好世界");
  console.log(res.data[0].embedding);
  debugger;
});
