import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import MembersTable from '@/components/admin/MembersTable';
import {
  buildMemberAdminRows,
  isDanceCardComplete,
  type DanceCardStatusRow,
} from '@/lib/member-profile-status';
import type { Member } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Members — BNI Miracles Admin' };

export default async function AdminMembersPage() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const [{ data: members }, { data: gaRows }, { data: danceCards }] = await Promise.all([
    supabase.from('members').select('*').order('name'),
    admin.from('member_gives_asks').select('member_id'),
    admin
      .from('dance_cards')
      .select(
        'member_id, pdf_generated_at, bio_profession, gains_goals, gains_accomplishments, bio_burning_desire, updated_at'
      ),
  ]);

  const giveAskMemberIds = new Set(
    (gaRows ?? []).map((r: { member_id: string }) => r.member_id)
  );
  const danceCardGeneratedIds = new Set(
    ((danceCards ?? []) as DanceCardStatusRow[])
      .filter(isDanceCardComplete)
      .map((r) => r.member_id)
  );

  const rows = buildMemberAdminRows(
    (members ?? []) as Member[],
    giveAskMemberIds,
    danceCardGeneratedIds
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Members</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>
            {rows.length} member{rows.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/admin/members/new" className="btn-primary text-sm">+ Add Member</Link>
      </div>
      <MembersTable members={rows} />
    </div>
  );
}
