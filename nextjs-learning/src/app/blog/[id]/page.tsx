import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { blog } from '@/lib/schema';

import ThumbUpButton from '../thumb-up.tsx/page';

type BlogDetailProps = {
  params: { id: string } | Promise<{ id: string }>;
};

const resolveParams = async (params: BlogDetailProps['params']) => {
  if (params && typeof (params as Promise<unknown>).then === 'function') {
    return params as Promise<{ id: string }>;
  }
  return params as { id: string };
};

export default async function BlogDetail({ params }: BlogDetailProps) {
  const resolvedParams = await resolveParams(params);
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  const [post] = await db.select().from(blog).where(eq(blog.id, id)).limit(1);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p style={{ margin: '12px 0', lineHeight: 1.6 }}>{post.content}</p>
      <small style={{ color: '#555' }}>
        最后更新：{new Date(post.updatedAt).toLocaleString()}
      </small>
      <div style={{ marginTop: '16px' }}>
        <Link
          href={`/blog/${post.id}/edit`}
          style={{
            display: 'inline-block',
            marginBottom: '8px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #1877f2',
            color: '#1877f2',
            textDecoration: 'none',
          }}
        >
          编辑
        </Link>
        <ThumbUpButton id={post.id} initialThumbup={post.thumbup} />
      </div>
    </article>
  );
}