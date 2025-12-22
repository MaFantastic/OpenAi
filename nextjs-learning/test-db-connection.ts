import 'dotenv/config';
import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    
    // 执行一个简单的查询来测试连接
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as pg_version`);
    
    console.log('✅ 数据库连接成功！');
    console.log('当前时间:', result[0].current_time);
    console.log('PostgreSQL 版本:', result[0].pg_version);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();

