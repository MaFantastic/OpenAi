import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";

// 定义天气查询工具
const weatherSchema = z.object({
  location: z.string().describe("城市名称，例如：北京、上海、New York"),
});

// 天气查询工具
const weatherTool: any = new (DynamicStructuredTool as any)({
  name: "get_weather",
  description: "查询指定城市的天气信息，包括温度、天气状况、湿度等",
  schema: weatherSchema,
  func: async ({ location }: z.infer<typeof weatherSchema>) => {
    const weatherData = {
      "北京": { temp: "22°C", condition: "晴朗", humidity: "45%", wind: "东南风 3级" },
      "上海": { temp: "25°C", condition: "多云", humidity: "60%", wind: "东风 2级" },
      "广州": { temp: "28°C", condition: "小雨", humidity: "75%", wind: "南风 4级" },
      "深圳": { temp: "27°C", condition: "多云", humidity: "70%", wind: "南风 3级" },
      "杭州": { temp: "23°C", condition: "晴朗", humidity: "50%", wind: "西北风 2级" },
    };

    const cityKey = Object.keys(weatherData).find(
      (key) => key.includes(location) || location.includes(key)
    ) || location;

    const weather = weatherData[cityKey as keyof typeof weatherData] || {
      temp: "20°C",
      condition: "未知",
      humidity: "50%",
      wind: "微风",
    };

    return `${location}的天气情况：
- 温度：${weather.temp}
- 天气状况：${weather.condition}
- 湿度：${weather.humidity}
- 风力：${weather.wind}`;
  },
});

// 创建 TavilySearch 工具实例
const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});

// 导出工具列表
export const tools = [weatherTool, tavilySearchTool];


