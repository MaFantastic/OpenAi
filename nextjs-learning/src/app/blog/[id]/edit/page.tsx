import { notFound } from 'next/navigation';
import EditBlogForm from './EditBlogForm';

type EditBlogPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams =
    typeof (params as Promise<unknown>).then === 'function'
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const id = resolvedParams?.id;
  if (!id) {
    notFound();
  }

  return <EditBlogForm id={id} />;
}

