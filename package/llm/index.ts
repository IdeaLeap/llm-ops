import OpenAI from "openai";
import { GWT_CONFIG } from "@idealeap/gwt/utils/index";
// only for openai-node ^4.0.0
export type messagesType = OpenAI.Chat.CreateChatCompletionRequestMessage[];
export type messageType = OpenAI.Chat.CreateChatCompletionRequestMessage;
export type resMessagesType = OpenAI.Chat.Completions.ChatCompletion.Choice[];
export type functionsType = OpenAI.Chat.CompletionCreateParams.Function[];
export type function_callType =
  | "none"
  | "auto"
  | OpenAI.Chat.CompletionCreateParams.FunctionCallOption;
export type messageFunctionCallType =
  OpenAI.Chat.CreateChatCompletionRequestMessage.FunctionCall;
export type chatCompletionType = OpenAI.Chat.Completions.ChatCompletion;
export type llmType = OpenAI;
export type chatParamsType = OpenAI.Chat.CompletionCreateParams;
export type resModerationType = OpenAI.ModerationCreateResponse;
export type resEmbeddingType = OpenAI.CreateEmbeddingResponse;

export interface createLLMSchema {
  HELICONE_AUTH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  modelName?:
    | (string & object)
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-16k-0613";
  temperature?: number;
  choice_num?: number | 1;
  stop?: string | null | string[];
  cache?: boolean;
}
export interface ChatSchema {
  function_call?: function_callType;
  messages: messagesType;
  functions?: functionsType;
}

export class LLM {
  llm: llmType;
  tokens: number;
  messages: messagesType;
  modelName?:
    | (string & object)
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-16k-0613";
  temperature?: number;
  function_call?: function_callType;
  functions?: functionsType;
  choice_num?: number | 1;
  stop?: string | null | string[];
  cache?: boolean;
  roleToColor = {
    system: "red",
    user: "green",
    assistant: "blue",
    function: "magenta",
  };

  constructor(params: createLLMSchema) {
    const {
      HELICONE_AUTH_API_KEY = undefined,
      OPENAI_API_KEY = undefined,
      modelName,
      temperature,
      choice_num,
      stop,
      cache = true,
    } = params;
    this.llm = this._createLLM({ HELICONE_AUTH_API_KEY, OPENAI_API_KEY });
    this.tokens = 0;
    this.messages = [];
    this.modelName = modelName || "gpt-3.5-turbo-0613";
    this.temperature = temperature || 0.7;
    this.choice_num = choice_num || 1;
    this.stop = stop || null;
    this.cache = cache;
  }

  private _createLLM({
    HELICONE_AUTH_API_KEY = undefined,
    OPENAI_API_KEY = undefined,
  }: createLLMSchema): llmType {
    const openAIApiKey = OPENAI_API_KEY || GWT_CONFIG.OPENAI_API_KEY;
    if (!openAIApiKey) {
      this.missingEnvironmentVariable(
        "OPENAI_API_KEY Missing! 😅 It's not free!",
      );
    }
    const config =
      GWT_CONFIG.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
        ? GWT_CONFIG.OPEN_PATH
        : {};
    return new OpenAI({
      ...config,
      apiKey: openAIApiKey,
    });
  }

  /**
   * Throws an exception for a missing environment variable.
   */
  private missingEnvironmentVariable(name: string): never {
    throw new Error(`"Missing environment variable: ${name}`);
  }

  async chat(params: ChatSchema): Promise<chatCompletionType> {
    const { messages, function_call, functions } = params;
    try {
      if (!messages) {
        throw new Error("messages is required!");
      }
      !!this.cache &&
        this.messages.length != 0 &&
        (this.messages = [...this.messages, ...messages]);
      !this.cache && (this.messages = messages);
      !!this.cache && this.messages.length == 0 && (this.messages = messages);
      !!function_call && (this.function_call = function_call);
      !!functions && (this.functions = functions);
      const params_: chatParamsType = {
        /**
         * A list of messages comprising the conversation so far.
         * [Example Python code](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb).
         */
        messages: this.messages,
        /**
         * ID of the model to use. See the
         * [model endpoint compatibility](/docs/models/model-endpoint-compatibility) table
         * for details on which models work with the Chat API.
         */
        model: this.modelName || "gpt-3.5-turbo-0613",
        /**
         * Controls how the model responds to function calls. "none" means the model does
         * not call a function, and responds to the end-user. "auto" means the model can
         * pick between an end-user or calling a function. Specifying a particular function
         * via `{"name":\ "my_function"}` forces the model to call that function. "none" is
         * the default when no functions are present. "auto" is the default if functions
         * are present.
         */
        function_call: functions && function_call ? function_call : undefined,
        /**
         * A list of functions the model may generate JSON inputs for.
         */
        functions: functions,
        /**
         * How many chat completion choices to generate for each input message.
         */
        n: this.choice_num || 1,
        stop: this.stop,
        stream: false,
        temperature: this.temperature || 0.7,
        user: "GWT",
      };
      const res = (await this.llm.chat.completions.create(
        params_,
      )) as chatCompletionType;
      this.tokens += res.usage?.total_tokens || 0;
      !!this.cache &&
        res.choices.length == 1 &&
        this.messages.push(res.choices[0]?.message as messageType);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async recall(): Promise<chatCompletionType> {
    try {
      if (this.messages.length == 0) {
        throw new Error("can't recall!");
      }
      if (
        !!this.cache &&
        this.messages[this.messages.length - 1]?.role == "assistant"
      ) {
        console.warn("pop assistant message!");
        this.messages.pop();
      }
      const params_: chatParamsType = {
        /**
         * A list of messages comprising the conversation so far.
         * [Example Python code](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb).
         */
        messages: this.messages,
        /**
         * ID of the model to use. See the
         * [model endpoint compatibility](/docs/models/model-endpoint-compatibility) table
         * for details on which models work with the Chat API.
         */
        model: this.modelName || "gpt-3.5-turbo-0613",
        /**
         * Controls how the model responds to function calls. "none" means the model does
         * not call a function, and responds to the end-user. "auto" means the model can
         * pick between an end-user or calling a function. Specifying a particular function
         * via `{"name":\ "my_function"}` forces the model to call that function. "none" is
         * the default when no functions are present. "auto" is the default if functions
         * are present.
         */
        function_call:
          this.functions && this.function_call ? this.function_call : undefined,
        /**
         * A list of functions the model may generate JSON inputs for.
         */
        functions: this.functions,
        /**
         * How many chat completion choices to generate for each input message.
         */
        n: this.choice_num || 1,
        stop: this.stop,
        stream: false,
        temperature: this.temperature || 0.7,
        user: "GWT",
      };
      const res = (await this.llm.chat.completions.create(
        params_,
      )) as chatCompletionType;
      this.tokens += res.usage?.total_tokens || 0;
      !!this.cache &&
        res.choices.length == 1 &&
        this.messages.push(res.choices[0]?.message as messageType);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async moderate(input: string | string[]): Promise<resModerationType> {
    return await this.llm.moderations.create({
      input: input,
      model: "text-moderation-latest",
    });
  }

  async embedding(
    input: string | string[] | number[] | number[][],
  ): Promise<resEmbeddingType> {
    return await this.llm.embeddings.create({
      input: input,
      model: "text-embedding-ada-002",
      user: "GWT",
    });
  }

  static log(...args: string[]) {
    console.log(args);
  }
  private prettyPrintReqMessage(messages: messagesType) {
    for (const message of messages) {
      if (message.role === "system") {
        LLM.log(
          `%c system ${message.name ? "(" + message.name + ")" : ""}: ${
            message.content
          } \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "user") {
        LLM.log(
          `%c user: ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "assistant" && message.function_call) {
        LLM.log(
          `%c assistant: ${JSON.stringify(message.function_call)} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "assistant" && !message.function_call) {
        LLM.log(
          `%c assistant: ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "function") {
        LLM.log(
          `%c function (${
            message.name // response message has not `name`
          }): ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      }
    }
  }
  private prettyPrintResMessage(messages: resMessagesType) {
    for (const message_ of messages) {
      const message = message_.message;
      if (message.role === "system") {
        LLM.log(
          `%c system: ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "user") {
        LLM.log(
          `%c user: ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "assistant" && message.function_call) {
        LLM.log(
          `%c assistant: ${JSON.stringify(message.function_call)} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "assistant" && !message.function_call) {
        LLM.log(
          `%c assistant: ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      } else if (message.role === "function") {
        LLM.log(
          `%c function : ${message.content} \n`,
          `color: ${this.roleToColor[message.role]}`,
        );
      }
    }
  }

  printMessage(resMessages?: resMessagesType, reqMessages?: messagesType) {
    !!reqMessages && this.prettyPrintReqMessage(reqMessages);
    !!resMessages && this.prettyPrintResMessage(resMessages);
    !reqMessages && !resMessages && this.prettyPrintReqMessage(this.messages);
  }
}