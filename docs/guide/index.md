![llm-ops](https://user-images.githubusercontent.com/49270362/271479112-99243bfe-daa9-43c2-a7c9-bbcb615815f4.jpg)

## 介绍

`llm-ops`是一款助力AIGC落地应用、高效开发`llm workflow`的低代码`TS`框架。

不同于`langchain`，`llm-ops`原生支持完善的低代码开发，提供类似`github workflow`的schema写法，自由度更高，更加灵活。

同时，通过外置拓展，`llm-ops`能够支持JSON、YAML、XML等多种格式的schema，也可以直接链式调用、声明式开发，满足不同开发者的需求。

`llm-ops`增强了`llm`的原有功能，不仅支持`function call`，也支持`typeChat`格式化输出；`llm-ops`简化了原先`llm`、`chain`、`prompt`、`RAG`的使用逻辑，提供了更加简单的API，让开发者更加专注于业务逻辑的开发。

`llm-ops`在各个生命周期都有钩子，通过拓展，能够实现类似`Azure flow`、`Flowise`的可视化开发，也能够实现`github workflow`、`gitlab CI`的自动化测试、部署等功能。

## 来源

`idealeap`团队在内部AIGC项目的开发过程中发现`langchain`等框架，开发心智负担严重，上手较慢，文档不全，对最新算法例如`CoT`支持不友好，对复杂业务逻辑开发不友好。

同时，团队发现市场上大量人才涌入大模型应用开发，但经常会出现一个困局：现有很多大模型开发框架都是基于python的，团队开发落地应用必定需要开发前后端，而python本身的后端生态并不友好，与前端语言割裂，需会多门语言才能开发完整应用，造成一定开发困局。因此，本团队内部孵化出`llm-ops`框架，并将其开源，希望能够帮助更多开发者快速落地应用。

`llm-ops`框架的设计理念是：**低代码、高效开发、快速落地**。因此，它基于TS开发，与前端无缝衔接。开发团队只需掌握前端即可全栈开发，无需学习多门语言，降低开发难度，提高开发效率。同时`llm-ops`原生支持云函数`Serveless`部署，以及传统后端部署，能够适应微服务等多种业务架构。

## 概念

![一图看懂框架使用逻辑](https://github.com/IdeaLeap/llm-ops/assets/49270362/8834cba4-b055-41a0-a73d-f2c3346b23c5)

### llm

`llm`就是`llm-ops`的核心，它是大语言模型的封装，目前提供了`openai`的chat模型，embedding模型，以及moderation模型的面向对象封装。

```js
//chat
const llm = new LLM({...});
const res = await llm.chat({...});

//embedding
const llm = new LLM({...});
const res = await llm.embedding("xxx");

//moderation
const llm = new LLM({...});
const res = await llm.moderate("xxx");
```

### chain

`chain` = `llm` + `Formatted output`。简单理解chain就是llm的格式化输出，输出结果符合规定的格式，使得能够直接当作参数调用某个函数或者用于后续业务逻辑。

目前支持的格式化输出有`function call`、`typeChat`。`function call`具体介绍可看`openai`的官方介绍，简单来说就是利用`json schema`来描述输出格式。而`typeChat`则是利用`TS`语法描述输出格式。

```js
//function_call的schema
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
}
//对应格式化输出样例
{
  location: "San Francisco, CA",
  format: "celsius",
}
```

```js
//typeChat的schema
const schema = `

// The following is a schema definition for respond with the most concise words, each word carries rich meaning. The content of the response is a joking expression, reflecting the way some young people express their emotions and attitudes on the internet.
export interface SentimentResponse {
  // On the Internet, when being criticized, don't run or be afraid. Remember the six-character mantra. Looking at the other side, as soon as they speak, use the word "classic" to counter. If you want to criticize, they want to praise, the word "filial" can piss them off. If they want to argue about truth and falsehood, saying "impatient" will make them collapse. If you don't understand their thoughts, if you can't "hold back", then "laugh". If they are right and you have nothing to say, typing "win" will make you "win". Don't be afraid of them, you have culture, only six words can break everything. Don't care about them, they have many moves, but rely on six words to conquer the world.
  sentiment: "classic" | "hold back" | "filial" | "happy" | "impatient" | "win"; // classic: refers to the classics, used to express approval or praise someone or something. filial: refers to filial piety, used to express respect or gratitude to parents. impatient: means impatient, used to express dissatisfaction or urge someone or something. happy: means happy, used to express joy or ridicule someone or something. hold back: means can't hold back the laughter, used to express the urge to laugh in response to someone or something. win: means win, used to express success or luck for oneself or others.
}`;
//对应格式化输出样例
{
  sentiment: "classic",
}
```

### db

`db`就是`RAG`，检索增强生成。它是目前大模型应用的主流增强`llm`能力的方式。通过向量相似度搜索，能够获取数据库中语义相似的内容，辅助大语言模型输出更理想的结果。目前`llm-ops`封装了开源的`milvus`向量数据库，使其更简单易用。

> 由于milvus采用grpc通信，暂时导致无法直接在浏览器调用方法，后续会进行改进。

常见用法是：用户输入，将其向量化，进行向量相似度搜索，获取数据库中最相似的内容，和用户输入一起作为prompt输入大语言模型，输出结果。

```js
const db = new milvusVectorDB({...});
const res = await db.search({
  vector: await db.generateVector("xxx"),
  ...,
});
```

目前，更多用法可自行拓展。

### prompt

`prompt`是引导大语言模型输出理想结果的咒语。`llm-ops`提供许多内置的prompt模板，之后也会更新更多热门的模板（例如langGPT）,开发者也可以自行拓展。

有了promptTemplate，用户可直接输入参数，即可生成完整的prompt。`llm-ops`的prompt是基于`chat`模型的，也就是说，是提供以多轮对话形式的prompt。

同时，prompt模块支持将不完整的prompt格式化成api可用的格式，支持插槽渲染，也支持将`vector db`搜索结果生成对应的prompt，非常灵活自由。

```js
//promptTemplate
{
  name: "test",
  prompt: [
    "hello word",//不完整的prompt，自动生成完整的user对话prompt
    { content: "你好", role: "user" },
    {
      COLLECTION_NAME: "minippt",//指定vector db的collection
      vector: "hello word",//向量检索的内容
      output_fields: "type",//要求输出的字段
      limit: 3,//要求搜索的数量
      content: "有没有可能：\n{{vector}}。\n上面这些才是精品！",//插槽渲染，将向量搜索的结果渲染到content中然后生成prompt
    },
  ],
  COLLECTION_NAME: "minippt",//全局指定vector db的collection
}

//对应生成的样例
[
  {
    role: 'user',
    content: 'hello word',
  },
  { content: '你好', role: 'user' },
  {
    role: 'system',
    content: '有没有可能：\n1. 太好哩\n2. 太好哩\n3. 太好哩。\n上面这些才是精品！',
    name: 'system_memory'
  }
]
```

### agent

`agent`其实就是`chain`+`prompt`+`db`。当然，从某种角度来说，`agent`也是`llm`的封装，只不过是更高层次的封装。在其他框架中，`agent`常常被定义为`llm-ops`中的`chain`。

### pipeRegistry

其实上文已经介绍完了`llm-ops`主要的功能，而`pipeRegistry`就是让整个框架彻底支持低代码开发的关键所在。

具体实现是在另一个`pipeline`框架实现，通过插桩的方式，将本框架的功能模块统一注册到`pipeline`中，使得开发者可以通过简单的配置，就能够实现复杂的业务逻辑。

从另一个角度也可以看出，`llm-ops`和`pipeline`完全解耦。`workflow`的功能完全由`pipeline`实现，`llm-ops`只是提供了功能模块。这种设计理念，使得`llm-ops`能够更好的适应未来的发展，例如`pipeline`的可视化开发，`pipeline`的自动化测试等等。

> `pipeline`框架大部分代码均由`GPT-4`编写。

### LLM_OPS_CONFIG

`LLM_OPS_CONFIG`主要用于配置`llm-ops`的一些环境变量,例如`OPENAI_API_KEY`、`HELICONE_AUTH_API_KEY`等。

```js
LLM_OPS_CONFIG.OPENAI_API_KEY = "xxx";
```

具体实现也是通过插桩的方式，将对应的环境变量替换成当前设置的环境变量。

此外，`llm-ops`的环境变量配置是通过`dotenv`实现的，因此，开发者也可以通过`.env`文件来配置环境变量。

### llm-ops

可以看出，`llm-ops`是一个自底向上，层层封装的框架结构设计。每一层都完美支持任意的JSON输入，最终借助`pipeline`实现完全的低代码开发。

## 低代码

受益于`@idealeap/pipeline`框架，`llm-ops`能够像`github workflow`一样，通过`json schema`来描述业务逻辑，实现低代码开发。

![pipeline示意图](https://github.com/IdeaLeap/llm-ops/assets/49270362/489d25cd-bc71-44b1-8a89-027075e3fec2)

例如上图，既可以顺序执行，也可以将已执行的`pipe`作为某个`pipe`的输入，甚至可以将输出结果作为`params`的一部分，实现复杂的业务逻辑。

## 其他

目前本框架还处于早期阶段，还有很多功能需要完善，例如`pipeline`的可视化开发、更强的`workflow`支持等等。欢迎大家提出宝贵的意见和建议，也欢迎大家一起参与到本框架的开发中来。

### 微信交流群

![mmqrcode1695990806194](https://github.com/IdeaLeap/llm-ops/assets/49270362/e09e1b83-dc0b-43a4-9de7-33acb9ea57e9)

备注来自`Github`，回复`加入idealeap技术交流群`，即被拉入微信技术交流群，欢迎一起交流~
