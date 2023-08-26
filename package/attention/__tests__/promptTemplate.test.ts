import { formatPromptTemplate } from "@idealeap/gwt";

test("formatPromptTemplate", async () => {
  const res = await formatPromptTemplate({
    name: "test",
    prompt: [
      "hello word",
      { content: "你好", role: "user" },
      {
        COLLECTION_NAME: "minippt",
        vector: "hello word",
        output_fields: "type",
        limit: 3,
        content: "有没有可能：\n{{vector}}。\n上面这些才是精品！",
      },
    ],
    COLLECTION_NAME: "minippt",
  });
  console.log(res);
  debugger;
});
