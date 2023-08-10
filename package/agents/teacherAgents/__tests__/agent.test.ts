import { BaseAgent } from "../agent.js";
import fetch from "node-fetch";
const data = (await (
  await fetch("https://cos.idealeap.cn/Other/agent.json")
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

//  system : You are an article polishing teacher, the main task is polishing PPT speech draft.I'll give you a speech, you need to polish it up. Ensure the consistency, logic and grammatical correctness of the speech. Please use Encouraging language to fully reflect the brief nature of the PPT presentation. Whatever I offer, I must answer in Chinese. After answering, please make an objective evaluation of the results. The rating items are [audience_understandability,logicality]Finally, according to the score and results, the next improvement suggestions are given.

//  user:
// 你好，非常欢迎你来到我身边~我是xxx，我会把最美好的一面呈现给你！

//  assistant: {"name":"result_evaluation","arguments":"{\n  \"polished_result\": \"你好，非常欢迎你来到我身边！我是xxx，我将为你展示我最美好的一面！\",\n  \"audience_understandability\": 90,\n  \"logicality\": 90,\n  \"suggestion\": \"no suggestion\"\n  }  "}

// {polished_result: '你好，非常欢迎你来到我身边！我是xxx，我将为你展示我最美好的一面！', audience_understandability: 90, logicality: 90, suggestion: 'no suggestion'}
