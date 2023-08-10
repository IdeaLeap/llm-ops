import { Result, success, Error, LLM } from "../utils/index.js";
import { createMessage, messageType } from "../attention/index.js";
import { functionsType, function_callType } from "../utils/index.js";
export interface FunctionCallSchema {
  request: messageType | string;
  prompt?: messageType[];
  functions?: functionsType;
  function_call?: function_callType;
  verbose?: boolean;
}
export interface FunctionSchema<T extends object> {
  llm: LLM;
  call(params: FunctionCallSchema): Promise<Result<T>>;
}

export function FunctionChain<T extends object>(llm: LLM): FunctionSchema<T> {
  const Function: FunctionSchema<T> = {
    llm,
    call,
  };
  return Function;

  async function call(params: FunctionCallSchema): Promise<Result<T>> {
    const { request, prompt, functions, function_call, verbose } = params;
    let messages: messageType[] = [];
    !!prompt && (messages = prompt);
    if (typeof request === "string") {
      messages.push(createMessage("user", request));
    } else {
      messages.push(request);
    }
    const res = await llm.chat({
      modelName: "gpt-3.5-turbo",
      messages: messages,
      functions: functions || undefined,
      function_call: function_call || undefined,
    });
    if (verbose) {
      llm.printMessage();
    }
    const responseText = res.choices[0].message.content;
    if (!responseText && !!res.choices[0].message.function_call) {
      const return_res = JSON.parse(
        res.choices[0].message.function_call.arguments as string,
      );
      return success(return_res as T);
    }
    if (!responseText) {
      return { success: false, message: responseText } as Error;
    }
    return success(responseText as unknown as T);
  }
}
