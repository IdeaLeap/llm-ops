import { FunctionChain } from "../function.js";
import { LLM, messagesType, functionsType } from "../../utils/index.js";
const llm = new LLM({});
const functions: functionsType = [
  {
    name: "get_current_weather",
    description: "Get the current weather",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
        format: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description:
            "The temperature unit to use. Infer this from the users location.",
        },
      },
      required: ["location", "format"],
    },
  },
  {
    name: "get_n_day_weather_forecast",
    description: "Get an N-day weather forecast",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
        format: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description:
            "The temperature unit to use. Infer this from the users location.",
        },
        num_days: {
          type: "integer",
          description: "The number of days to forecast",
        },
      },
      required: ["location", "format", "num_days"],
    },
  },
];
const reqMessages: messagesType = [
  {
    role: "system",
    content:
      "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous.",
  },
];
const chain = new FunctionChain(llm);
const res = await chain.call({
  request: { role: "user", content: "What's the weather like today" },
  prompt: reqMessages,
  functions,
  function_call: { name: "get_current_weather" },
  verbose: true,
});
if (!res.success) {
  console.error(res.message);
} else {
  console.log(res.data);
}
debugger;
// {name: 'get_current_weather', arguments: '{
//   "location": "current",
//   "format": "celsius"
// }'}
