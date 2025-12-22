import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools";
import { DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, DEEPSEEK_MODEL } from "./config";

// 延迟初始化模型，避免在 schema 提取时初始化
// 这样可以防止在 LangGraph schema 提取阶段触发模型初始化，导致超时
let modelInstance: ReturnType<ChatOpenAI["bindTools"]> | null = null;

export function getModel() {
  if (!modelInstance) {
    // 检查环境变量（仅在运行时检查，不在模块加载时）
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY 环境变量未设置，请配置 DeepSeek API 密钥");
    }

    // 设置 DeepSeek API 地址
    const apiBase = DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";

    const model = new ChatOpenAI({
      modelName: DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0,
      openAIApiKey: DEEPSEEK_API_KEY,
      configuration: {
        baseURL: apiBase,
      },
    });

    modelInstance = model.bindTools(tools);
  }
  return modelInstance;
}


