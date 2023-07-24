import { AgentPromptTemplate } from "../agentPromptTemplate.js";
const chatPrompt = new AgentPromptTemplate();
chatPrompt.fromTemplate(`{role}You are a naming consultant for new companies.
What is a good name for a company that makes {product}?`);
const res = await chatPrompt.format({ product: "shoes", role: "human" });

console.log(res);
