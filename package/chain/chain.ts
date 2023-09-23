import {
  LLM,
  createLLMSchema,
  messageType,
  functionsType,
  function_callType,
} from "llm-ops/llm/index";
import { FunctionChain } from "llm-ops/chain/function";
import { TypeScriptChain } from "llm-ops/chain/typechat";
export interface chainSchema {
  llm?: LLM;
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
  verbose?: boolean;
}
export class Chain {
  llm: LLM;
  chainName?: string;
  chain: FunctionChain | TypeScriptChain;
  constructor(params: chainSchema) {
    const { llmSchema, chainName, llm } = params;
    this.llm = llm || new LLM(llmSchema || {});
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
  exportHistory(){
    return this.chain.exportHistory();
  }
  async call(params: chainCallSchema) {
    const { request, prompt, struct, verbose} = params;
    switch (this.chainName) {
      case "typeChat":
        return await this.chain.call({
          request,
          prompt: prompt || [],
          schema: struct?.schema,
          typeName: struct?.typeName,
          verbose: verbose || false,
        });
      default:
        return await this.chain.call({
          request,
          prompt: prompt || [],
          functions: struct?.functions,
          function_call: struct?.function_call,
          verbose: verbose || false,
        });
    }
  }
}
