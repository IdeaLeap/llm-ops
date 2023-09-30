import {
  LLM,
  createLLMSchema,
  messageType,
  functionsType,
  function_callType,
} from "llm-ops/llm/index";
import { FunctionChain } from "llm-ops/chain/function";
import { TypeScriptChain } from "llm-ops/chain/typechat";
/**
 * `Chain` 构造函数的参数数据结构。
 *
 * @typeParam {LLM} [llm] - 一个可选的LLM实例。
 * @typeParam {createLLMSchema} [llmSchema] - 一个可选的LLM模式对象。
 * @typeParam {string} [chainName] - 一个可选的链名称。
 */
export interface chainSchema {
  llm?: LLM;
  llmSchema?: createLLMSchema;
  chainName?: string;
}
/**
 * `call` 方法的`struct`参数的数据结构。
 *
 * @typeParam {functionsType} [functions] - 可选的函数类型。
 * @typeParam {function_callType} [function_call] - 可选的函数调用类型。
 * @typeParam {string} [schema] - 一个可选的模式字符串。
 * @typeParam {string} [typeName] - 一个可选的类型名称。
 */
export interface structSchema {
  functions?: functionsType;
  function_call?: function_callType;
  schema?: string;
  typeName?: string;
}
/**
 * `Chain`类的`call`方法的参数数据结构。
 *
 * @typeParam {messageType | string} request - 请求消息或字符串。
 * @typeParam {messageType[]} [prompt] - 一个可选的消息提示数组。
 * @typeParam {structSchema} [struct] - 一个可选的结构模式。
 * @typeParam {boolean} [verbose] - 一个可选的详细模式标志。
 */
export interface chainCallSchema {
  request: messageType | string;
  prompt?: messageType[];
  struct?: structSchema;
  verbose?: boolean;
}

/**
 * `Chain` 类用于`llm`类的格式化输出。
 *
 */
export class Chain {
  llm: LLM;
  chainName?: string;
  chain: FunctionChain | TypeScriptChain;
  /**
   * 创建一个新的 `Chain` 实例。
   *
   * @param {chainSchema} params - 构造函数的参数对象。
   */
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
  /**
   * 导出链的历史记录。
   *
   * @returns {any} 返回链的历史记录。
   */
  exportHistory() {
    return this.chain.exportHistory();
  }
  /**
   * 调用Chain
   *
   * @param {chainCallSchema} params - 调用方法的参数对象。
   *
   * @returns 返回异步处理的链调用结果。
   */
  async call(params: chainCallSchema) {
    const { request, prompt, struct, verbose } = params;
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
