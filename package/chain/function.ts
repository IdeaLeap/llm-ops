import {
  LLM,
  functionsType,
  function_callType,
  messageType,
} from "llm-ops/llm/index";
import { success, Error } from "llm-ops/utils/index";
import { createMessage } from "llm-ops/prompt/index";
export interface FunctionCallSchema {
  request: messageType | string;
  prompt?: messageType[];
  functions?: functionsType;
  function_call?: function_callType;
  verbose?: boolean;
}

export class FunctionChain {
  llm: LLM;
  constructor(llm: LLM) {
    this.llm = llm;
  }

  async call(params: FunctionCallSchema) {
    const { request, prompt, functions, function_call, verbose } = params;
    let messages: messageType[] = [];
    !!prompt && (messages = prompt);
    if (typeof request === "string") {
      messages.push(
        createMessage({
          role: "user",
          content: request,
        }),
      );
    } else {
      messages.push(request);
    }
    const res = await this.llm.chat({
      messages: messages,
      functions: functions || undefined,
      function_call: function_call || undefined,
    });
    if (verbose) {
      this.llm.printMessage();
    }
    const responseText = res.choices[0]?.message.content;
    if (!responseText && !!res.choices[0]?.message.function_call) {
      const return_res = JSON.parse(
        res.choices[0].message.function_call.arguments,
      );
      return success(return_res);
    }
    if (!responseText) {
      return { success: false, message: responseText } as Error;
    }
    return success(responseText);
  }
  exportHistory() {
    return this.llm.exportHistory();
  }
}
