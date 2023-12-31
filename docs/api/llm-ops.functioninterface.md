<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [llm-ops](./llm-ops.md) &gt; [FunctionInterface](./llm-ops.functioninterface.md)

## FunctionInterface interface

**Signature:**

```typescript
export interface FunctionInterface 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [description?](./llm-ops.functioninterface.description.md) |  | string | _(Optional)_ A description of what the function does, used by the model to choose when and how to call the function. |
|  [name](./llm-ops.functioninterface.name.md) |  | string | The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64. |
|  [parameters](./llm-ops.functioninterface.parameters.md) |  | Record&lt;string, unknown&gt; | <p>The parameters the functions accepts, described as a JSON Schema object. See the \[guide\](https://platform.openai.com/docs/guides/gpt/function-calling) for examples, and the \[JSON Schema reference\](https://json-schema.org/understanding-json-schema/) for documentation about the format.</p><p>To describe a function that accepts no parameters, provide the value <code>{&quot;type&quot;: &quot;object&quot;, &quot;properties&quot;: {}}</code>.</p> |

