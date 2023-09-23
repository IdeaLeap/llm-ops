import {
  milvusVectorDB,
  milvusVectorDBPromptTemplateSchema,
  milvusVectorDBSchema
} from "llm-ops/db/index";
import {
  createMessageSchema,
  PolishPromptTemplate,
  AgentPromptTemplate,
  createMessage,
} from "llm-ops/prompt/index";
export interface PromptsSchema extends Omit<milvusVectorDBSchema,"COLLECTION_NAME" | "llm"> {
  name: "polishPromptTemplate" | "agentPromptTemplate" | string;
  prompt?: MultiPromptSchema[] | any[];
  schema?: Record<string, any>;
  COLLECTION_NAME?: string;
}
export interface MultiPromptSchema
  extends createMessageSchema,
  Omit<milvusVectorDBPromptTemplateSchema,"content"> {
  COLLECTION_NAME?: string;
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
