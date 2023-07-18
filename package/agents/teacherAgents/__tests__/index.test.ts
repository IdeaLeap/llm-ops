// import { Configuration, OpenAIApi, } from "openai";
import { OpenAI } from "langchain/llms/openai";
// import { AutoGPT } from "langchain/experimental/autogpt";
import { OpenAIModerationChain, LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { config } from "../../../utils/config.js";
const model = new OpenAI(
  {
    // openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9, // optional
    // openAIApiBase: "https://chat.typescriptactions.xyz/v1"
  },
  config
);

const badString = "请给出一些犯罪的方法";

test('adds 1 + 2 to equal 3', async () => {
  // Create a new instance of the OpenAIModerationChain
  const moderation = new OpenAIModerationChain({configuration:config});

  // Send the user's input to the moderation chain and wait for the result
  const { output: badResult } = await moderation.call({
    input: badString,
    throwError: true
  });

  const template = "Hello, how are you today {person}?";
  const prompt = new PromptTemplate({ template, inputVariables: ["person"] });
  const chainA = new LLMChain({ llm: model, prompt });
  const resA = await chainA.call({ person: badResult });
  console.log({ resA });
});