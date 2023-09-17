import { messagesType } from "@idealeap/gwt/llm/index";
import {
  createMessage,
  BasePromptTemplate,
} from "@idealeap/gwt/prompt/basePromptTemplate";
type languageType = "English" | "Chinese";
export interface polishPromptTemplateSchema {
  toneStyle?: string;
  language?: languageType;
  other?: string;
  evaluate?: string[];
}

export class PolishPromptTemplate extends BasePromptTemplate {
  returnPrompt?: messagesType;
  toneStyle?: string;
  language?: languageType;
  other?: string;
  evaluate?: string[];

  constructor({
    toneStyle,
    language = "Chinese",
    other,
    evaluate,
  }: polishPromptTemplateSchema) {
    super();
    !!toneStyle && (this.toneStyle = toneStyle);
    !!language && (this.language = language);
    !!other && (this.other = other);
    !!evaluate && (this.evaluate = evaluate);
  }
  format() {
    this.returnPrompt = [];
    //你是{role，一名语文教师}。
    let systemPrompt =
      "You are an article polishing teacher, the main task is polishing PPT speech draft.I'll give you a speech, you need to polish it up. Ensure the consistency, logic and grammatical correctness of the speech.";
    //你的语气风格是{toneStyle,Encouraging}。
    !!this.toneStyle &&
      (systemPrompt += ` Please use ${this.toneStyle} language to fully reflect the brief nature of the PPT presentation.`);
    //你的思维方式是{reasoning,Causal}。
    //你的母语是{language,Chinese}。
    !!this.language &&
      (systemPrompt += ` Whatever I offer, I must answer in ${this.language}.`);

    !!this.evaluate &&
      (systemPrompt += ` After answering, please make an objective evaluation of the results. The rating items are [${this.evaluate.join(
        ",",
      )}]`);

    systemPrompt += `Finally, according to the score and results, the next improvement suggestions are given.`;

    !!systemPrompt &&
      this.returnPrompt.push(
        createMessage({
          role: "system",
          content: systemPrompt,
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
}
