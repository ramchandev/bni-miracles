'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteGroupAction, deleteCategoryAction } from '@/app/admin/actions/categories';

export function DeleteGroupButton({ id }: { id: string }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm('Delete this group? Categories in it will become ungrouped.')) return;
    startTransition(async () => {
      await deleteGroupAction(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors hover:bg-red-50"
      style={{ color: 'var(--color-primary)' }}
    >
      Delete
    </button>
  );
}

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm('Delete "' + name + '"? This cannot be undone.')) return;
    startTransition(async () => {
      await deleteCategoryAction(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors hover:bg-red-50"
      style={{ color: 'var(--color-primary)' }}
    >
      Delete
    </button>
  );
}
