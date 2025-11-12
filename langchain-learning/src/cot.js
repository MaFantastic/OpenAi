/* Cot 思维链*/
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

// 初始化 DeepSeek 模型
const model = new ChatOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat",
  baseURL: "https://api.deepseek.com",
  temperature: 0.7,
});

// Chain-of-Thought 提示词模板
const cotPrompt = PromptTemplate.fromTemplate(`你是一个资深的前端性能优化专家。

问题：{question}

请按照以下步骤逐步分析和回答：

第一步：理解问题
- 网页加载慢可能涉及哪些方面？

第二步：分析根本原因
- 从前端、后端、网络三个维度分析可能的原因

第三步：提出解决方案
- 针对每个原因领域，给出具体的优化方案

第四步：总结答案
- 给出一个完整、清晰的解决方案总结

请逐步思考，最后给出专业的答案。`);

// 创建 Chain
const chain = new LLMChain({
  llm: model,
  prompt: cotPrompt,
});

// 主函数
async function answerInterviewQuestion() {
  const question = "如果一个网页加载速度慢，该如何处理？";

  console.log("🤖 开始使用 Chain-of-Thought 分析问题...\n");
  console.log(`问题: ${question}\n`);
  console.log("=".repeat(60));
  console.log();

  const result = await chain.call({
    question: question,
  });

  console.log("💡 AI 的分析和答案：\n");
  console.log(result.text);
  console.log("\n" + "=".repeat(60));
}

// 运行
answerInterviewQuestion().catch(console.error);