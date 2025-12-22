'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type BlogData = {
  title: string;
  content: string;
};

type EditBlogFormProps = {
  id: string;
};

export default function EditBlogForm({ id }: EditBlogFormProps) {
  console.log('EditBlogForm', id);
  const router = useRouter();

  const [form, setForm] = useState<BlogData>({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    console.log('useEffect', id);
    if (!id) return;

    let cancelled = false;

    const fetchBlog = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch(`/api/blog/${id}`);
        const data = await response.json();

        if (!response.ok || data?.errno !== 0) {
          throw new Error(data?.message ?? '获取博客失败');
        }

        if (!cancelled) {
          setForm({
            title: data.data.title,
            content: data.data.content,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '获取博客失败');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) {
      setError('缺少博客 ID');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.errno === 0) {
        router.push(`/blog`);
      } else {
        setError(data.message || '更新博客失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新博客失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return <p className="p-6">缺少博客 ID</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">编辑博客</h1>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>加载中...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入博客标题"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              required
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="请输入博客内容"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/blog/${id}`)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

