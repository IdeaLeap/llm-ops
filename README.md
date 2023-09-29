![llmops](https://github.com/IdeaLeap/llm-ops/assets/49270362/99243bfe-daa9-43c2-a7c9-bbcb615815f4)

# llm-ops
<p>
<img src="https://wakatime.com/badge/user/5bfd81bc-9515-462b-a942-069791b283b7/project/af5f20a2-48c4-4ffb-81b8-7c330a9ee330.svg?style=flat-square"  alt="Develop time"/>
<a href="https://www.npmjs.com/package/llm-ops"><img src="https://img.shields.io/npm/v/llm-ops.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Version"></a>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/idealeap/llm-ops.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="License"></a>
</p>

`LLM Ops` 是一款高效制作`llm workflow`的低代码框架。

## 快速上手

```bash
npm install llm-ops
```

## 特点

- 工厂模式：无需关心内部实现，开箱即用。
- 低代码：只需一段JSON即可实现完整流程。
- TS支持：完全基于TS支持，且有TsDoc注释。
- Workflow：快速构建llm应用流程，助力高效开发。

## 使用例程

```ts
import { Pipeline, PipeRegistry } from "llm-ops";
const funcStore = PipeRegistry.init();
const schema = `
export interface subsectionSchema {
  subsection: articleSchema[];
  title: string; // 整篇PPT文稿的标题
  reason: string; // 为什么要这么分段，必须要符合PPT大纲的逻辑
}
export interface articleSchema {
  content: string; //每一段的文本
  title: string; // 每一段起一个小标题，非常凝练这一段主要的内容是什么，同时与其他段落保持一个一致性的风格
}`;
const reqMessages = [
  {
    role: "system",
    content:
      "你是一个专职PPT文稿大纲处理的助手，将会对user输入的文稿进行分段，并进行中心点提取成小标题。给出整篇PPT文稿的标题,分段的理由，每段小标题和对应的内容。",
  },
];
const pipelineJson = {
  pipes: [
    {
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
    },
    {
      id: "subsection",
      use: "chain",
      params: {
        chainName: "typeChat",
        struct: {
          schema,
          typeName: "subsectionSchema",
        },
        prompt: reqMessages,
        bound: false,
      },
    },
  ],
};
const pipeline = Pipeline.fromJSON(pipelineJson, {}, funcStore);
const res = (await pipeline.execute(
  `尊敬的各位评审，大家好！今天我有幸站在这里，展示我们的项目：“ChatPPT”，一款赋能新时代、引领PPT制作革命的创新平台。
我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。`,
)) as Record<string, any>;
console.log(JSON.stringify(res["subsection"]));
```


## 🎨 技术栈

- Openai
- Jest
- Typescript
- Vitepress
- Eslint
- Prettier
- MarkdownLint
- Github Actions
- Milvus

## 📄 作者

(C) 2023 Marlene, Idealeap

## License

[MIT](./LICENSE)
