import { MilvusClient, FieldType } from "@zilliz/milvus2-sdk-node";
import { LLM } from "../utils";

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
  output_fields: string[];
  limit?: number;
  consistency_level?: any; //不知道是啥
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
      address: address || "localhost:19530",
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
      vector: vector,
      filter: filter || undefined,
      output_fields: output_fields || [],
      limit: limit || 100,
      consistency_level: consistency_level || undefined,
    });
    console.timeEnd("Search time");
    return search;
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
      throw new Error("llm is undefined");
    }
    const vector = await this.llm?.embedding(data);
    return vector?.data[0]?.embedding;
  }
}
