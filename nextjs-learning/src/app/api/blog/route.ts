import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { db } from '@/lib/db';
import { blog, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * 创建 blog 接口
 * POST /api/blog
 * Body: { title: string, content: string, userId: string }
 */
export async function POST(request: Request) {
  try {
    // 从 request 获取数据
    const body = await request.json();
    const { title, content, userId } = body;

    // 验证必填字段
    if (!title || !content || !userId) {
      return NextResponse.json(
        { errno: -1, message: '缺少必填字段: title, content, userId' },
        { status: 400 }
      );
    }

    // 检查用户是否存在，如果不存在则创建
    let finalUserId = userId;
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existingUser.length === 0) {
      // 用户不存在，创建默认用户
      try {
        const newUser = {
          id: userId,
          username: `user_${userId}`,
          email: `user_${userId}@example.com`,
        };
        await db.insert(users).values(newUser);
        console.log(`创建了默认用户: ${userId}`);
      } catch (userError) {
        // 如果创建用户失败（可能是并发创建），再次检查用户是否存在
        const retryUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (retryUser.length === 0) {
          return NextResponse.json(
            { errno: -1, message: `无法创建或找到用户: ${userId}` },
            { status: 400 }
          );
        }
      }
    }

    // 创建 blog 数据
    const newBlog = {
      id: randomUUID(),
      title,
      content,
      userId: finalUserId,
    };

    // 插入数据库
    const insertedBlog = await db.insert(blog).values(newBlog).returning();

    // 成功返回
    return NextResponse.json(
      { errno: 0, data: insertedBlog[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建 blog 失败:', error);
    
    // 失败返回
    return NextResponse.json(
      { 
        errno: -1, 
        message: error instanceof Error ? error.message : '创建 blog 失败' 
      },
      { status: 500 }
    );
  }
}

