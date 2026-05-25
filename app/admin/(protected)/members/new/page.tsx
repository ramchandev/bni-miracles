import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import MemberForm from '@/components/admin/MemberForm';

export const metadata: Metadata = { title: 'Add Member — BNI Miracles Admin' };

export default async function NewMemberPage() {
  const supabase = await createSupabaseServerClient();
  const { data: catData } = await supabase
    .from('business_categories')
    .select('id, name, icon, group_id, category_groups(name)')
    .order('sort_order');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = (catData ?? []).map((c: any) => ({
    id: c.id as string,
    name: c.name as string,
    icon: c.icon as string,
    group_id: c.group_id as string | null,
    group_name: (Array.isArray(c.category_groups) ? c.category_groups[0]?.name : c.category_groups?.name) as string | null ?? null,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/members" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
          ← Members
        </Link>
        <span style={{ color: '#E5E7EB' }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Add Member</h1>
      </div>
      <MemberForm categories={categories} />
    </div>
  );
}
