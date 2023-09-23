import "dotenv/config";
export class LLM_OPS_CONFIG {
  static OPEN_PATH = {
    baseURL: "https://oai.hconeai.com/v1",
    defaultHeaders: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      "Helicone-Auth": `Bearer ${process.env["HELICONE_AUTH_API_KEY"]}`,
    },
  };
  static OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
  static HELICONE_AUTH_API_KEY = process.env["HELICONE_AUTH_API_KEY"];
  static MILVUS_ADDRESS = process.env["MILVUS_ADDRESS"];
  static MILVUS_USERNAME = process.env["MILVUS_USERNAME"];
  static MILVUS_PASSWORD = process.env["MILVUS_PASSWORD"];
}
