import { LLM, messageType } from "llm-ops/llm/index";
import { Result, error, Error } from "llm-ops/utils/index";
import { createMessage } from "llm-ops/prompt/index";
import {
  TypeChatJsonValidator,
  createJsonValidator,
} from "llm-ops/chain/index";
/**
 * Represents an object that can translate natural language requests in JSON objects of the given type.
 */

export interface TypeScriptChainCallSchema {
  request: messageType | string;
  prompt?: messageType[];
  schema?: string;
  typeName?: string;
  bound?: boolean;
  verbose?: boolean;
}

/**
 * Creates an object that can translate natural language requests into JSON objects of the given type.
 * The specified type argument `T` must be the same type as `typeName` in the given `schema`. The function
 * creates a `TypeChatJsonValidator<T>` and stores it in the `validator` property of the returned instance.
 * @param llm The language model to use for translating requests into JSON.
 * @param schema A string containing the TypeScript source code for the JSON schema.
 * @param typeName The name of the JSON target type in the schema.
 * @returns A `TypeChatJsonTranslator<T>` instance.
 */
export class TypeScriptChain {
  llm: LLM;
  attemptRepair: boolean;

  constructor(llm: LLM) {
    this.llm = llm;
    this.attemptRepair = true;
  }

  createRequestPrompt(validator: TypeChatJsonValidator<any>): messageType {
    return createMessage({
      role: "system",
      content:
        `\nYou need to process user requests and then translates result into JSON objects of type "${validator.typeName}" according to the following TypeScript definitions:\n` +
        `\`\`\`\n${validator.schema}\`\`\`\n` +
        `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
      name: "system_schema",
    });
  }

  createRepairPrompt(validationError: string): messageType {
    return createMessage({
      role: "system",
      content:
        `The JSON object is invalid for the following reason:\n` +
        `"""\n${validationError}\n"""\n` +
        `The following is a revised JSON object:\n`,
      name: "system_validation_fix",
    });
  }

  exportHistory() {
    //剔除 system_validation_fix和system_schema记录
    return this.llm.exportHistory().filter((item) => {
      return (
        item.name !== "system_validation_fix" && item.name !== "system_schema"
      );
    });
  }

  async call(params: TypeScriptChainCallSchema): Promise<Result<any>> {
    const { request, prompt, schema, typeName, bound, verbose } = params;
    let validator: TypeChatJsonValidator<any> | undefined = undefined,
      resPrompt: messageType[] = [],
      request_: messageType | string = request;
    !!schema &&
      !!typeName &&
      (validator = createJsonValidator<any>(schema, typeName));
    !!prompt && (resPrompt = prompt);

    if (bound) {
      if (typeof request_ === "string") {
        request_ = createMessage({
          role: "user",
          content: request_,
        });
      }
      resPrompt.push(request_);
    } else {
      // 如果是字符串，转换成消息对象
      if (typeof request_ === "string") {
        resPrompt.push(
          createMessage({
            role: "user",
            content: request_,
          }),
        );
        !!validator && resPrompt.push(this.createRequestPrompt(validator));
      } else {
        resPrompt.push(request_);
        !!validator && resPrompt.push(this.createRequestPrompt(validator));
      }
    }
    let attemptRepair = this.attemptRepair;
    while (true) {
      let response = await this.llm.chat({
        messages: resPrompt,
      });
      let responseText = response.choices[0]?.message.content;
      if (!responseText) {
        if (verbose) {
          this.llm.printMessage();
        }
        return { success: false, message: responseText } as Error;
      }
      if (!validator || !schema || !typeName) {
        if (verbose) {
          this.llm.printMessage();
        }
        return { success: true, data: responseText } as unknown as Result<any>;
      }
      if (bound) {
        // resPrompt.push(createMessage("assistant", responseText)); //! llm已具有历史对话存储功能
        resPrompt = [];
        !!validator && resPrompt.push(this.createRequestPrompt(validator));
        response = await this.llm.chat({ messages: resPrompt });
        responseText = response.choices[0]?.message.content;
        if (!responseText) {
          if (verbose) {
            this.llm.printMessage();
          }
          return { success: false, message: responseText } as Error;
        }
      }
      responseText = responseText.replace(/\\n/g, "");
      const startIndex = responseText.indexOf("{");
      const endIndex = responseText.lastIndexOf("}");
      if (!(startIndex >= 0 && endIndex > startIndex)) {
        if (verbose) {
          this.llm.printMessage();
        }
        return error(`Response is not JSON:\n${responseText}`);
      }
      const jsonText = responseText.slice(startIndex, endIndex + 1);
      const validation = validator.validate(jsonText);
      if (validation.success) {
        if (verbose) {
          this.llm.printMessage();
        }
        return validation;
      }
      if (!attemptRepair) {
        if (verbose) {
          this.llm.printMessage();
        }
        return error(
          `JSON validation failed: ${validation.message}\n${jsonText}`,
        );
      }
      // resPrompt.push(createMessage("user", responseText));
      resPrompt = []; // 继续对话
      resPrompt.push(this.createRepairPrompt(validation.message));
      attemptRepair = false;
    }
  }
}
