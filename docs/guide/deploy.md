# 部署

`llm-ops`作为一款支持`commonjs`、`esm`、`ts`的框架，可以在任何支持`nodejs`的环境中运行，包括`linux`、`macos`、`windows`等。

> 由于部分使用的依赖问题，暂不支持直接在浏览器中部署，之后会改进。

## next/nuxt

虽然`llm-ops`暂时无法直接在浏览器中使用，但是一般也不可能直接在浏览器中使用，防止`api-key`泄露。

在前端，可以使用`next`或者`nuxt`来进行`SSR/CSR`渲染，核心功能防止服务端，前端调用对应函数即可。

这里以next框架为例，介绍如何在前端使用`llm-ops`。

完整项目代码可见[Github](https://github.com/MarleneJiang/llm-ops-preview)

```js
"use server";
import { Pipeline, PipeRegistry, LLM_OPS_CONFIG, EventEmitter } from "llm-ops";
import { useAppContext } from "@/lib/AppContext";
export const llm_ops_run = async (
  schema,
  inputText,
  openaiKey,
  heliconeKey,
) => {
  try {
    LLM_OPS_CONFIG.OPENAI_API_KEY = openaiKey || "";
    !!heliconeKey && (LLM_OPS_CONFIG.HELICONE_AUTH_API_KEY = heliconeKey);
    !!heliconeKey &&
      (LLM_OPS_CONFIG.OPEN_PATH = {
        baseURL: "https://oai.hconeai.com/v1",
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${heliconeKey}`,
        },
      });
    const funcStore = PipeRegistry.init();
    const schemaJson = JSON.parse(schema);
    const pipeline = Pipeline.fromJSON(schemaJson, {}, funcStore);
    const res = await pipeline.execute(inputText);
    return res;
  } catch (e) {
    throw e;
  }
};
```

## laf

`llm-ops`可以直接部署在`serveless`云函数中，这里以`laf`为例，介绍如何在`laf`中使用`llm-ops`。

```ts
import cloud from "@lafjs/cloud";
import { Pipeline, PipeRegistry, SerializablePipelineOptions } from "llm-ops";
export default async function (ctx: FunctionContext) {
  const { schema, input } = ctx.body;
  if (!schema || !input) {
    return { code: "001", msg: "错误输入", data: "" };
  }
  console.log("schema", schema);
  const funcStore = PipeRegistry.init();
  if (!!schema.pipes) {
    const pipeline = Pipeline.fromJSON(
      schema as SerializablePipelineOptions,
      {},
      funcStore,
    );
    const res = await pipeline.execute(input);
    return { code: "200", msg: "", data: res };
  } else {
    return { code: "002", msg: "schema.pipes错误输入", data: "" };
  }
}
```

借助`laf`的能力，我们能够迅速将其部署到云函数中，实现`llm-ops`的在线调用。

完整的laf函数代码可见[函数市场](https://laf.run/market/templates/6517c102d2f60c23eb96807d)
