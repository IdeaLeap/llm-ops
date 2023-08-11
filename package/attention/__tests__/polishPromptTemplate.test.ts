import { FunctionChain } from "../../motion/index.js";
import { PolishPromptTemplate } from "../polishPromptTemplate.js";
import { LLM, functionsType } from "../../utils/index.js";
const llm = new LLM({});
const functions: functionsType = [
  {
    name: "result_evaluation",
    description:
      "Input the scores of PPT speech polishing results and then output the total score and subsequent improvement suggestions",
    parameters: {
      type: "object",
      properties: {
        polished_result: {
          type: "string",
          description: "PPT speech polishing results",
        },
        audience_understandability: {
          type: "number",
          description: "audience understandability,max score is 100",
        },
        logicality: {
          type: "number",
          description: "logicality,max score is 100.",
        },
        suggestion: {
          type: "string",
          description:
            "subsequent improvement suggestions of PPT speech polishing.if there is no suggestion,please input 'no suggestion'",
        },
      },
      required: [
        "polished_result",
        "audience_understandability",
        "logicality",
        "suggestion",
      ],
    },
  },
];
const reqMessages = new PolishPromptTemplate({
  toneStyle: "Encouraging",
  language: "Chinese",
  evaluate: ["audience_understandability", "logicality"],
});
const chain = new FunctionChain(llm);
const res = await chain.call({
  request: `
    你好，非常欢迎你来到我身边~我是xxx，我会把最美好的一面呈现给你！`,
  prompt: reqMessages.format(),
  functions,
  function_call: { name: "result_evaluation" },
  verbose: true,
});
if (!res.success) {
  console.error(res.message);
} else {
  console.log(res.data);
}
debugger;
// {polished_result: '你好，非常欢迎你来到我的身边！我是xxx，我将为你展示最美好的一面！', audience_understandability: 90, logicality: 90, suggestion: 'no suggestion'}
