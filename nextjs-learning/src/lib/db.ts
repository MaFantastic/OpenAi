import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 从环境变量获取数据库连接字符串
const connectionString = process.env.DB_URL;

if (!connectionString) {
  throw new Error('DB_URL environment variable is not set');
}

// 创建 postgres 客户端
const client = postgres(connectionString);

// 创建 drizzle 实例
export const db = drizzle(client);

