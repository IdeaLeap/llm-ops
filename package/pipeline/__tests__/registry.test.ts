import { Pipeline, PipeRegistry, EventEmitter } from "llm-ops";

test("Pipeline", async () => {
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
    emitter: globalEmitter,
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
  我想强调的是，这不仅是一个创新平台，它更代表着我们对未来技术的展望和追求。
  现在，请允许我分享一下我们参赛的具体信息。我们代表的是浙江省，参赛组别为本科生创意组，所属高校为杭州电子科技大学。`,
  )) as Record<string, any>;
  console.log(JSON.stringify(res["subsection"]));
}, 1000000);
