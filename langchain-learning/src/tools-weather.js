import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

// 定义天气查询 schema
const weatherSchema = z.object({
	city: z.string().describe('要查询天气的城市名'),
})

// 简单模拟天气查询函数
const weatherTool = tool(
	async ({ city }) => {
		// 实际应用可调用真实天气 API，这里仅做演示
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

const llm = new ChatDeepSeek({
	model: 'deepseek-chat',
})

const llmWithTools = llm.bindTools([weatherTool])

const res = await llmWithTools.invoke('北京今天的天气怎么样？')

console.log(res)
