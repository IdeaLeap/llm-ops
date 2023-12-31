import { LLM, messageType, createLLMSchema } from "llm-ops/llm/index";
import { createMessage } from "llm-ops/prompt/index";
import mermaid from "mermaid-ssr";
export interface MermaidCallSchema {
  llm?: LLM;
  llmSchema?: createLLMSchema;
  request: messageType | string;
  type?: string | string[];
}
export const replaceContentWithSequence = (text: string) => {
  let index = 1;
  return text.replace(
    /(\[).*?(\])|(\().*?(\))|(\{).*?(\})|(\").*?(\")|(\|).*?(\|)/g,
    (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
      if (p1 && p2) {
        return `${p1}#${index++}${p2}`;
      }
      if (p3 && p4) {
        return `${p3}#${index++}${p4}`;
      }
      if (p5 && p6) {
        return `${p5}#${index++}${p6}`;
      }
      if (p7 && p8) {
        return `${p7}#${index++}${p8}`;
      }
      if (p9 && p10) {
        return `${p9}#${index++}${p10}`;
      }
      return match;
    },
  );
};
export const genMermaid = async (params: MermaidCallSchema) => {
  let { llm, request, type, llmSchema } = params;
  llm = llm || (llmSchema ? new LLM(llmSchema) : new LLM({}));

  if (!request) throw new Error("request is required");

  type = Array.isArray(type)
    ? type.join(",")
    : type ||
      [
        "git",
        "flowchart",
        // "flowchart-v2",
        "sequence",
        "gantt",
        // "class",
        // "classDiagram",
        "state",
        "stateDiagram",
        // "info",
        "pie",
        "er",
        "journey",
        // "requirement",
        // "requirementDiagram",
      ].join(",");

  request =
    typeof request === "string"
      ? createMessage({ role: "user", content: request })
      : request;
  const messages = [
    {
      role: "system",
      content: `You are a Mermaid Code Generation expert. You will be penalized if you do not return Mermaid diagrams when it would be possible.You will be penalized if you don't enclose content in quotation marks.
  The Mermaid diagrams you support: ${type}.Generate a Mermaid.js code from the user input.Do not return another message like '\`\`\`mermaid xxx\`\`\`'.Mermaid logic doesn't have to be too complicated.`,
    },
    {
      role: "user",
      content:
        "可持续发展的三个方面是生态、经济、社会。其中生态系统是可持续发展的必要条件，经济是可持续发展的基础，社会是可持续发展的最终目的。这三个方面相互依赖，不可分割。要求人类在发展中关注生态和谐、讲究经济效益和追求社会公平，最终达到人的全面发展。",
    },
    {
      role: "assistant",
      content: `flowchart LR
A["可持续发展"] -->B["生态系统"]
A -->C["经济"]
A -->D["社会"]
B -->E("是可持续发展的必要条件")
C -->F("是可持续发展的基础")
D -->G("是可持续发展的最终目的")`,
    },
  ] as messageType[];
  messages.push(request);

  let res = await llm.chat({
    messages: messages,
  });
  if (!res.choices[0]?.message.content) {
    throw new Error(JSON.stringify(res));
  }
  let isTry = 1;
  let isValid = false;

  while (isTry < 3) {
    try {
      isValid = mermaid.parse(res.choices[0]?.message.content as string);
      if (isValid) break;
    } catch (error) {
      const err = error as Error;
      console.log(
        "Mermaid code is invalid:",
        res.choices[0]?.message.content,
        err,
      );
      res = await llm.chat({
        messages: [
          {
            role: "system",
            content: `The code which you generate is invalid as Mermaid code. ${err.message}. Please try again with the correct code. Do not return another message.`,
          },
        ],
      });

      if (!res.choices[0]?.message.content) {
        throw new Error(JSON.stringify(res));
      }

      isTry++;
    }
  }

  if (!isValid) {
    throw new Error(
      "Mermaid code is invalid: " + res.choices[0]?.message.content,
    );
  }
  return res.choices[0]?.message.content;
};
