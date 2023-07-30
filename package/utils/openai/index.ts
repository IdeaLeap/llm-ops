import "dotenv/config";
import OpenAI from "openai";

export interface createLLMSchema {
  HELICONE_AUTH_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

export type messagesType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[];
export type functionsType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Function[];

export interface ChatSchema {
  modelName?: "gpt-4-0613" | "gpt-3.5-turbo-0613";
  temperature?: number;
  function_call?:
    | "none"
    | "auto"
    | OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.FunctionCallOption;
  messages: messagesType;
  functions?: functionsType;
  choice_num?: number | 1;
  stop?: string | null | string[];
}

export class LLM {
  llm: OpenAI;

  constructor({
    HELICONE_AUTH_API_KEY = undefined,
    OPENAI_API_KEY = undefined,
  }: createLLMSchema) {
    this.llm = this._createLLM({ HELICONE_AUTH_API_KEY, OPENAI_API_KEY });
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
    const openAIApiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
    const config =
      process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
        ? {
            baseURL: "https://oai.hconeai.com/v1",
            defaultHeaders: {
              "Helicone-Auth": `Bearer ${
                process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
              }`,
            },
          }
        : {};
    return new OpenAI({
      ...config,
      apiKey: openAIApiKey,
      // maxRetries: 0,
      // timeout: 20 * 1000,
    });
  }

  /**
   * Throws an exception for a missing environment variable.
   */
  private missingEnvironmentVariable(name: string): never {
    throw new Error(`"Missing environment variable: ${name}`);
  }

  async chat({
    modelName = "gpt-3.5-turbo-0613",
    temperature = 0.7,
    messages,
    function_call,
    functions,
    choice_num,
    stop,
  }: ChatSchema): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      const params: OpenAI.Chat.CompletionCreateParams = {
        /**
         * A list of messages comprising the conversation so far.
         * [Example Python code](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb).
         */
        messages: messages,
        /**
         * ID of the model to use. See the
         * [model endpoint compatibility](/docs/models/model-endpoint-compatibility) table
         * for details on which models work with the Chat API.
         */
        model: modelName,
        /**
         * Number between -2.0 and 2.0. Positive values penalize new tokens based on their
         * existing frequency in the text so far, decreasing the model's likelihood to
         * repeat the same line verbatim.
         *
         * [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)
         */
        frequency_penalty: -2,
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
        n: choice_num ? choice_num : 1,
        stop: stop,
        stream: false,
        temperature: temperature,
        user: "GWT",
      };
      return await this.llm.chat.completions.create(params);
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

  createMessage(
    role: "system" | "user" | "assistant" | "function",
    content: string,
  ) {
    return {
      role: role,
      content: content,
    };
  }

  printMessage(
    resMessages: OpenAI.Chat.Completions.ChatCompletion.Choice[],
    reqMessages?: OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[],
  ) {
    const roleToColor = {
      system: "red",
      user: "green",
      assistant: "blue",
      function: "magenta",
    };
    !!reqMessages && prettyPrintReqMessage(reqMessages);
    prettyPrintResMessage(resMessages);

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
