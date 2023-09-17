import {
  messageFunctionCallType,
  messageType,
  messagesType,
} from "@idealeap/gwt/llm/index";
export interface createMessageSchema {
  role?: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  function_call?: messageFunctionCallType;
  contentSlots?: Record<string, any>;
}
export function createMessage(params: createMessageSchema): messageType {
  const { role, content, name, function_call, contentSlots } = params;
  const newContent = content.replace(
    /{{(.*?)}}/g,
    (_, match) => (!!contentSlots && contentSlots[match.trim()]) || "",
  );
  return {
    role: role || "user",
    content: newContent,
    function_call: function_call || undefined,
    name: name || undefined,
  };
}

export abstract class BasePromptTemplate {
  abstract format(): messagesType; // 抽象方法必须在派生类中实现
}
