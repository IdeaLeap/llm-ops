import * as OriginalPipeline from "@idealeap/pipeline";
export * from "@idealeap/pipeline";
export class PipeRegistry extends OriginalPipeline.PipeRegistry {
  constructor() {
    super();
  }
  static override customFn = {
    validateData: (input: any, context: OriginalPipeline.PipelineContext) => {
      // 数据验证逻辑
      console.log("validateData", input, context);
      return input;
    },
  };
}
