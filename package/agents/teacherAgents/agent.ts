import {
  createLLMSchema,
  LLM,
  Result,
  error,
  functionsType,
  function_callType,
} from "../../utils/index.js";
import { messageType } from "../../utils/index.js";
import { FunctionChain, TypeScriptChain } from "../../motion/index.js";
import {
  PolishPromptTemplate,
  AgentPromptTemplate,
} from "../../attention/index.js";
export interface BaseAgentSchema {
  llmSchema?: createLLMSchema;
  chainName?: string;
}

export interface BaseAgentCallSchema {
  request: messageType | string;
  prompts?: PromptsSchema;
  struct?: structSchema;
}

export interface PromptsSchema {
  name: "none" | "polishPromptTemplate" | "agentPromptTemplate";
  prompt?: messageType[];
  schema: object;
}

export interface structSchema {
  functions?: functionsType;
  function_call?: function_callType;
  schema?: string;
  typeName?: string;
}
export class BaseAgent {
  llm: LLM;
  prompt?: messageType[];
  chain?: any;
  chainName: string;
  constructor(params: BaseAgentSchema) {
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
  async call(params: BaseAgentCallSchema): Promise<Result<any>> {
    const { request, prompts, struct } = params;
    if (!this.chain) {
      return error("Chain not initialized");
    }
    switch (prompts?.name) {
      case "polishPromptTemplate":
        this.prompt = new PolishPromptTemplate(prompts.schema).format();
        break;
      case "agentPromptTemplate":
        if (!prompts?.schema || !("role" in prompts.schema)) {
          this.prompt = [];
          break;
        }
        this.prompt = new AgentPromptTemplate(
          prompts.schema as { role: string },
        ).format();
        break;
      default:
        this.prompt = prompts?.prompt || [];
        break;
    }
    let result = undefined;
    switch (this.chainName) {
      case "typeChat":
        result = await this.chain.call({
          request,
          prompt: this.prompt,
          schema: struct?.schema,
          typeName: struct?.typeName,
          verbose: true,
        });
        break;
      default:
        result = await this.chain.call({
          request,
          prompt: this.prompt,
          functions: struct?.functions,
          function_call: struct?.function_call,
          verbose: true,
        });
        break;
    }
    return result;
  }
}
