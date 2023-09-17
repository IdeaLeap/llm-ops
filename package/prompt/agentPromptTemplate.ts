import { messagesType } from "@idealeap/gwt/llm/index";
import {
  BasePromptTemplate,
  createMessage,
} from "@idealeap/gwt/prompt/basePromptTemplate";
export type InputValues = Record<string, any>;

export type toneStyleType =
  | "Encouraging"
  | "Neutral"
  | "Informative"
  | "Friendly"
  | "Humorous";

export type communicationStyleType =
  | "Formal"
  | "Textbook"
  | "Layman"
  | "Story Telling"
  | "Socratic";

export type levelType =
  | "Elementary (Grade 1-6)"
  | "Middle School (Grade 7-9)"
  | "High School (Grade 10-12)"
  | "Undergraduate"
  | "Graduate (Bachelor Degree)"
  | "Master's"
  | "Doctoral Candidate (Ph.D Candidate)"
  | "Postdoc"
  | "Ph.D";
export type reasoningType =
  | "Deductive"
  | "Inductive"
  | "Abductive"
  | "Analogical"
  | "Causal";
export type languageType = "English" | "Chinese";
export interface AgentPromptTemplateSchema {
  role: string;
  desc?: string; //解释角色
  toneStyle?: toneStyleType;
  communicationStyle?: communicationStyleType;
  level?: levelType;
  field?: string; //领域
  keyRole?: string; //主要作用
  reasoning?: reasoningType; //推理思维方式
  rules?: string | string[];
  reflection?: ReflectionPromptTemplateSchema;
  memory?: MemoryPromptTemplateSchema;
  humanSituation?: string; //输入情景，例如老师是对学生进行操作
  language?: languageType;
  other?: string;
  evaluate?: TeacherEvaluateSchema;
}

export interface MemoryPromptTemplateSchema {
  data?: string | string[];
  tools?: string | string[];
  knowledge?: string | string[];
}

export interface ReflectionPromptTemplateSchema {
  feedback?: string;
  resultTest?: string;
}
export interface TeacherEvaluateSchema {
  items: EvaluateItemSchema[]; //评分规则
  maxScore: number; //每门课程最高分
}
export interface EvaluateItemSchema {
  name: string;
  desc: string;
}

export class AgentPromptTemplate extends BasePromptTemplate {
  returnPrompt?: messagesType;
  role?: string;
  desc?: string;
  toneStyle?: toneStyleType;
  communicationStyle?: communicationStyleType;
  level?: levelType;
  field?: string;
  keyRole?: string;
  reasoning?: reasoningType;
  rules?: string | string[];
  reflection?: ReflectionPromptTemplateSchema;
  memory?: MemoryPromptTemplateSchema;
  humanSituation?: string;
  language?: languageType;
  other?: string;
  evaluate?: TeacherEvaluateSchema;

  constructor({
    role,
    desc,
    toneStyle,
    communicationStyle,
    level,
    field,
    keyRole,
    reasoning,
    rules,
    reflection,
    memory,
    humanSituation,
    language,
    other,
    evaluate,
  }: AgentPromptTemplateSchema) {
    super();
    !!role && (this.role = role);
    !!desc && (this.desc = desc);
    !!toneStyle && (this.toneStyle = toneStyle);
    !!communicationStyle && (this.communicationStyle = communicationStyle);
    !!level && (this.level = level);
    !!field && (this.field = field);
    !!keyRole && (this.keyRole = keyRole);
    !!reasoning && (this.reasoning = reasoning);
    !!rules && (this.rules = rules);
    !!reflection && (this.reflection = reflection);
    !!memory && (this.memory = memory);
    !!humanSituation && (this.humanSituation = humanSituation);
    !!language && (this.language = language);
    !!other && (this.other = other);
    !!evaluate && (this.evaluate = evaluate);
  }
  format() {
    this.returnPrompt = [];
    //你是{role，一名语文教师}。
    let systemPrompt = "";
    !!this.role && (systemPrompt += `You are ${this.role}.`);
    //{desc,你有丰富的专业知识和文学素养，表达能力。}
    !!this.desc && (systemPrompt += `${this.desc}.`);
    //你的能力已经达到了{level,Ph.D}水平。
    !!this.level &&
      (systemPrompt += `You have reached the ${this.level} level.`);
    //你最擅长{field,文本润色}领域，已经达到了世界最佳。
    !!this.field &&
      (systemPrompt += ` You are best in the field of ${this.field} and have reached the best in the world.`);
    //你的沟通风格是{communicationStyle,Textbook}。
    !!this.communicationStyle &&
      (systemPrompt += ` Your communication style is ${this.communicationStyle}.`);
    //你的语气风格是{toneStyle,Encouraging}。
    !!this.toneStyle &&
      (systemPrompt += ` Your tone style is ${this.toneStyle}.`);
    //你的思维方式是{reasoning,Causal}。
    !!this.reasoning &&
      (systemPrompt += ` Your thinking style is ${this.reasoning}.`);
    //你的母语是{language,Chinese}。
    !!this.language &&
      (systemPrompt += ` You must answer the questions in ${this.language}.`);

    !!systemPrompt &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: systemPrompt,
        }),
      );

    //{humanSituation,用户是一名专注于ppt文稿润色的学生}。
    !!this.humanSituation &&
      this.returnPrompt.push(
        createMessage({
          role: "user",
          content: `${this.humanSituation}.`,
        }),
      );

    let rulePrompt = "";
    //你目前的任务是{keyRole,帮助用户，对用户请求润色ppt大纲文本，并根据评分要求分别给出具体分数,还有改进意见}。
    !!this.keyRole &&
      (rulePrompt += `Your current task is to ${this.keyRole}.`);
    //你需要根据以下评分规则对用户的请求进行评分：
    !!this.evaluate &&
      !!this.evaluate.items &&
      !!this.evaluate.maxScore &&
      (rulePrompt += `You need to score the result according to the following scoring rules:\n\`\`\`\n${this.formatEvaluateItem(
        this.evaluate.items,
      )}\n Max score for each rule: ${this.evaluate.maxScore}\n`);
    //你必须遵守以下规则：\`\`\`\n{rules,...}\`\`\`\n
    !!this.rules &&
      (rulePrompt += `You must follow the rules below:\n\`\`\`\n${
        typeof this.rules === "string" ? this.rules : this.rules.join("\n")
      }\n\`\`\`\n`);

    !!rulePrompt &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: rulePrompt,
          name: "system_rules",
        }),
      );

    let feedbackPrompt = "";
    //在进行任务之前，你需要对之前的结果进行反思，从而得出更好的结果：\`\`\`\n{refection.resultTest}\`\`\`\n。
    !!this.reflection &&
      !!this.reflection.resultTest &&
      (feedbackPrompt += `Before proceeding with the task, you need to reflect on the previous results to come up with a better result: \`\`\`\n${this.reflection.resultTest}\n\`\`\`\n`);
    //此外，你需要结合用户的反馈:\`\`\`\n{refection.feedback}\`\`\`\n。
    !!this.reflection &&
      !!this.reflection.feedback &&
      (feedbackPrompt += `In addition, you need to incorporate user feedback:: \`\`\`\n${this.reflection.feedback}\n\`\`\`\n`);

    !!feedbackPrompt &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: feedbackPrompt,
          name: "system_feedback",
        }),
      );

    let memoryPrompt = "";
    //相关的一些知识：\`\`\`\n{memory.data,...}\`\`\`\n。
    !!this.memory &&
      !!this.memory.data &&
      (memoryPrompt += `Some related knowledge:\n\`\`\`\n${
        typeof this.memory.data === "string"
          ? this.memory.data
          : this.memory.data.join("\n")
      }\n\`\`\`\n`);
    //专业领域专家的一些意见:\`\`\`\n{memory.knowledge}\`\`\`\n
    !!this.memory &&
      !!this.memory.knowledge &&
      (memoryPrompt += `Some input from experts in specialized fields:\n\`\`\`\n${
        typeof this.memory.knowledge === "string"
          ? this.memory.knowledge
          : this.memory.knowledge.join("\n")
      }\n\`\`\`\n`);
    //你可以使用以下工具：\`\`\`\n{memory.tools}\`\`\`\n
    !!this.memory &&
      !!this.memory.tools &&
      (memoryPrompt += `You can use the following tools:\n\`\`\`\n${
        typeof this.memory.tools === "string"
          ? this.memory.tools
          : this.memory.tools.join("\n")
      }\n\`\`\`\n`);
    !!memoryPrompt &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: memoryPrompt,
          name: "system_memory",
        }),
      );
    !!this.other &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: `${this.other}`,
          name: "system_others",
        }),
      );
    // console.log(this.returnPrompt);
    return this.returnPrompt;
  }

  formatEvaluateItem(items: EvaluateItemSchema[]) {
    let prompt = "";
    items.forEach((item) => {
      prompt += `{criteria:"${item.name}", description:${item.desc}}\n`;
    });
    return prompt;
  }
}
