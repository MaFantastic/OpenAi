/* 使用 TavilySearch 来做网络搜索  */
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { TavilySearch } from "@langchain/tavily";


const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
});

const tavilyTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

// 绑定工具到 LLM
const llmWithTools = llm.bindTools([tavilyTool]);

// 执行一次网络搜索
const res = await llmWithTools.invoke('请帮我搜索一下2025年AI领域的最新进展');
console.log(res);