import * as OriginalPipeline from "@idealeap/pipeline";
export * from "@idealeap/pipeline";
import { createMessage } from "llm-ops/prompt/index";
import { BaseAgent } from "llm-ops/agent/index";
import { LLM } from "llm-ops/llm/index";
import { Chain } from "llm-ops/chain/index";
export class PipeRegistry extends OriginalPipeline.PipeRegistry {
  constructor() {
    super();
  }
  static override customFn = {
    llm: async (input: any, context: OriginalPipeline.PipelineContext) => {
      let request = input;
      const params = context.stepParams["self_params"];
      if (typeof input === "string") {
        request = [
          createMessage({
            role: "user",
            content: input,
          }),
        ];
      }
      const llm = new LLM({
        ...params,
        cache: false,
      });
      const _ = await llm.chat({
        messages: request,
        ...params,
      });
      return _.choices[0]?.message.content;
    },
    chain: async (input: any, context: OriginalPipeline.PipelineContext) => {
      const params = context.stepParams["self_params"];
      const llm = new LLM({ ...params, cache: false });
      const chain = new Chain({ ...params, llm });
      let request = input;
      if (typeof input === "string") {
        request = {
          request: [
            createMessage({
              role: "user",
              content: input,
            }),
          ],
        };
      }
      const _ = await chain.call({
        ...request,
        ...params,
      });
      if (!_.success) {
        console.error(_.message);
        throw new Error(_.message);
      } else {
        return _.data;
      }
    },
    agent: async (input: any, context: OriginalPipeline.PipelineContext) => {
      const params = context.stepParams["self_params"];
      const agent = new BaseAgent(params);
      const _ = await agent.call({
        request:input,
        ...params,
      });
      if (!_.success) {
        console.error(_.message);
        throw new Error(_.message);
      } else {
        return _.data;
      }
    }
  };
}
