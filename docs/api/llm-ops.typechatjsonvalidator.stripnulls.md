<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [llm-ops](./llm-ops.md) &gt; [TypeChatJsonValidator](./llm-ops.typechatjsonvalidator.md) &gt; [stripNulls](./llm-ops.typechatjsonvalidator.stripnulls.md)

## TypeChatJsonValidator.stripNulls property

A boolean indicating whether to delete properties with null values from JSON objects. Some language models (e.g. gpt-3.5-turbo) have a tendency to assign null values to optional properties instead of omitting them. The default for this property is `false`<!-- -->, but an application can set the property to `true` for schemas that don't permit null values.

**Signature:**

```typescript
stripNulls: boolean;
```
