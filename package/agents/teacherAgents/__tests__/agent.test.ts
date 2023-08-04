import { BaseAgent } from "../agent.js";
import fetch from "node-fetch";
const data = (await (
  await fetch(
    "https://idealeap-1254110372.cos.ap-shanghai.myqcloud.com/Other/agent.json",
  )
).json()) as { agents: any[] };
const agent = new BaseAgent(data.agents[0].params);
const res = await agent.call(
  `你好，非常欢迎你来到我身边~我是xxx，我会把最美好的一面呈现给你！`,
);
if (!res.success) {
  console.error(res.message);
} else {
  console.log(res.data);
}
debugger;
