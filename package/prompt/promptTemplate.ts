import {
  milvusVectorDB,
  milvusVectorDBPromptTemplateSchema,
  milvusVectorDBSchema,
} from "llm-ops/db/index";
import {
  createMessageSchema,
  PolishPromptTemplate,
  AgentPromptTemplate,
  createMessage,
} from "llm-ops/prompt/index";
/**
 * 主要的模板数据结构。
 *
 * @property {string} name - 提示模板的名称。可能的值为："polishPromptTemplate"、"agentPromptTemplate" 或其他字符串。
 * @property {MultiPromptSchema[] | any[]} [prompt] - 一个可选的提示模板数组。
 * @property {Record<string, any>} [schema] - 一个可选的记录对象，用于存储额外的数据模板。
 * @property {string} [COLLECTION_NAME] - 一个可选的集合名称，用于指定向量数据库的集合。
 */
export interface PromptsSchema
  extends Omit<milvusVectorDBSchema, "COLLECTION_NAME" | "llm"> {
  name: "polishPromptTemplate" | "agentPromptTemplate" | string;
  prompt?: MultiPromptSchema[] | any[];
  schema?: Record<string, any>;
  COLLECTION_NAME?: string;
}
/**
 * 多重提示模板数据结构。
 *
 * @property {string} [COLLECTION_NAME] - 一个可选的集合名称，用于指定向量数据库的集合。
 */
export interface MultiPromptSchema
  extends createMessageSchema,
    Omit<milvusVectorDBPromptTemplateSchema, "content"> {
  COLLECTION_NAME?: string;
}
/**
 * 格式化提示模板函数。
 *
 * 此函数的主要目的是为了从提供的`prompts`对象中提取出一个格式化的提示模板。
 * 这可以是一个单一的模板，也可以是一个模板数组。
 *
 * @param {PromptsSchema} prompts - 提供的提示模板对象。
 *
 * @returns {Promise<any[]>} 返回一个异步处理的格式化的提示模板数组。
 *
 * @example
 * ```typescript
 * const promptsData = {
 *   name: "agentPromptTemplate",
 *   schema: { role: "user" },
 * };
 * const formattedPrompts = await formatPromptTemplate(promptsData);
 * ```
 *
 * @throws {Error} 当提示中缺少`COLLECTION_NAME`时抛出错误。
 * @throws {Error} 当提供的提示是无效的时抛出错误。
 */
export const formatPromptTemplate = async (prompts: PromptsSchema) => {
  let vectorDB: milvusVectorDB | undefined = undefined;
  !!prompts.COLLECTION_NAME &&
    (vectorDB = new milvusVectorDB({
      COLLECTION_NAME: prompts.COLLECTION_NAME,
      ...prompts,
    }));
  const formatPrompts = async (prompts: MultiPromptSchema[]) => {
    const _ = await Promise.all(
      prompts.map((prompt) => {
        return (async () => {
          if (typeof prompt === "string") {
            return createMessage({
              role: "user",
              content: prompt,
            });
          }
          if (
            typeof prompt === "object" &&
            !!prompt.vector &&
            !!prompt.output_fields
          ) {
            if (!vectorDB && !prompt.COLLECTION_NAME) {
              throw new Error("No COLLECTION_NAME in prompt");
            }
            let db: milvusVectorDB | undefined = vectorDB || undefined;
            !!prompt.COLLECTION_NAME &&
              (db = new milvusVectorDB({
                COLLECTION_NAME: prompt.COLLECTION_NAME,
                ...prompt,
              }));
            const res = db
              ? await db.generatePromptTemplate(prompt)
              : undefined;
            return res;
          }
          if (
            typeof prompt === "object" &&
            !!prompt.contentSlots &&
            !!prompt.content
          ) {
            return createMessage(prompt);
          }
          return prompt;
        })();
      }),
    );
    if (_.some((item) => !item?.role || !item?.content)) {
      throw new Error(`Invalid prompts: ${JSON.stringify(_)}`);
    }
    return _;
  };
  switch (prompts?.name) {
    case "polishPromptTemplate":
      return new PolishPromptTemplate(prompts.schema || {}).format();
    case "agentPromptTemplate":
      if (!prompts?.schema || !("role" in prompts.schema)) {
        return [];
      }
      return new AgentPromptTemplate(
        prompts.schema as { role: string },
      ).format();
    default:
      if (prompts.prompt) {
        return await formatPrompts(prompts.prompt);
      } else {
        return [];
      }
  }
};
