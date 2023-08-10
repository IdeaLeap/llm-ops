import { LLM } from "../index.js";
const llm = new LLM({});
const res = await llm.embedding("hello world");
console.log(res.data[0].embedding);
debugger;
