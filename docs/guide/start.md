# 快速上手

> 本文档仅介绍基于低代码的使用方法，如果你想了解更多关于llm-ops的使用方法，请自行查阅源码示例(帮我们写写文档也是非常欢迎的)。

可通过[Preview](https://preview.idealeap.cn/)直接上手体验低代码的使用。

## 安装

```bash
npm install llm-ops
```

## 创建一个简单的pipeline

```ts
import { Pipeline,PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();//将功能函数注册到funcStore中
const pipelineJson = {
  pipes:[]
}
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = await pipeline.execute("");
```

## 使用llm

想要使用`llm`，只需要在`pipelineJson`中添加`llm`的pipe即可。

在`use`字段中填写`llm`，在`params`字段中填写`llm`的参数。

其中，每个`pipe`都有一个`id`字段，用于标识该`pipe`。

`llm`的参数中，`messages`字段用于填写`llm`的历史对话和prompt，`messages`是一个数组，每个元素都是一个`message`，`message`是一个对象，其中`role`字段用于标识`message`的角色，`content`字段用于填写`message`的内容。

可自行查阅`API`文档，了解更多`llm`的参数。

> 目前通过json方式使用的`llm`不支持历史记录，如果需要历史记录，请参考相关`API`文档，使用完整的`llm`功能。

```ts
import { Pipeline,PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();
const pipelineJson = {
  pipes:[{
        id: "polish",
        use: "llm",
        params: {
          messages: [
            {
              role: "system",
              content:
                "你是一个专职PPT文稿处理的助手，将会对user输入的文稿进行润色扩写，内容补充，但是原来的一些信息要点不丢失。",
            },
          ],
        },
      }]
}
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = await pipeline.execute("尊敬的各位评审，大家好！今天我有幸站在这里，展示我们的项目：“ChatPPT”，一款赋能新时代、引领PPT制作革命的创新平台。我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。");
```

## 设置环境变量

推荐做法是直接在.env文件中设置环境变量，框架会自动读取.env文件中的环境变量。

若想要手动设置环境变量，可通过插桩的方式实现。

例如，设置`OPENAI_API_KEY`环境变量：

```ts
import { Pipeline,PipeRegistry,LLM_OPS_CONFIG } from "llm-ops";
LLM_OPS_CONFIG.OPENAI_API_KEY = "";
...
```

在国内，通常无法直接使用OPENAI_API_KEY，因此，需要使用代理。推荐使用`Helicone`作为代理API。手动设置代理API的方法如下：

```ts
import { Pipeline,PipeRegistry,LLM_OPS_CONFIG } from "llm-ops";
LLM_OPS_CONFIG.OPEN_PATH = {
  baseURL: "https://oai.hconeai.com/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer xxx`,
  },
}
```

## 使用chain

`chain`的使用非常简单，只需将`use`字段设置为`chain`，在`params`字段中填写`chain`的参数即可。默认使用`functionCall`作为格式化输出。如果需要使用`typeChat`，请在`params`中添加`chainName:"typeChat"`。在`struct`字段中填写格式化的输出要求。

以下是`functionCall`的使用示例：

```ts
import { Pipeline,PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();
const pipelineJson = {
  "pipes": [{
    "id": "classify",
    "use": "chain",
    "params": {
      "struct": {
        "functions": [{
          "name": "get_categories",
          "description": "根据PPT文稿获取PPT类别",
          "parameters": {
            "type": "object",
            "properties": {
              "categories": {
                "type": "string",
                "enum": ["汇报类型", "演讲类型", "活动类型"],
                "description": "PPT文稿属于哪一类型的PPT"
              }
            },
            "required": ["categories"]
          }
        }],
        "function_call": {
          "name": "get_categories"
        }
      },
      "prompt": [{
        "role": "system",
        "content": "你是一个专职PPT文稿处理的助手，会根据user输入的PPT文稿，给出PPT的类别。"
      }]
    }
  }]
}
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = await pipeline.execute("尊敬的各位评审，大家好！今天我有幸站在这里，展示我们的项目：“ChatPPT”，一款赋能新时代、引领PPT制作革命的创新平台。我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。");
```

更复杂的用法可以学习官方的[Cook Book](https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models)。

以下是`typeChat`的使用示例：

```ts
import { Pipeline,PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();
const pipelineJson = {
  "pipes": [{
    id: "subsection",
    use: "chain",
    params: {
      chainName: "typeChat",
      struct: {
        schema:`
export interface subsectionSchema {
  subsection: articleSchema[];
  title: string; // 整篇PPT文稿的标题
  reason: string; // 为什么要这么分段，必须要符合PPT大纲的逻辑
}
export interface articleSchema {
  content: string; //每一段的文本
  title: string; // 每一段起一个小标题，非常凝练这一段主要的内容是什么，同时与其他段落保持一个一致性的风格
}`,
        typeName: "subsectionSchema",
      },
      prompt: [
        {
          role: "system",
          content:
            "你是一个专职PPT文稿大纲处理的助手，将会对user输入的文稿进行分段，并进行中心点提取成小标题。给出整篇PPT文稿的标题,分段的理由，每段小标题和对应的内容。",
        },
      ],
      bound: false,
    },
  }]
}
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = await pipeline.execute("尊敬的各位评审，大家好！今天我有幸站在这里，展示我们的项目：“ChatPPT”，一款赋能新时代、引领PPT制作革命的创新平台。我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。");
```

从上述示例可以看出，`chain`中的`prompt`和`llm`中的`messages`是一样的，都是用于填写`chain`的历史对话和prompt。

可自行查阅`API`文档，了解更多`chain`的参数。

## Pipe使用globalParams

有一些params可能是许多pipe都需要的，那么我们可以设置一个全局的params，这样就不用每个pipe都写一遍了。

```ts
const pipelineJson = {
  pipes: [...],
  globalParams: {
    abc: "123",
    ...
  },
};
```

## 多个pipe组合使用

在pipes中添加多个pipe即可执行多个步骤。默认情况下，每个pipe的输入都是上一个pipe的输出。

```ts
import { Pipeline,PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();
const pipelineJson = {
  "pipes": [{
    "id": "polish",
    "use": "llm",
    "params": {
      "messages": [{
        "role": "system",
        "content": "你是一个专职PPT文稿处理的助手，将会对user输入的文稿进行润色扩写，内容补充，但是原来的一些信息要点不丢失。"
      }]
    }
  }, {
    "id": "classify",
    "use": "chain",
    "params": {
      "struct": {
        "functions": [{
          "name": "get_categories",
          "description": "根据PPT文稿获取PPT类别",
          "parameters": {
            "type": "object",
            "properties": {
              "categories": {
                "type": "string",
                "enum": ["汇报类型", "演讲类型", "活动类型"],
                "description": "PPT文稿属于哪一类型的PPT"
              }
            },
            "required": ["categories"]
          }
        }],
        "function_call": {
          "name": "get_categories"
        }
      },
      "prompt": [{
        "role": "system",
        "content": "你是一个专职PPT文稿处理的助手，会根据user输入的PPT文稿，给出PPT的类别。"
      }]
    }
  }]
}
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = await pipeline.execute("尊敬的各位评审，大家好！今天我有幸站在这里，展示我们的项目：“ChatPPT”，一款赋能新时代、引领PPT制作革命的创新平台。我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。");
```

## 注册自定义函数

除了`llm-ops`提供的函数，我们还可以注册自定义函数，实现更强大的功能。

下面的示例中注册了三个自定义函数，可通过`use`字段写入对应的`id`，实现自定义函数的调用。

```ts
const pipeRegistry = PipeRegistry.init();
pipeRegistry.register(
  "step1",
  async (input: any, context: PipelineContext) => {
    console.log("step1", input, context.stepParams["self_params"]);
    return new Promise((resolve) =>
      setTimeout(() => resolve(input + "🚺"), 1000),
    );
  },
);

pipeRegistry.register("step2", (input: any, context: PipelineContext) => {
  console.log(
    "step2",
    input,
    context.stepParams["self_params"],
    context.stepResults["index_input"],
  );
  return context.stepResults["index_input"];
});

pipeRegistry.register(
  "step3",
  async (input: any, context: PipelineContext) => {
    console.log("step3", input, context.stepParams["self_params"]);
    return new Promise((resolve) => setTimeout(() => resolve(input), 1000));
  },
);

const pipelineJson = {
  pipes: [
    {
      id: "step1_",
      use: "step1",
      params: { test: "test!!" },
    },
    {
      id: "step2_",
      use: "step2",
      params: { test: "test22!!{{FetchData}}" }, //插槽！
    },
    {
      id: "step3_",
      use: "step3",
    },
  ],
}

const pipeline = Pipeline.fromJSON(pipelineJson, {}, pipeRegistry);

await pipeline.execute("我是输入").then(console.log);
```

`context`中包含了`stepParams`和`stepResults`，`stepParams`是所有`pipe`的`params`，`stepResults`是已执行`pipe`的执行结果。

也可以通过self_params字段，获取当前pipe的params。通过index_input字段，获取最初的输入。

## 更复杂的pipe组合使用

每个pipe不仅可以改变输入，还可以改变params，甚至可以将前几个pipe的执行结果放入`params`中，以此实现更复杂的功能。

```ts
const pipeRegistry = PipeRegistry.init();
pipeRegistry.register(
  "step1",
  async (input: any, context: PipelineContext) => {
    console.log("step1", input, context.stepParams["self_params"]);
    return new Promise((resolve) =>
      setTimeout(() => resolve(input + "🚺"), 1000),
    );
  },
);

pipeRegistry.register("step2", (input: any, context: PipelineContext) => {
  console.log(
    "step2",
    input,
    context.stepParams["self_params"],
    context.stepResults["index_input"],
  );
  return context.stepResults["index_input"];
});

pipeRegistry.register(
  "step3",
  async (input: any, context: PipelineContext) => {
    console.log("step3", input, context.stepParams["self_params"]);
    return new Promise((resolve) => setTimeout(() => resolve(input), 1000));
  },
);

const pipelineJson = {
  pipes: [
    {
      id: "step1_",
      use: "step1",
      params: { test: "test!!" },
    },
    {
      id: "step2_",
      use: "step2",
      inputs: {
        FetchData: "step1_",//获取pipe中id为step1_的pipe的执行结果，自动替换字符串"step1_"为对应的输出结果。
      },
      params: { test: "test22!!{{FetchData}}" }, //插槽,必须先在inputs中获取之前pipe的输出结果，然后在params中插槽引用inputs的对应字段！
    },
    {
      id: "step3_",
      use: "step3",
      inputs: {
        input: "step1_", //这里的input是step1_的结果。默认字段名为input即直接替换当前pipe的输入。
      },
    },
  ],
};

const pipeline = Pipeline.fromJSON(pipelineJson, {}, pipeRegistry);

await pipeline.execute("我是输入").then(console.log);
```

## 生命周期钩子

其实，`pipeline`的执行过程是一个`pipe`一个`pipe`的执行，每个`pipe`都有一个`execute`方法，`pipeline`的`execute`方法就是调用每个`pipe`的`execute`方法。

我们完全不用等到所有`pipe`都执行完毕，就可以对`pipeline`的执行过程进行干预。

例如，我们可以通过添加钩子函数，实现对每一个过程执行完毕后的回调，也可以实现对某个过程执行错误的回调。

```ts
import { EventEmitter } from "llm-ops";
const globalEmitter = new EventEmitter();
globalEmitter.on(
  "stepComplete",
  (step: any, totalSteps: any, result: any) => {
    console.log(
      `Step ${step}/${totalSteps} completed with result: ${result}`,
    );
  },
);
globalEmitter.on("error", (error) => {
  console.log(`An error occurred: ${error}`);
});
const pipelineJson = {
  emitter: globalEmitter,
  ...
}
...
```

## 其他

更多更复杂的pipeline功能可以查看[@idealeap/pipeline](https://pipe.idealeap.cn/)。

`llm-ops`更复杂的参数和使用方法可查看[Github仓库](https://github.com/IdeaLeap/llm-ops)的测试用例以及[API文档](https://ops.idealeap.cn/api/)

想要测试低代码功能可以访问[Preview](https://preview.idealeap.cn/)。
