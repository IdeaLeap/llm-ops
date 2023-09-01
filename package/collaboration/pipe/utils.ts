import { MaybePromise, PipelineContext } from "@idealeap/gwt";

export type PipeRegistryType = PipeRegistry;

export type Registry = Record<
  string,
  (input: any, context: PipelineContext) => MaybePromise<any>
>;

export class PipeRegistry {
  private registry: Registry = {};

  register(
    type: string,
    callback: (input: any, context: PipelineContext) => MaybePromise<any>,
  ) {
    this.registry[type] = callback;
  }

  get(type: string) {
    return this.registry[type];
  }

  static commonPreProcess = {
    validateData: (input: any, context: PipelineContext) => {
      // 数据验证逻辑
      console.log("validateData", input, context);
      return input;
    },
  };

  static commonPostProcess = {
    logData: (result: any, context: PipelineContext) => {
      console.log(result, context);
      return result;
    },
  };
  static init() {
    const pipeRegistry = new PipeRegistry();
    //遍历commonPreProcess进行pipeRegistry.register注册
    Object.entries(PipeRegistry.commonPreProcess).forEach(([type, fn]) => {
      pipeRegistry.register(type, fn);
    });
    //遍历commonPostProcess进行pipeRegistry.register注册
    Object.entries(PipeRegistry.commonPostProcess).forEach(([type, fn]) => {
      pipeRegistry.register(type, fn);
    });
    return pipeRegistry;
  }
}
