import {
  messageFunctionCallType,
  messageType,
  messagesType,
} from "../utils/index.js";
export function createMessage(
  role: "system" | "user" | "assistant" | "function",
  content: string,
  name?: string,
  function_call?: messageFunctionCallType | undefined,
): messageType {
  return {
    role: role,
    content: content,
    function_call: function_call || undefined,
    name: name || undefined,
  };
}

export abstract class BasePromptTemplate {
  abstract format(): messagesType; // 抽象方法必须在派生类中实现
}
