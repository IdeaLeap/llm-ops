import { MilvusClient, FieldType } from "@zilliz/milvus2-sdk-node";
import { createMessage } from "llm-ops/prompt/index";
import { LLM_OPS_CONFIG } from "llm-ops/utils/index";
import { LLM } from "llm-ops/llm/index";
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
export interface milvusVectorDBUpsertSchema {
  partition_name?: string;
  fields_data?: {
    [x: string]: any;
  }[];
  data?: {
    [x: string]: any;
  }[];
  hash_keys?: Number[];
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
      address: address || LLM_OPS_CONFIG.MILVUS_ADDRESS || "localhost:19530",
      username: username || LLM_OPS_CONFIG.MILVUS_USERNAME || undefined,
      password: password || LLM_OPS_CONFIG.MILVUS_PASSWORD || undefined,
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
    // if (query.status.error_code != "Success") {
    //   console.error(query.status.reason);
    //   throw new Error(query.status.reason);
    // }
    return query;
  }
  async upsert(params: milvusVectorDBUpsertSchema) {
    const { partition_name, fields_data, data, hash_keys } = params;
    console.time("Upsert time");
    const upsert = await this.milvusClient.upsert({
      collection_name: this.COLLECTION_NAME,
      partition_name: partition_name || undefined,
      fields_data: fields_data || undefined,
      data: data || undefined,
      hash_keys: hash_keys || undefined,
    });
    console.timeEnd("Upsert time");
    if (upsert.status.error_code != "Success") {
      console.error(upsert.status.reason);
      throw new Error(upsert.status.reason);
    }
    return upsert;
  }
  async delete(params: { expr: string }) {
    const { expr } = params;
    console.time("Upsert time");
    const res = await this.milvusClient.deleteEntities({
      collection_name: this.COLLECTION_NAME,
      expr,
    });
    console.timeEnd("Upsert time");
    // if (res.status.error_code != "Success") {
    //   console.error(res.status.reason);
    //   throw new Error(res.status.reason);
    // }
    return res;
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
    // if (search.status.error_code != "Success") {
    //   console.error(search.status.reason);
    //   throw new Error(search.status.reason);
    // }
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
    const insertRes = await this.milvusClient.insert({
      collection_name: this.COLLECTION_NAME,
      fields_data: fields_data,
      partition_name: partition_name || undefined,
    });
    if (insertRes.status.error_code != "Success") {
      // console.error(insertRes.status.reason);
      // throw new Error(insertRes.status.reason);
      return insertRes;
    }
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
  async generateVector(data: string): Promise<number[]> {
    if (!this.llm) {
      this.llm = new LLM({});
    }
    const vector = await this.llm?.embedding(data);
    if (!vector || !vector?.data[0] || !vector?.data[0]?.embedding) {
      throw new Error("生成向量失败");
    }
    return vector?.data[0]?.embedding;
  }
}
