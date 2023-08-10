import OpenAI from "openai";
export type funcCallType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message.FunctionCall;
export type messageType =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message;
export function createMessage(
  role: "system" | "user" | "assistant" | "function",
  content: string,
  name?: string,
  function_call?: funcCallType,
): messageType {
  return {
    role: role,
    content: content,
    function_call: function_call || undefined,
    name: name || undefined,
  };
}

export abstract class BasePromptTemplate {
  abstract format(): OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message[]; // 抽象方法必须在派生类中实现
}