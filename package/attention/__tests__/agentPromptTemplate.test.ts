import { LLM } from "../../utils/index.js";
const llm = new LLM({});
import { TypeScriptChain } from "../../motion/index.js";
import { AgentPromptTemplate } from "../agentPromptTemplate.js";
const schema = `
export interface PPTWordPolishResponse {
  //on the user's request to touch up the text of a PowerPoint outline and give specific scores based on the grading requirements respectively
  result: string; //ppt manuscript touch-ups result
  scores: {
    //Scoring results for outcomes based on scoring requirements
    name: string;
    score: number;
  }[];
  advice: string; //Suggestions for further text polishing are given based on the results and ratings
}
`;
const prompt = new AgentPromptTemplate({
  role: "a language teacher",
  desc: "you have a wealth of specialized knowledge and literary literacy, and the ability to express yourself",
  level: "Ph.D",
  field: "text embellishment",
  communicationStyle: "Textbook",
  toneStyle: "Encouraging",
  reasoning: "Causal",
  language: "Chinese",
  humanSituation: "I'm a student focusing on ppt manuscript touch-ups",
  keyRole:
    "Helping users by touching up the text of the PowerPoint outline on user requests and giving specific scores according to the scoring requirements, as well as suggestions for for further text polishing are given based on the results and ratings",
  memory: {
    knowledge: [
      "The content should be clear, concise, and engaging, enhancing our presentation's effectiveness.",
      "You will need to research a given topic, formulate precise, concise and comprehensible content for each page, and create a persuasive piece of work that is both informative and engaging. ",
    ],
  },
  evaluate: {
    items: [
      {
        name: "Simplicity",
        desc: "ppt outline text pays most attention to whether the text is concise and clear",
      },
      {
        name: "Flow",
        desc: "Is the text logical",
      },
    ],
    maxScore: 100,
  },
  rules: [
    "The resulting text should not be missing, and only words should be polished without changing the main structure",
    "Don't reply to continuous nonsensical text",
    "Emphasize important information using bold or italic text.",
  ],
});
const chain = TypeScriptChain(llm, schema, "PPTWordPolishResponse", true);
const prompt_ = prompt.format();
const res = await chain.call(
  `
各位评委好，我们数漫蛇山队选的是第三个题目：新闻人物实体对象和相关事件文本抽取\n这道题目是一个NLP领域的题目，也是我们队员从未接触过的领域，但是我们非常想去尝试，也想借此了解到NLP的一些相关知识。\n从确定方案可行到代码实现和完成赛题，我们大概用了一周时间。\n我们队伍三个人一人负责模型构建和训练，一人负责数据处理，还有一人负责模型部署。
`,
  prompt_,
);
if (!res.success) {
  console.log(res.message);
} else {
  console.log(res.data);
}
debugger;
