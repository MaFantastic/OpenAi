import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { blog } from '@/lib/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

const resolveParams = async (params: RouteContext['params']) => {
  if (params && typeof (params as Promise<unknown>).then === 'function') {
    return params as Promise<{ id: string }>;
  }
  return params as { id: string };
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await resolveParams(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ errno: -1, message: '缺少博客 ID' }, { status: 400 });
    }

    const [post] = await db.select().from(blog).where(eq(blog.id, id)).limit(1);
    if (!post) {
      return NextResponse.json({ errno: -1, message: '博客不存在' }, { status: 404 });
    }

    const [updatedBlog] = await db
      .update(blog)
      .set({
        thumbup: post.thumbup + 1,
        updatedAt: new Date(),
      })
      .where(eq(blog.id, id))
      .returning();

    return NextResponse.json({ errno: 0, data: updatedBlog }, { status: 200 });
  } catch (error) {
    console.error('博客点赞失败:', error);
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '博客点赞失败',
      },
      { status: 500 }
    );
  }
}