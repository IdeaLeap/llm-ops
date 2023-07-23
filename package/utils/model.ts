import "dotenv/config";
import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIModerationChain } from "langchain/chains";

interface LLMSchema {
  modelName: "gpt-3.5-turbo" | "gpt-4";
  verbose?: boolean;
  HELICONE_AUTH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  temperature?: number;
  mode: "chat" | "completion" | "moderation";
}

export function LLM({
  OPENAI_API_KEY,
  modelName = "gpt-3.5-turbo",
  verbose = false,
  HELICONE_AUTH_API_KEY,
  temperature,
  mode = "completion",
}: LLMSchema): OpenAI | ChatOpenAI | OpenAIModerationChain {
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
  if (mode == "completion") {
    return new OpenAI(
      {
        openAIApiKey,
        temperature,
        verbose,
        modelName,
      },
      config,
    );
  } else if (mode == "chat") {
    return new ChatOpenAI(
      {
        openAIApiKey,
        temperature,
        verbose,
        modelName,
      },
      config,
    );
  } else {
    return new OpenAIModerationChain({ configuration: config });
  }
}

/**
 * Throws an exception for a missing environment variable.
 */
function missingEnvironmentVariable(name: string): never {
  throw new Error(`"Missing environment variable: ${name}`);
}
