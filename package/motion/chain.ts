import { FunctionChain } from "./function.js";
import { TypeScriptChain } from "./typechat.js";
import {
  LLM,
  createLLMSchema,
  messageType,
  functionsType,
  function_callType,
} from "../utils/index.js";
export interface chainSchema {
  llmSchema?: createLLMSchema;
  chainName?: string;
}
export interface structSchema {
  functions?: functionsType;
  function_call?: function_callType;
  schema?: string;
  typeName?: string;
}
export interface chainCallSchema {
  request: messageType | string;
  prompt?: messageType[];
  struct?: structSchema;
}
export class Chain {
  llm: LLM;
  chainName?: string;
  chain: FunctionChain | TypeScriptChain;
  constructor(params: chainSchema) {
    const { llmSchema, chainName } = params;
    this.llm = new LLM(llmSchema || {});
    this.chainName = chainName || "";
    switch (this.chainName) {
      case "typeChat":
        this.chain = new TypeScriptChain(this.llm);
        break;
      default:
        this.chain = new FunctionChain(this.llm);
        break;
    }
  }
  async call(params: chainCallSchema) {
    const { request, prompt, struct } = params;
    switch (this.chainName) {
      case "typeChat":
        return await this.chain.call({
          request,
          prompt: prompt || [],
          schema: struct?.schema,
          typeName: struct?.typeName,
          verbose: true,
        });
      default:
        return await this.chain.call({
          request,
          prompt: prompt || [],
          functions: struct?.functions,
          function_call: struct?.function_call,
          verbose: true,
        });
    }
  }
}
