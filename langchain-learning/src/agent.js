import { ChatDeepSeek } from '@langchain/deepseek'
import { TavilySearch } from '@langchain/tavily'
import { createAgent, tool } from 'langchain'
import { z } from 'zod'
import 'dotenv/config'

// DeepSeek LLM
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Tavily 搜索工具
const tavilyTool = new TavilySearch({
  maxResults: 5,
  topic: 'general',
})

// 天气工具
const weatherSchema = z.object({
  city: z.string().describe('要查询天气的城市名'),
})
const getWeather = tool(
  async ({ city }) => {
    const fakeWeather = {
      北京: '晴，20°C',
      上海: '多云，22°C',
      广州: '小雨，25°C',
    }
    return fakeWeather[city] || `${city}的天气信息暂不可用`
  },
  {
    name: 'get_weather',
    description: '获取指定城市的天气信息',
    schema: weatherSchema,
  }
)

// 创建 agent，集成 DeepSeek 和工具
const agent = createAgent({
  model: llm,
  tools: [tavilyTool, getWeather],
})

const res = await agent.invoke({
  messages: [
    { role: 'user', content: '查查2025年AI领域的最新进展，并告诉我北京今天的天气' },
  ],
})

console.log(res)
