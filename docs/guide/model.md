# Model

## Chat Model

### Chat mode

```ts
import { LLM, messagesType, functionsType } from "llm-ops";
const llm = new LLM({});
const reqMessages: messagesType = [
  {
    role: "system",
    content:
      "You are a helpful, pattern-following assistant that translates corporate jargon into plain English.",
  },
  {
    role: "system",
    name: "example_user",
    content: "New synergies will help drive top-line growth.",
  },
  {
    role: "system",
    name: "example_assistant",
    content: "Things working well together will increase revenue.",
  },
  {
    role: "system",
    name: "example_user",
    content:
      "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage.",
  },
  {
    role: "system",
    name: "example_assistant",
    content: "Let's talk later when we're less busy about how to do better.",
  },
  {
    role: "user",
    content:
      "This late pivot means we don't have time to boil the ocean for the client deliverable.",
  },
];

const res = await llm.chat({
  messages: reqMessages,
});
llm.printMessage();
console.log(res);
debugger;
```

### Openai Funtions Call

```ts
import { LLM, messagesType, functionsType } from "llm-ops";
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
  { role: "user", content: "What's the weather like today" },
];

const res = await llm.chat({
  messages: reqMessages,
  functions: functions,
  function_call: { name: "get_current_weather" },
});
llm.printMessage();
console.log(res);
debugger;
```

## Moderation & Embedding

```ts
import { LLM } from "llm-ops";
const llm = new LLM({});
const res = await llm.embedding("hello world");
console.log(res.data[0].embedding);
debugger;
```
