import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import MembersTable from '@/components/admin/MembersTable';

export const metadata: Metadata = { title: 'Members — BNI Miracles Admin' };

export default async function AdminMembersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Members</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>
            {members?.length ?? 0} member{members?.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/admin/members/new" className="btn-primary text-sm">+ Add Member</Link>
      </div>
      <MembersTable members={members ?? []} />
    </div>
  );
}
