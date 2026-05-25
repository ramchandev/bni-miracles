import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import MemberForm from '@/components/admin/MemberForm';
import type { Member } from '@/lib/supabase';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Edit Member — BNI Miracles Admin' };

export default async function EditMemberPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [
    { data: member },
    { data: givesAsksData },
    { data: catData },
  ] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single<Member>(),
    supabase.from('member_gives_asks').select('*').eq('member_id', id).order('sort_order'),
    supabase
      .from('business_categories')
      .select('id, name, icon, group_id, category_groups(name)')
      .order('sort_order'),
  ]);

  if (!member) notFound();

  const gives = (givesAsksData ?? []).filter((r) => r.type === 'give').map((r) => r.item as string);
  const asks = (givesAsksData ?? []).filter((r) => r.type === 'ask').map((r) => r.item as string);

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
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>
          Edit: {member.name}
        </h1>
      </div>
      <MemberForm member={member} initialGives={gives} initialAsks={asks} categories={categories} />
    </div>
  );
}
