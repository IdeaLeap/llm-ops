import "dotenv/config";
/**
 * `LLM_OPS_CONFIG` 是用于配置操作的类，它包含了与OpenAI、Helicone和Milvus相关的配置信息。
 */
export class LLM_OPS_CONFIG {
  /**
   * OPEN_PATH 对象定义了与Helicone API进行通信时的基础设置。
   *
   * @typeParam {string} baseURL - Helicone API的基础URL。
   * @typeParam {Object} defaultHeaders - 用于与Helicone API通信时的默认请求头。
   */
  static OPEN_PATH = {
    baseURL: "https://oai.hconeai.com/v1",
    defaultHeaders: {
      "Helicone-Auth": `Bearer ${process.env["HELICONE_AUTH_API_KEY"]}`,
    },
  };
  /**
   * OpenAI的API密钥。
   *
   * 从环境变量中获取该密钥。
   */
  static OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
  /**
   * Helicone的授权API密钥。
   *
   * 从环境变量中获取该密钥。
   */
  static HELICONE_AUTH_API_KEY = process.env["HELICONE_AUTH_API_KEY"];
  /**
   * Milvus的服务地址。
   *
   * 从环境变量中获取此地址。
   */
  static MILVUS_ADDRESS = process.env["MILVUS_ADDRESS"];
  /**
   * 用于连接到Milvus服务的用户名。
   *
   * 从环境变量中获取此用户名。
   */
  static MILVUS_USERNAME = process.env["MILVUS_USERNAME"];
  /**
   * 用于连接到Milvus服务的密码。
   *
   * 从环境变量中获取此密码。
   */
  static MILVUS_PASSWORD = process.env["MILVUS_PASSWORD"];
}
