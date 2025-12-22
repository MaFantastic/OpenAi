'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type DeleteBlogButtonProps = {
  id: string;
};

export default function DeleteBlogButton({ id }: DeleteBlogButtonProps) {
  console.log('DeleteBlogButton', id);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm('确定要删除这篇博客吗？');
    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/blog/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? '删除失败，请稍后再试');
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除失败，请稍后再试';
      setError(message);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #d33',
          backgroundColor: isPending ? '#f4d7d9' : '#fff',
          color: '#d33',
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? '删除中…' : '删除'}
      </button>
      {error ? (
        <p style={{ color: '#c00', marginTop: '4px', fontSize: '0.9rem' }}>{error}</p>
      ) : null}
    </div>
  );
}

