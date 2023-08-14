import { MilvusClient } from "@zilliz/milvus2-sdk-node";

export interface milvusVectorDBSchema {
  COLLECTION_NAME: string;
  address?: string;
  username?: string;
  password?: string;
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
export class milvusVectorDB {
  milvusClient: MilvusClient;
  COLLECTION_NAME: string;
  constructor(params: milvusVectorDBSchema) {
    const { address, username, password, COLLECTION_NAME } = params;
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
}
