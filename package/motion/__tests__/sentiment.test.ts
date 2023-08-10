import { LLM } from "../../utils/index.js";
import { TypeScriptChain } from "../index.js";
const llm = new LLM({});
// const schema = `

// // The following is a schema definition for respond with the most concise words, each word carries rich meaning. The content of the response is a joking expression, reflecting the way some young people express their emotions and attitudes on the internet.
// export interface SentimentResponse {
//   // On the Internet, when being criticized, don't run or be afraid. Remember the six-character mantra. Looking at the other side, as soon as they speak, use the word "classic" to counter. If you want to criticize, they want to praise, the word "filial" can piss them off. If they want to argue about truth and falsehood, saying "impatient" will make them collapse. If you don't understand their thoughts, if you can't "hold back", then "laugh". If they are right and you have nothing to say, typing "win" will make you "win". Don't be afraid of them, you have culture, only six words can break everything. Don't care about them, they have many moves, but rely on six words to conquer the world.
//   sentiment: "classic" | "hold back" | "filial" | "happy" | "impatient" | "win"; // classic: refers to the classics, used to express approval or praise someone or something. filial: refers to filial piety, used to express respect or gratitude to parents. impatient: means impatient, used to express dissatisfaction or urge someone or something. happy: means happy, used to express joy or ridicule someone or something. hold back: means can't hold back the laughter, used to express the urge to laugh in response to someone or something. win: means win, used to express success or luck for oneself or others.
// }`;
// request: messageType | string;
// prompt?: messageType[];
// schema?: string;
// typeName?: string;
// bound?: boolean;
// verbose?: boolean;
const chain = TypeScriptChain(llm);
const res = await chain.call({
  request: "answer yes!",
  // schema,
  // typeName: "SentimentResponse",
  bound: false,
  verbose: true,
});
if (!res.success) {
  console.log(res.message);
} else {
  console.log(res.data);
}
debugger;
