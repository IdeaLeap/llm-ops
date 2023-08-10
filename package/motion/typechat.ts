import { Result, error, Error, LLM } from "../utils/index.js";
import { createMessage, messageType } from "../attention/index.js";
import { TypeChatJsonValidator, createJsonValidator } from "./validate.js";
/**
 * Represents an object that can translate natural language requests in JSON objects of the given type.
 */
export interface TypeScriptChainSchema<T extends object> {
  /**
   * The associated `LLM`.
   */
  llm: LLM;
  /**
   * The associated `TypeChatJsonValidator<T>`.
   */
  validator: TypeChatJsonValidator<T>;
  /**
   * A boolean indicating whether to attempt repairing JSON objects that fail to validate. The default is `true`,
   * but an application can set the property to `false` to disable repair attempts.
   */
  attemptRepair: boolean;
  /**
   * A boolean indicating whether to delete properties with null values from parsed JSON objects. Some language
   * models (e.g. gpt-3.5-turbo) have a tendency to assign null values to optional properties instead of omitting
   * them. The default for this property is `false`, but an application can set the property to `true` for schemas
   * that don't permit null values.
   */
  stripNulls: boolean;
  /**
   * Creates an AI language model prompt from the given request. This function is called by `completeAndValidate`
   * to obtain the prompt. An application can assign a new function to provide a different prompt.
   * @param request The natural language request.
   * @returns A prompt that combines the request with the schema and type name of the underlying validator.
   */
  createRequestPrompt(request?: string): messageType;
  /**
   * Creates a repair prompt to append to an original prompt/response in order to repair a JSON object that
   * failed to validate. This function is called by `completeAndValidate` when `attemptRepair` is true and the
   * JSON object produced by the original prompt failed to validate. An application can assign a new function
   * to provide a different repair prompt.
   * @param validationError The error message returned by the validator.
   * @returns A repair prompt constructed from the error message.
   */
  createRepairPrompt(validationError: string): messageType;
  /**
   * Translates a natural language request into an object of type `T`. If the JSON object returned by
   * the language model fails to validate and the `attemptRepair` property is `true`, a second
   * attempt to translate the request will be made. The prompt for the second attempt will include the
   * diagnostics produced for the first attempt. This often helps produce a valid instance.
   * @param prompt The natural language request.
   * @returns A promise for the resulting object.
   */
  call(
    request: messageType | string,
    prompt?: messageType[],
    bound?: boolean,
  ): Promise<Result<T>>;
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
export function TypeScriptChain<T extends object>(
  llm: LLM,
  schema: string,
  typeName: string,
  verbose = false,
): TypeScriptChainSchema<T> {
  const validator = createJsonValidator<T>(schema, typeName);
  const typeChat: TypeScriptChainSchema<T> = {
    llm,
    validator,
    attemptRepair: true,
    stripNulls: false,
    createRequestPrompt,
    createRepairPrompt,
    call,
  };
  return typeChat;

  function createRequestPrompt(): messageType {
    return createMessage(
      "system",
      `\nYou need to process user requests and then translates result into JSON objects of type "${validator.typeName}" according to the following TypeScript definitions:\n` +
        `\`\`\`\n${validator.schema}\`\`\`\n` +
        `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
      "system_schema",
    );
  }

  function createRepairPrompt(validationError: string) {
    return createMessage(
      "system",
      `The JSON object is invalid for the following reason:\n` +
        `"""\n${validationError}\n"""\n` +
        `The following is a revised JSON object:\n`,
      "system_validation_fix",
    );
  }

  async function call(
    request: messageType | string,
    prompt?: messageType[],
    bound = false,
  ): Promise<Result<T>> {
    !prompt && (prompt = []);
    const resPrompt = prompt;

    if (bound) {
      if (typeof request === "string") {
        request = createMessage("user", request);
      }
      resPrompt.push(request);
    } else {
      // 如果是字符串，转换成消息对象
      if (typeof request === "string") {
        resPrompt.push(createMessage("user", request));
        resPrompt.push(typeChat.createRequestPrompt());
        // request = createMessage("user", request);
      } else {
        resPrompt.push(request);
        resPrompt.push(typeChat.createRequestPrompt());
      }
    }
    let attemptRepair = typeChat.attemptRepair;
    while (true) {
      let response = await llm.chat({ messages: resPrompt });
      let responseText = response.choices[0].message.content;
      if (!responseText) {
        if (verbose) {
          llm.printMessage();
        }
        return { success: false, message: responseText } as Error;
      }
      if (bound) {
        resPrompt.push(createMessage("assistant", responseText));
        resPrompt.push(typeChat.createRequestPrompt());
        response = await llm.chat({ messages: resPrompt });
        responseText = response.choices[0].message.content;
        if (!responseText) {
          if (verbose) {
            llm.printMessage();
          }
          return { success: false, message: responseText } as Error;
        }
      }
      responseText = responseText.replace(/\\n/g, "");
      const startIndex = responseText.indexOf("{");
      const endIndex = responseText.lastIndexOf("}");
      if (!(startIndex >= 0 && endIndex > startIndex)) {
        if (verbose) {
          llm.printMessage();
        }
        return error(`Response is not JSON:\n${responseText}`);
      }
      const jsonText = responseText.slice(startIndex, endIndex + 1);
      const validation = validator.validate(jsonText);
      if (validation.success) {
        if (verbose) {
          llm.printMessage();
        }
        return validation;
      }
      if (!attemptRepair) {
        if (verbose) {
          llm.printMessage();
        }
        return error(
          `JSON validation failed: ${validation.message}\n${jsonText}`,
        );
      }
      resPrompt.push(createMessage("user", responseText));
      resPrompt.push(typeChat.createRepairPrompt(validation.message));
      attemptRepair = false;
    }
  }
}
