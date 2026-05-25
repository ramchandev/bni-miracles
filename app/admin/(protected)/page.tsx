import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import StatCard from '@/components/admin/StatCard';

export const metadata: Metadata = { title: 'Dashboard — BNI Miracles Admin' };

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalRegistrations },
    { count: totalContacts },
    { data: recentRegistrations },
    { data: recentContacts },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('meeting_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('meeting_registrations').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>Welcome back to BNI Miracles Admin</p>
        </div>
        <Link href="/admin/members/new" className="btn-primary text-sm">
          + Add Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Members" value={totalMembers ?? 0} icon="👥" />
        <StatCard label="Active Members" value={activeMembers ?? 0} icon="✅" color="#22C55E" />
        <StatCard label="Meeting Registrations" value={totalRegistrations ?? 0} icon="📅" color="var(--color-accent)" />
        <StatCard label="Contact Messages" value={totalContacts ?? 0} icon="✉️" color="#6366F1" />
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--color-dark)' }}>Recent Registrations</h2>
            <Link href="/admin/registrations" className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
              View all →
            </Link>
          </div>
          {!recentRegistrations?.length ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No registrations yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recentRegistrations.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>{r.name}</div>
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>{r.phone}</div>
                  </div>
                  <div className="text-xs font-medium text-right" style={{ color: 'var(--color-accent)' }}>
                    {formatDate(r.meeting_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--color-dark)' }}>Recent Messages</h2>
            <Link href="/admin/contacts" className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
              View all →
            </Link>
          </div>
          {!recentContacts?.length ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No messages yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recentContacts.map((c) => (
                <div key={c.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>{c.name}</div>
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>{formatDate(c.created_at)}</div>
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-gray)' }}>{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
