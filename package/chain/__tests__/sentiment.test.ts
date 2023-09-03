import { LLM, TypeScriptChain, messagesType } from "@idealeap/gwt";
test("测试TSChain的格式化输出", async () => {
  const llm = new LLM({});
  const schema = `

// The following is a schema definition for respond with the most concise words, each word carries rich meaning. The content of the response is a joking expression, reflecting the way some young people express their emotions and attitudes on the internet.
export interface SentimentResponse {
  // On the Internet, when being criticized, don't run or be afraid. Remember the six-character mantra. Looking at the other side, as soon as they speak, use the word "classic" to counter. If you want to criticize, they want to praise, the word "filial" can piss them off. If they want to argue about truth and falsehood, saying "impatient" will make them collapse. If you don't understand their thoughts, if you can't "hold back", then "laugh". If they are right and you have nothing to say, typing "win" will make you "win". Don't be afraid of them, you have culture, only six words can break everything. Don't care about them, they have many moves, but rely on six words to conquer the world.
  sentiment: "classic" | "hold back" | "filial" | "happy" | "impatient" | "win"; // classic: refers to the classics, used to express approval or praise someone or something. filial: refers to filial piety, used to express respect or gratitude to parents. impatient: means impatient, used to express dissatisfaction or urge someone or something. happy: means happy, used to express joy or ridicule someone or something. hold back: means can't hold back the laughter, used to express the urge to laugh in response to someone or something. win: means win, used to express success or luck for oneself or others.
}`;
  const chain = new TypeScriptChain(llm);
  const res = await chain.call({
    request: "answer yes!",
    schema,
    typeName: "SentimentResponse",
    bound: false,
    verbose: true,
  });
  if (!res.success) {
    console.log(res.message);
  } else {
    console.log(res.data);
  }
  debugger;
});

test("测试TSChain的连续对话", async () => {
  const llm = new LLM({});
  const chain = new TypeScriptChain(llm);
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

test("测试Bound", async () => {
  const llm = new LLM({});
  const schema = `
export interface subsection {
  article: articleSchema[];
  visual_style: styleType; // PPT的风格
  useful_scene: sceneType; // 整篇文章的应用场景
  title: string; // 整篇PPT文稿的标题
  reason: string; // 为什么要这么分段，必须要符合PPT大纲的逻辑
}
export type styleType = "中国风" | "商务风" | "游戏风" | "党政风" | "学术风" | "科技风" | "医疗风" | "插画风" | "节日风";
export type sceneType = "个人演讲" | "企业介绍" | "年中汇报" | "开题报告" | "推广方案" | "新生班会" | "求职竞聘" | "研究报告" | "产品介绍" | "分析调研" | "年会活动" | "总结汇报" | "政治课件" | "月度汇报" | "活动策划" | "科普介绍" | "产品展示" | "历史课件" | "年终总结";
export interface articleSchema {
  content: string; //每一段的文本
  title: string; // 每一段起一个小标题，非常凝练这一段主要的内容是什么，同时与其他段落保持一个一致性的风格
}`;
  const reqMessages: messagesType = [
    {
      role: "system",
      content:
        "你是一个专职PPT文稿大纲处理的助手，将会对user输入的文稿进行分段，并进行中心点提取成小标题。给出整篇PPT文稿的标题、应用场景、风格和为什么要这么分段的理由",
    },
  ];
  const chain = new TypeScriptChain(llm);
  const res = await chain.call({
    request: `
  assistant: 尊敬的各位评审，非常荣幸能够在这里向大家介绍我们的项目：“ChatPPT”，这是一款创新平台，致力于赋能新时代并引领PPT制作革命。
 
 首先，我想强调的是，ChatPPT不仅仅是一个创新平台，它更代表着我们对未来技术的展望和追求。我们相信，随着科技的不断进步和社会的快速发展，传统的PPT制作方式已经无法满足人们对于高效、便 
 捷、互动性的需求。因此，我们创造了ChatPPT这个平台，以改变人们对于PPT制作的认知和体验。
 
 ChatPPT的核心理念是通过人工智能和自然语言处理技术，实现智能化的PPT制作过程。我们的平台将会提供一个与用户实时对话的界面，用户只需要简单地通过语音或文字输入表达自己的想法和要求，ChatPPT就会自动根据用户的意图进行布局、设计和文本生成，从而大大减轻了用户的制作负担。
 
 除此之外，ChatPPT还具备丰富的模板库和素材库，用户可以根据自己的需求选择合适的模板和素材，使得PPT的呈现更加丰富多样。而且，ChatPPT还支持多人协作，用户可以邀请团队成员一同参与PPT的 
 制作，实现更高效的合作和创作。
 
 值得一提的是，ChatPPT不仅适用于个人用户，也可满足企业和教育机构的需求。我们的平台可以定制符合企业和教育机构形象的专属模板，并提供数据分析功能，帮助用户更好地了解观众反馈和PPT效果 
 。
 
 总而言之，ChatPPT是一个具有颠覆性意义的创新平台，它将改变人们对于PPT制作的认知和方式。我们相信，通过ChatPPT，每个人都可以轻松地制作出精美、高效的PPT，并在演讲和展示中获得更好的效 
 果。谢谢大家！`,
    schema,
    typeName: "subsection",
    bound: false,
    verbose: true,
    prompt: reqMessages,
  });
  if (!res.success) {
    console.log(res.message);
  } else {
    console.log(res.data);
  }
  debugger;
}, 1000000);
