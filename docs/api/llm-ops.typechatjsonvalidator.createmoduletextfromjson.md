<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [llm-ops](./llm-ops.md) &gt; [TypeChatJsonValidator](./llm-ops.typechatjsonvalidator.md) &gt; [createModuleTextFromJson](./llm-ops.typechatjsonvalidator.createmoduletextfromjson.md)

## TypeChatJsonValidator.createModuleTextFromJson() method

Transform JSON into TypeScript code for validation. Returns a `Success<string>` object if the conversion is successful, or an `Error` object if the JSON can't be transformed. The returned TypeScript source code is expected to be an ECMAScript module that imports one or more types from `"./schema"` and combines those types and a representation of the JSON object in a manner suitable for type-checking by the TypeScript compiler.

**Signature:**

```typescript
createModuleTextFromJson(jsonObject: object): Result<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  jsonObject | object |  |

**Returns:**

[Result](./llm-ops.result.md)<!-- -->&lt;string&gt;
