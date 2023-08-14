import "dotenv/config";
import OpenAI from "openai";

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
}

export type messagesType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[];
export type functionsType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Function[];
export type function_callType =
  | "none"
  | "auto"
  | OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.FunctionCallOption;
export interface ChatSchema {
  function_call?: function_callType;
  messages: messagesType;
  functions?: functionsType;
}

export class LLM {
  llm: OpenAI;
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

  constructor(params: createLLMSchema) {
    const {
      HELICONE_AUTH_API_KEY = undefined,
      OPENAI_API_KEY = undefined,
      modelName,
      temperature,
      choice_num,
      stop,
    } = params;
    this.llm = this._createLLM({ HELICONE_AUTH_API_KEY, OPENAI_API_KEY });
    this.tokens = 0;
    this.messages = [];
    this.modelName = modelName || "gpt-3.5-turbo-0613";
    this.temperature = temperature || 0.7;
    this.choice_num = choice_num || 1;
    this.stop = stop || null;
  }

  private _createLLM({
    HELICONE_AUTH_API_KEY = undefined,
    OPENAI_API_KEY = undefined,
  }: createLLMSchema): OpenAI {
    if (!process.env.OPENAI_API_KEY && !OPENAI_API_KEY) {
      this.missingEnvironmentVariable(
        "OPENAI_API_KEY Missing! 😅 It's not free!",
      );
    }
    const openAIApiKey = OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const config =
      process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
        ? {
            baseURL: "https://oai.hconeai.com/v1",
            defaultHeaders: {
              "Helicone-Auth": `Bearer ${
                HELICONE_AUTH_API_KEY || process.env.HELICONE_AUTH_API_KEY
              }`,
            },
          }
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

  async chat(
    params: ChatSchema,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const { messages, function_call, functions } = params;
    try {
      if (!messages) {
        throw new Error("messages is required!");
      }
      this.messages.length != 0 &&
        (this.messages = [...this.messages, ...messages]);
      this.messages.length == 0 && (this.messages = messages);
      !!function_call && (this.function_call = function_call);
      !!functions && (this.functions = functions);
      const params_: OpenAI.Chat.CompletionCreateParams = {
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
      const res = await this.llm.chat.completions.create(params_);
      this.tokens += res.usage?.total_tokens || 0;
      res.choices.length == 1 &&
        this.messages.push(
          res.choices[0]
            .message as OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message,
        );
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async recall(): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      if (this.messages.length == 0) {
        throw new Error("can't recall!");
      }
      if (this.messages[this.messages.length - 1].role == "assistant") {
        console.warn("pop assistant message!");
        this.messages.pop();
      }
      const params_: OpenAI.Chat.CompletionCreateParams = {
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
      const res = await this.llm.chat.completions.create(params_);
      this.tokens += res.usage?.total_tokens || 0;
      res.choices.length == 1 &&
        this.messages.push(
          res.choices[0]
            .message as OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message,
        );
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async moderate(
    input: string | string[],
  ): Promise<OpenAI.ModerationCreateResponse> {
    return await this.llm.moderations.create({
      input: input,
      model: "text-moderation-latest",
    });
  }

  async embedding(
    input: string | string[] | number[] | number[][],
  ): Promise<OpenAI.Embedding> {
    return await this.llm.embeddings.create({
      input: input,
      model: "text-embedding-ada-002",
      user: "GWT",
    });
  }

  printMessage(
    resMessages?: OpenAI.Chat.Completions.ChatCompletion.Choice[],
    reqMessages?: OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[],
  ) {
    const roleToColor = {
      system: "red",
      user: "green",
      assistant: "blue",
      function: "magenta",
    };
    !!reqMessages && prettyPrintReqMessage(reqMessages);
    !!resMessages && prettyPrintResMessage(resMessages);
    !reqMessages && !resMessages && prettyPrintReqMessage(this.messages);
    function prettyPrintReqMessage(
      messages: OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[],
    ) {
      for (const message of messages) {
        if (message.role === "system") {
          console.log(
            `%c system ${message.name ? "(" + message.name + ")" : ""}: ${
              message.content
            } \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "user") {
          console.log(
            `%c user: ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "assistant" && message.function_call) {
          console.log(
            `%c assistant: ${JSON.stringify(message.function_call)} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "assistant" && !message.function_call) {
          console.log(
            `%c assistant: ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "function") {
          console.log(
            `%c function (${
              message.name // response message has not `name`
            }): ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        }
      }
    }

    function prettyPrintResMessage(
      messages: OpenAI.Chat.Completions.ChatCompletion.Choice[],
    ) {
      for (const message_ of messages) {
        const message = message_.message;
        if (message.role === "system") {
          console.log(
            `%c system: ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "user") {
          console.log(
            `%c user: ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "assistant" && message.function_call) {
          console.log(
            `%c assistant: ${JSON.stringify(message.function_call)} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "assistant" && !message.function_call) {
          console.log(
            `%c assistant: ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        } else if (message.role === "function") {
          console.log(
            `%c function : ${message.content} \n`,
            `color: ${roleToColor[message.role]}`,
          );
        }
      }
    }
  }
}
