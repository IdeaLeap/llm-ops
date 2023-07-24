import { createTaggingChain } from "langchain/chains";
import type { FunctionParameters } from "langchain/output_parsers";
import { ChatLLM } from "./utils/model.js";
const schema: FunctionParameters = {
  type: "object",
  properties: {
    sentiment: { type: "string" },
    tone: { type: "string" },
    language: { type: "string" },
  },
  required: ["tone"],
};

const chatModel = ChatLLM();

const chain = createTaggingChain(schema, chatModel);

console.log(await chain.run(`你会不会玩啊！`));
