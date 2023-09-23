import { createMessage } from "llm-ops";

test("createMessage", () => {
  const res = createMessage({
    role: "system",
    content: "hello {{word}}",
    contentSlots: {
      word: "world",
    },
  });
  console.log(res);
  debugger;
});
