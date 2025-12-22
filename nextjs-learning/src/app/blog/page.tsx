import Link from 'next/link';
import { desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { blog } from '@/lib/schema';
import DeleteBlogButton from '@/components/blog/DeleteBlogButton';

const EXCERPT_LENGTH = 120;

export default async function Blog() {
  const posts = await db
    .select()
    .from(blog)
    .orderBy(desc(blog.createdAt));

  if (posts.length === 0) {
    return (
      <div>
        <p>暂无博客，去创建一篇吧！</p>
        <Link href="/blog/new">
          创建博客
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul>
        {posts.map((post) => {
          const excerpt =
            post.content.length > EXCERPT_LENGTH
              ? `${post.content.slice(0, EXCERPT_LENGTH)}...`
              : post.content;

          return (
            <li key={post.id} style={{ marginBottom: '16px' }}>
              <h2>
                <Link
                  href={`/blog/${post.id}`}
                  style={{ textDecoration: 'underline', color: 'inherit' }}
                >
                  {post.title}
                </Link>
              </h2>
              <p style={{ margin: '4px 0', color: '#555' }}>{excerpt}</p>
              <small style={{ color: '#777' }}>
                发布于 {new Date(post.createdAt).toLocaleString()}
              </small>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                <Link
                  href={`/blog/${post.id}/edit`}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #1877f2',
                    color: '#1877f2',
                    textDecoration: 'none',
                  }}
                >
                  编辑
                </Link>
                <DeleteBlogButton id={post.id} />
              </div>
            </li>
          );
        })}
      </ul>
      <Link href="/blog/new">
        创建博客
      </Link>
    </>
  );
}