import {
  createLLMSchema,
  LLM,
  Result,
  error,
  functionsType,
  function_callType,
} from "../../utils/index.js";
import { messageType } from "../../attention/index.js";
import { FunctionChain, TypeScriptChain } from "../../motion/index.js";
import {
  PolishPromptTemplate,
  AgentPromptTemplate,
} from "../../attention/index.js";
export interface BaseAgentSchema {
  llmSchema?: createLLMSchema;
  prompts?: PromptsSchema;
  chainName?: string;
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
// 初始化输入llmSchema，prompt，request，chainName，schema 输出result
export class BaseAgent<T> {
  llm: LLM;
  prompt?: messageType[];
  chain?: T;
  constructor(params: BaseAgentSchema) {
    const { llmSchema, prompts, chainName, struct } = params;
    this.llm = new LLM(llmSchema || {});
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
    if (!chainName || !struct) {
      this.chain = FunctionChain(this.llm) as unknown as T;
      return;
    }
    switch (chainName) {
      case "typeChat":
        if (!struct.schema || !struct.typeName) {
          this.chain = FunctionChain(this.llm) as unknown as T;
          break;
        }
        this.chain = TypeScriptChain(
          this.llm,
          // struct.schema,
          // struct.typeName,
          // true,
        ) as unknown as T;
        break;
      case "function":
        if (!struct.functions || !struct.function_call) {
          this.chain = FunctionChain(this.llm) as unknown as T;
          break;
        }
        this.chain = FunctionChain(
          this.llm,
          // struct.functions,
          // struct.function_call,
          // true,
        ) as unknown as T;
        break;
    }
  }
  async call(request: messageType | string): Promise<Result<T>> {
    if (!this.chain) {
      return error("Chain not initialized");
    }
    const result = await (
      this.chain as unknown as {
        call: (
          request: messageType | string,
          prompt?: messageType[], //TODO 需要修改
        ) => Promise<Result<T>>;
      }
    ).call(request, this.prompt);
    return result;
  }
}
