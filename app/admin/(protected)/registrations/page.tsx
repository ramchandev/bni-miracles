import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const metadata: Metadata = { title: 'Registrations — BNI Miracles Admin' };

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function RegistrationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: registrations } = await supabase
    .from('meeting_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Meeting Registrations</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>
          {registrations?.length ?? 0} registrations total
        </p>
      </div>

      <div className="card overflow-hidden">
        {!registrations?.length ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-semibold" style={{ color: 'var(--color-dark)' }}>No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Name', 'Phone', 'Meeting Date', 'Registered On'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < registrations.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>{r.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-gray)' }}>
                      <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        {formatDate(r.meeting_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-gray)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
