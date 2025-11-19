/* 写一个获取天气的 tool ，并使用 llm 绑定和调用 */
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from 'langchain';
import { TavilySearch } from '@langchain/tavily'
import 'dotenv/config'

const llm = new ChatDeepSeek({
	model: 'deepseek-chat',
})

// Tavily 搜索工具
const tavilyTool = new TavilySearch({
  maxResults: 5,
  topic: 'general',
})

const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;

const responseFormat = z.object({
  punny_response: z.string(),
  weather_conditions: z.string().optional(),
})

const checkpointer = new MemorySaver();

// `thread_id` is a unique identifier for a given conversation.
const config = {
  configurable: { thread_id: '1' },
  context: { user_id: '1' },
}

const agent = createAgent({
  model:llm,
  prompt: systemPrompt,
  tools: [tavilyTool],
  responseFormat,
  checkpointer,
})

const response = await agent.invoke(
  { messages: [{ role: 'user', content: 'what is the weather Tesla?' }] },
  config
)
console.log(response.structuredResponse)
