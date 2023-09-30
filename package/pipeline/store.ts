import * as OriginalPipeline from "@idealeap/pipeline";
/**
 * 从 "@idealeap/pipeline" 中导出所有内容
 */
export * from "@idealeap/pipeline";
import { createMessage } from "llm-ops/prompt/index";
import { BaseAgent } from "llm-ops/agent/index";
import { LLM } from "llm-ops/llm/index";
import { Chain } from "llm-ops/chain/index";
import { formatPromptTemplate } from "llm-ops/prompt/index";
import { milvusVectorDB } from "llm-ops/db/index";
/**
 * 对原始的管道库进行定制
 */
OriginalPipeline.PipeRegistry.customFn = {
  /**
   * LLM的处理函数
   * @param input - 输入数据
   * @param context - 管道上下文
   * @returns 返回LLM的输出结果
   */
  llm: async (input: any, context: OriginalPipeline.PipelineContext) => {
    let request = input;
    const params = context.stepParams["self_params"];
    if (typeof input === "string") {
      request = createMessage({
        role: "user",
        content: input,
      });
    }
    const llm = new LLM({
      ...params,
      cache: false,
    });
    if (!!params.messages) {
      //将request添加到message中
      params.messages.push(request);
    }
    const messages = params.messages || [request];
    const _ = await llm.chat({
      messages: messages,
      ...params,
    });
    return _.choices[0]?.message.content;
  },
  /**
   * chain的处理功能
   * @param input - 输入数据
   * @param context - 管道上下文
   * @returns 返回chain处理的输出结果
   */
  chain: async (input: any, context: OriginalPipeline.PipelineContext) => {
    const params = context.stepParams["self_params"];
    const llm = new LLM({ ...params, cache: false });
    const chain = new Chain({ ...params, llm });
    let request = input;
    if (typeof input === "string") {
      request = {
        request: createMessage({
          role: "user",
          content: input,
        }),
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
  /**
   * agent的处理函数
   * @param input - 输入数据
   * @param context - 管道上下文
   * @returns 返回agent调用的输出结果
   */
  agent: async (input: any, context: OriginalPipeline.PipelineContext) => {
    const params = context.stepParams["self_params"];
    const agent = new BaseAgent(params);
    const _ = await agent.call({
      request: input,
      ...params,
    });
    if (!_.success) {
      console.error(_.message);
      throw new Error(_.message);
    } else {
      return _.data;
    }
  },
  /**
   * 提示模板格式化功能
   * @param input - 输入数据
   * @param context - 管道上下文
   * @returns 返回格式化后的提示模板
   */
  promptTemplate: async (
    input: any,
    context: OriginalPipeline.PipelineContext,
  ) => {
    const params = context.stepParams["self_params"];
    const _ = await formatPromptTemplate(params);
    return _;
  },
  /**
   * Milvus搜索功能的处理函数
   * @param input - 输入数据
   * @param context - 管道上下文
   * @returns 返回Milvus搜索的结果
   */
  milvusSearch: async (
    input: any,
    context: OriginalPipeline.PipelineContext,
  ) => {
    const params = context.stepParams["self_params"];
    const db = new milvusVectorDB(params);
    const res = await db.search({
      vector: await db.generateVector(input),
      ...params,
    });
    if (res.status.error_code == "Success") {
      console.log(res.results);
      return res.results;
    } else {
      console.log(res.status.reason);
      throw new Error(res.status.reason);
    }
  },
};
/**
 * 扩展原始的PipeRegistry类
 */
export class PipeRegistry extends OriginalPipeline.PipeRegistry {
  /**
   * PipeRegistry的构造函数
   */
  constructor() {
    super();
  }
}
