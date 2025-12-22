"use client";

import { useState, useTransition } from 'react';

type ThumbUpButtonProps = {
  id: string;
  initialThumbup?: number;
};

export default function ThumbUpButton({ id, initialThumbup = 0 }: ThumbUpButtonProps) {
  const [thumbup, setThumbup] = useState(initialThumbup);
  const [isPending, startTransition] = useTransition();

  const handleThumbUp = () => {
    if (!id || isPending) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/blog/thumb-up/${id}`, { method: 'POST' });
        if (!response.ok) {
          throw new Error('Failed to thumb up the blog post.');
        }

        const data = await response.json();
        const newCount = data?.data?.thumbup;
        setThumbup((prev) => (typeof newCount === 'number' ? newCount : prev + 1));
      } catch (error) {
        console.error('Thumb up failed:', error);
        alert('点赞失败，请稍后再试。');
      }
    });
  };

  return (
    <button onClick={handleThumbUp} disabled={isPending}>
      👍 {thumbup} {isPending ? '(处理中...)' : ''}
    </button>
  );
}