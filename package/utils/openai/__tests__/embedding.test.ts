import { LLM } from "@idealeap/gwt";
test("测试Openai的embedding", async () => {
  const llm = new LLM({});
  const res = await llm.embedding("hello world");
  console.log(res.data[0].embedding);
  debugger;
});
