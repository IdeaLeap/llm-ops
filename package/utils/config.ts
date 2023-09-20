import "dotenv/config";
export class GWT_CONFIG {
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
}
