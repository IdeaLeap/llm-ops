![llmops](https://github.com/IdeaLeap/llm-ops/assets/49270362/99243bfe-daa9-43c2-a7c9-bbcb615815f4)

# llm-ops
<p>
<img src="https://wakatime.com/badge/user/5bfd81bc-9515-462b-a942-069791b283b7/project/af5f20a2-48c4-4ffb-81b8-7c330a9ee330.svg?style=flat-square"  alt="Develop time"/>
<a href="https://www.npmjs.com/package/llm-ops"><img src="https://img.shields.io/npm/v/llm-ops.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Version"></a>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/idealeap/llm-ops.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="License"></a>
</p>

`llm-ops`是一款助力AIGC落地应用、高效开发`llm workflow`的低代码`TS`框架。

## 快速上手

```bash
npm install llm-ops
```

## 特点

  - `工厂模式设计`: 选择LLM-OPS意味着选择了简便与专业！您无需深究复杂的内部结构，只需简单几步，如同开箱即用的神器。
  - `低代码开发`: 真正实现了一键式开发。只需简单地编写一段JSON代码，即可轻松实现您所想要的完整业务流程，大大减少了开发难度和学习成本。
  - `全面支持TypeScript`: LLM-OPS框架不仅基于TypeScript开发，更为开发者提供了完整的TsDoc注释。这让您在开发过程中更加流畅，无需反复查询文档，一切都变得清晰明了。
  - `AI制作的Workflow引擎`: 无论是构建复杂的企业应用还是快速打造创新项目，LLM-OPS都能为您提供稳定而高效的工作流引擎，真正做到快速开发，快速上线！

## 低代码workflow示意图

![pipeline示意图](https://github.com/IdeaLeap/llm-ops/assets/49270362/489d25cd-bc71-44b1-8a89-027075e3fec2)


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
## 框架设计结构

![框架设计结构](https://github.com/IdeaLeap/llm-ops/assets/49270362/8834cba4-b055-41a0-a73d-f2c3346b23c5)


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

![mmqrcode1695990806194](https://github.com/IdeaLeap/llm-ops/assets/49270362/e09e1b83-dc0b-43a4-9de7-33acb9ea57e9)

备注来自`Github`，回复加入`idealeap`交流群，即被拉入微信技术交流群，欢迎一起交流~

## License

[MIT](./LICENSE)
