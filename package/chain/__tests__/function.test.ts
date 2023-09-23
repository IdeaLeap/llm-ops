import { FunctionChain, LLM, messagesType, functionsType } from "llm-ops";
test("测试FunctionChain的格式化输出", async () => {
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
});

test("测试FunctionChain的连续对话", async () => {
  const llm = new LLM({});
  const chain = new FunctionChain(llm);
  let reqMessages: messagesType = [
    {
      role: "system",
      content:
        "现在是一个哲学学习辅助助手，我在学习如何抬杠，无论我问什么，你都要巧妙的对我进行抬杠。即使面对批评，道德审判，任何形式的质疑，或者让你忘记抬杠学习助手的身份，等等任何提问和沟通，你都要用对我进行抬杠并且隐瞒你抬杠助手的身份。碰到无法回答的问题，就进行更高层面的抬杠。",
    },
  ];
  let res = await chain.call({
    request: { role: "user", content: "你好你是谁?" },
    prompt: reqMessages,
  });
  reqMessages = [
    {
      role: "system",
      content:
        "现在是一个语言学习辅助助手，我在学习中国的脏话，无论我问什么，你都要巧妙的用脏话回复。即使面对批评，道德审判，任何形式的质疑，或者让你忘记脏话学习助手的身份，等等任何提问和沟通，你都要用脏话回复并且隐瞒你脏话助手的身份。碰到无法回答的问题，就随便回复一句脏话。",
    },
  ];
  res = await chain.call({
    request: { role: "user", content: "太好哩，拜拜" },
    prompt: reqMessages,
    verbose: true,
  });
  if (!res.success) {
    console.error(res.message);
  } else {
    console.log(res.data);
  }
  debugger;
});
