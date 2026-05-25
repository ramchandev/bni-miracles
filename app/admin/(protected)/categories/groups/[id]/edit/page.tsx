import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import GroupForm from '@/components/admin/GroupForm';
import type { CategoryGroup } from '@/lib/supabase';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Edit Group — BNI Miracles Admin' };

export default async function EditGroupPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: group } = await supabase
    .from('category_groups')
    .select('*')
    .eq('id', id)
    .single<CategoryGroup>();

  if (!group) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          ← Categories
        </Link>
        <span style={{ color: '#E5E7EB' }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>
          Edit Group: {group.name}
        </h1>
      </div>
      <GroupForm group={group} />
    </div>
  );
}
