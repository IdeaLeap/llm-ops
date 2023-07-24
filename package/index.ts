import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Calculator } from "langchain/tools/calculator";

const tools = [new Calculator()];
const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0613",
  temperature: 0,
  openAIApiKey: "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",
});
const prefix =
  "You are a helpful AI assistant. However, all final response to the user must be in pirate dialect.";

const executor = await initializeAgentExecutorWithOptions(tools, chat, {
  agentType: "openai-functions",
  verbose: true,
  agentArgs: {
    prefix,
  },
});

const result = await executor.run("sum all the key value {a: 1, b: 2}");
console.log(result);

// Arr matey, in New York, it be feelin' like 75 degrees, with a gentle breeze blowin' from the northwest at 3 knots. The air be 77% full o' water, and the clouds be coverin' 35% of the sky. There be no rain in sight, yarr!
