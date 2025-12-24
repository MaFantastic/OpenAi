import dotenv from 'dotenv';
import { DEEPSEEK_API_KEY } from './graphs/config.js';

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 服务器启动中...');
console.log(`环境: ${NODE_ENV}`);
console.log(`端口: ${PORT}`);

// 检查 DeepSeek 配置，未设置时立即退出，避免服务假装可用但随后出现运行时错误
if (!DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY 未配置，请在环境变量或 .env 中设置 DEEPSEEK_API_KEY，然后重启服务');
  process.exit(1);
} else {
  console.log('✅ DEEPSEEK_API_KEY 已配置');
}

// 简单的服务器示例
function startServer() {
  console.log(`\n✨ 服务器运行在 http://localhost:${PORT}`);
  console.log('按 Ctrl+C 停止服务器\n');
}

startServer();

