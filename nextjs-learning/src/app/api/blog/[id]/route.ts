import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { blog } from '@/lib/schema';

type RouteParams = {
  params: { id: string };
};

const resolveParams = async (params: RouteParams['params'] | Promise<RouteParams['params']>) => {
  if (params && typeof (params as Promise<unknown>).then === 'function') {
    return params as Promise<RouteParams['params']>;
  }
  return params as RouteParams['params'];
};

const notFoundResponse = NextResponse.json(
  { errno: -1, message: '博客不存在' },
  { status: 404 }
);

export async function GET(request: Request, { params }: RouteParams) {
  // 兼容从路径参数和查询参数获取 id，防止前端未按 /api/blog/:id 传值
  const url = new URL(request.url);
  const resolvedParams = await resolveParams(params);
  const id = resolvedParams?.id ?? url.searchParams.get('id') ?? '';
  console.log(
    'GET blog params:',
    resolvedParams,
    'url:',
    url.toString(),
    'resolved id:',
    id
  );
  if (!id) {
    return NextResponse.json(
      { errno: -1, message: '缺少博客 ID', debug: { params: resolvedParams, url: url.toString() } },
      { status: 400 }
    );
  }

  const [post] = await db.select().from(blog).where(eq(blog.id, id)).limit(1);

  if (!post) {
    return notFoundResponse;
  }

  return NextResponse.json({ errno: 0, data: post }, { status: 200 });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);
  const resolvedParams = await resolveParams(params);
  const id = resolvedParams?.id ?? url.searchParams.get('id') ?? '';

  if (!id) {
    return NextResponse.json({ errno: -1, message: '缺少博客 ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { errno: -1, message: '缺少必填字段: title, content' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(blog)
      .set({
        title,
        content,
      })
      .where(eq(blog.id, id))
      .returning();

    if (!updated) {
      return notFoundResponse;
    }

    return NextResponse.json({ errno: 0, data: updated }, { status: 200 });
  } catch (error) {
    console.error('更新 blog 失败:', error);
    return NextResponse.json(
      { errno: -1, message: error instanceof Error ? error.message : '更新 blog 失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);
  const resolvedParams = await resolveParams(params);
  const id = resolvedParams?.id ?? url.searchParams.get('id') ?? '';

  if (!id) {
    return NextResponse.json({ errno: -1, message: '缺少博客 ID' }, { status: 400 });
  }

  const [deleted] = await db.delete(blog).where(eq(blog.id, id)).returning();

  if (!deleted) {
    return notFoundResponse;
  }

  return NextResponse.json({ errno: 0, data: deleted }, { status: 200 });
}
