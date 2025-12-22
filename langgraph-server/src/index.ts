import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 服务器启动中...');
console.log(`环境: ${NODE_ENV}`);
console.log(`端口: ${PORT}`);

// 示例：使用环境变量
if (process.env.API_KEY) {
  console.log('✅ API_KEY 已配置');
} else {
  console.log('⚠️  API_KEY 未配置');
}

// 简单的服务器示例
function startServer() {
  console.log(`\n✨ 服务器运行在 http://localhost:${PORT}`);
  console.log('按 Ctrl+C 停止服务器\n');
}

startServer();

