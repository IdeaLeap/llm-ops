import { createMessage } from "@idealeap/gwt";

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
