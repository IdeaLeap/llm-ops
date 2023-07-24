import "dotenv/config";
import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIModerationChain } from "langchain/chains";

export function ModerationValidateLLM(
  OPENAI_API_KEY?: string,
  HELICONE_AUTH_API_KEY?: string,
): OpenAIModerationChain {
  if (!process.env.OPENAI_API_KEY && !OPENAI_API_KEY) {
    missingEnvironmentVariable("OPENAI_API_KEY Missing! 😅 It's not free!");
  }
  const openAIApiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  const config =
    process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
      ? {
          basePath: "https://oai.hconeai.com/v1",
          baseOptions: {
            headers: {
              "Helicone-Auth": `Bearer ${
                process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
              }`,
            },
          },
        }
      : undefined;
  return new OpenAIModerationChain({ openAIApiKey, configuration: config });
}

export interface LLMSchema {
  modelName?: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-0613" | "gpt-3.5-turbo-0613";
  verbose?: boolean;
  HELICONE_AUTH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  temperature?: number;
}

export type LLMType = OpenAI;

export function LLM({
  OPENAI_API_KEY,
  modelName = "gpt-3.5-turbo",
  verbose = false,
  HELICONE_AUTH_API_KEY,
  temperature = 0.7,
}: LLMSchema): LLMType {
  if (!process.env.OPENAI_API_KEY && !OPENAI_API_KEY) {
    missingEnvironmentVariable("OPENAI_API_KEY Missing! 😅 It's not free!");
  }
  const openAIApiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  const config =
    process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
      ? {
          basePath: "https://oai.hconeai.com/v1",
          baseOptions: {
            headers: {
              "Helicone-Auth": `Bearer ${
                process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
              }`,
            },
          },
        }
      : undefined;
  return new OpenAI(
    {
      openAIApiKey,
      temperature,
      verbose,
      modelName,
    },
    config,
  );
}

export type ChatLLMType = ChatOpenAI;

export function ChatLLM({
  OPENAI_API_KEY,
  modelName = "gpt-3.5-turbo",
  verbose = false,
  HELICONE_AUTH_API_KEY,
  temperature = 0.7,
}: LLMSchema): ChatLLMType {
  if (!process.env.OPENAI_API_KEY && !OPENAI_API_KEY) {
    missingEnvironmentVariable("OPENAI_API_KEY Missing! 😅 It's not free!");
  }
  const openAIApiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  const config =
    process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
      ? {
          basePath: "https://oai.hconeai.com/v1",
          baseOptions: {
            headers: {
              "Helicone-Auth": `Bearer ${
                process.env.HELICONE_AUTH_API_KEY || HELICONE_AUTH_API_KEY
              }`,
            },
          },
        }
      : undefined;
  return new ChatOpenAI(
    {
      openAIApiKey,
      temperature,
      verbose,
      modelName,
    },
    config,
  );
}
/**
 * Throws an exception for a missing environment variable.
 */
function missingEnvironmentVariable(name: string): never {
  throw new Error(`"Missing environment variable: ${name}`);
}
