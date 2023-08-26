import { PolishPromptTemplate } from "./polishPromptTemplate.js";
import { AgentPromptTemplate } from "./agentPromptTemplate.js";
import { createMessage } from "./basePromptTemplate.js";
import {
  milvusVectorDB,
  milvusVectorDBPromptTemplateSchema,
  messageType,
} from "@idealeap/gwt";
export interface PromptsSchema {
  name: "polishPromptTemplate" | "agentPromptTemplate" | string;
  prompt?: MultiPromptSchema[] | any[];
  schema?: object;
  COLLECTION_NAME?: string;
}
export interface MultiPromptSchema
  extends messageType,
    milvusVectorDBPromptTemplateSchema {
  COLLECTION_NAME?: string;
  content: string | null;
}

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
            return createMessage("user", prompt);
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
          //!该方法已弃用 // 如果含有role字段，说明是template，获取除了role,content,name,function_call之外的字段，并对这些字段进行遍历处理，对content中{{}}进行替换。若含有vector字段，说明是milvus的promptTemplate，调用milvus的promptTemplate生成函数
          // if ("role" in prompt && "content" in prompt && !!prompt.content) {
          //   const { role, content, name, function_call, ...rest } = prompt;
          //   const newContent = content.replace(
          //     /{{(.*?)}}/g,
          //     (_, match) => (rest as any)[match.trim()] || "",
          //   );
          //   return createMessage(role, newContent, name, function_call);
          // }
          return prompt;
        })();
      }),
    );
    // 确保_中所有元素都有role和content字段，没有直接报错
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
