import { MilvusClient, FieldType } from "@zilliz/milvus2-sdk-node";
import { LLM } from "../utils";
import "dotenv/config";
import { createMessage } from "../attention/basePromptTemplate.js";
export interface milvusVectorDBSchema {
  COLLECTION_NAME: string;
  address?: string;
  username?: string;
  password?: string;
  llm?: LLM;
}
export interface milvusVectorDBQuerySchema {
  filter: string;
  output_fields: string[];
  limit?: number;
}
export interface milvusVectorDBSearchSchema {
  vector: number[];
  filter?: string;
  output_fields?: string[] | string;
  limit?: number;
  consistency_level?: any; //不知道是啥
}
export interface milvusVectorDBPromptTemplateSchema
  extends milvusVectorDBSearchSchema {
  content?: string | null;
}
export interface milvusVectorDBCreateSchema {
  fields: FieldType[];
}
export interface milvusVectorDBUploadSchema {
  partition_name?: string;
  fields_data?: Record<string, any>[];
  index: milvusVectorDBIndexSchema;
}
export interface milvusVectorDBIndexSchema {
  field_name: string;
  metric_type: string;
}
export class milvusVectorDB {
  milvusClient: MilvusClient;
  COLLECTION_NAME: string;
  llm: LLM | undefined = undefined;
  constructor(params: milvusVectorDBSchema) {
    const { address, username, password, COLLECTION_NAME, llm } = params;
    !!llm && (this.llm = llm);
    this.COLLECTION_NAME = COLLECTION_NAME;
    this.milvusClient = new MilvusClient({
      address: address || process.env.MILVUS_ADDRESS || "localhost:19530",
      username: username || undefined,
      password: password || undefined,
    });
  }
  async query(params: milvusVectorDBQuerySchema) {
    const { filter, output_fields, limit } = params;
    console.time("Query time");
    const query = await this.milvusClient.query({
      collection_name: this.COLLECTION_NAME,
      filter: filter,
      output_fields: output_fields || [],
      limit: limit || 100,
    });
    console.timeEnd("Query time");
    return query;
  }
  async search(params: milvusVectorDBSearchSchema) {
    const { vector, output_fields, limit, consistency_level, filter } = params;
    console.time("Search time");
    const search = await this.milvusClient.search({
      collection_name: this.COLLECTION_NAME,
      vector:
        typeof vector == "string" ? await this.generateVector(vector) : vector,
      filter: filter || undefined,
      output_fields:
        typeof output_fields == "object"
          ? output_fields
          : typeof output_fields == "string"
          ? [output_fields]
          : undefined,
      limit: limit || 100,
      consistency_level: consistency_level || undefined,
    });
    console.timeEnd("Search time");
    return search;
  }
  async generatePromptTemplate(params: milvusVectorDBPromptTemplateSchema) {
    const res = await this.search(params);
    const { output_fields, content, ...rest } = params;
    if (res.status.error_code == "Success") {
      if (typeof output_fields == "string") {
        const results = res.results;
        const output_fields_value = results.map((item) => {
          return item[output_fields];
        });
        const output_fields_value_string = output_fields_value
          .map((item, index) => {
            return `${index + 1}. ${item}`;
          })
          .join("\n");
        const promptTemplate = content
          ? content.replace("{{vector}}", output_fields_value_string)
          : `以下内容为参考的示例：\n${output_fields_value_string}`;

        return createMessage({
          role: "system",
          content: promptTemplate,
          name: "system_memory",
          contentSlots: rest, //支持插槽
        });
      } else {
        throw new Error("output_fields is not string");
      }
    } else {
      console.error(res.status.reason);
      throw new Error(res.status.reason);
    }
  }
  async createCollection(params: milvusVectorDBCreateSchema) {
    const { fields } = params;
    console.time("Create collection time");
    const createCollection = await this.milvusClient.createCollection({
      collection_name: this.COLLECTION_NAME,
      fields: fields,
    });
    console.timeEnd("Create collection time");
    return createCollection;
  }
  async upload(params: milvusVectorDBUploadSchema) {
    const { fields_data, index, partition_name } = params;
    console.time("Upload time");
    await this.milvusClient.insert({
      collection_name: this.COLLECTION_NAME,
      fields_data: fields_data,
      partition_name: partition_name || undefined,
    });
    await this.milvusClient.createIndex({
      collection_name: this.COLLECTION_NAME,
      field_name: index.field_name,
      metric_type: index.metric_type,
    });
    const upload = await this.milvusClient.loadCollectionSync({
      collection_name: this.COLLECTION_NAME,
    });
    console.timeEnd("Upload time");
    return upload;
  }
  async generateVector(data: string) {
    if (!this.llm) {
      this.llm = new LLM({});
    }
    const vector = await this.llm?.embedding(data);
    return vector?.data[0]?.embedding;
  }
}
