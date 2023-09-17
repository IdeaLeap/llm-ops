import { Chain, structSchema, chainSchema } from "@idealeap/gwt/chain/index";
import { messageType } from "@idealeap/gwt/llm/index";
import { Result, error } from "@idealeap/gwt/utils/index";
import {
  PromptsSchema,
  formatPromptTemplate,
} from "@idealeap/gwt/prompt/index";
export interface BaseAgentCallSchema {
  request: messageType | string;
  prompts?: PromptsSchema;
  struct?: structSchema;
}

export class BaseAgent {
  prompt?: messageType[];
  chain?: Chain;
  constructor(params: chainSchema) {
    this.chain = new Chain(params);
  }
  async call(params: BaseAgentCallSchema): Promise<Result<any>> {
    const { prompts, ...rest } = params;
    if (!this.chain) {
      return error("Chain not initialized");
    }
    if (prompts) {
      this.prompt =
        ((await formatPromptTemplate(prompts)) as messageType[]) || [];
    } else {
      this.prompt = [];
    }
    const result =
      (await this.chain.call({
        prompt: this.prompt,
        ...rest,
      })) || undefined;
    return result;
  }
}
