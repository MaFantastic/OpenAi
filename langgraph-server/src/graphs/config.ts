import dotenv from "dotenv";

// 延迟加载环境变量
dotenv.config();

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
export const DEEPSEEK_API_BASE =
  process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

// 是否启用 PDF 处理节点（保留扩展点）
export const ENABLE_PDF_HANDLER = true;


