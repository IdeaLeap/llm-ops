import { PromptTemplate } from "langchain/prompts";
export type InputValues = Record<string, any>;
export interface AgentPromptTemplateSchema {
  role?: string;
  desc?: string; //解释角色
  toneStyle?:
    | "Encouraging"
    | "Neutral"
    | "Informative"
    | "Friendly"
    | "Humorous"
    | string;
  communicationStyle?:
    | "Formal"
    | "Textbook"
    | "Layman"
    | "Story Telling"
    | "Socratic"
    | string;
  level?:
    | "Elementary (Grade 1-6)"
    | "Middle School (Grade 7-9)"
    | "High School (Grade 10-12)"
    | "Undergraduate"
    | "Graduate (Bachelor Degree)"
    | "Master's"
    | "Doctoral Candidate (Ph.D Candidate)"
    | "Postdoc"
    | "Ph.D"
    | string;
  field?: string; //领域
  keyRole?: string; //主要作用
  reasoning?: string; //推理思维方式
  rules?: string | string[];
  reflection?: ReflectionPromptTemplateSchema;
  memory?: string | string[];
  humanSituation?: string; //输入情景，例如老师是对学生进行操作
  language?: "English" | "Chinese" | string;
  other?: string;
}

export interface MemoryPromptTemplateSchema {
  datas?: string | string[];
  tools?: string | string[];
  knowledge?: string | string[];
}

export interface ReflectionPromptTemplateSchema {
  feedback?: string;
  resultTest?: string | TeacherEvaluateSchema;
}
export interface TeacherEvaluateSchema {
  items: EvaluateItemSchema[]; //评分规则
  maxScore: number; //每门课程最高分
}
export interface EvaluateItemSchema {
  name: string;
  desc: string;
}

export class AgentPromptTemplate {
  returnPrompt = "";
  constructor({ role }: AgentPromptTemplateSchema) {
    !!role &&
      (this.returnPrompt = `
    [configuration]
    You are ${role}
    `);
  }
  fromTemplate(str: string) {
    this.returnPrompt = str;
  }
  async format(values: InputValues) {
    const _ = PromptTemplate.fromTemplate(this.returnPrompt);
    return await _.format(values);
  }
}
